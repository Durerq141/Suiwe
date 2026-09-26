// Structure behind the skin: underbody pan cut from the skin's own bottom outline,
// wheel-well liners, engine-bay sheet metal, B-pillars, sills, trunk tub, cabin floor,
// running gear and exhaust. Nothing here may poke outside the body silhouette.
import { type BufferGeometry, Float32BufferAttribute, BufferGeometry as BG, ShapeUtils, Vector2, Vector3 } from 'three';
import { DIMS } from '../dims';
import { bodySkin } from './skin';
import { fromSide, fromTop } from './surface';
import { boundaryLoops } from '../mesh/solidify';
import { box, cyl, grid, merge, mirrorX, rbox, tube, type P3 } from '../mesh/prims';

export type RoleGeo = Record<string, BufferGeometry[]>;
const push = (r: RoleGeo, role: string, ...g: (BufferGeometry | null)[]) => { for (const x of g) if (x) (r[role] ??= []).push(x); };

const LINER_X = 0.56;

function liner(zc: number, side: 1 | -1): BufferGeometry {
  const r = DIMS.archR + 0.018;
  const x0 = LINER_X * side, x1 = 0.955 * side;
  const n = 24;
  const arc = (x: number, rr: number): P3[] => {
    const row: P3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = -0.18 + (Math.PI + 0.36) * (i / n);
      row.push([x, DIMS.archY + Math.sin(a) * rr, zc + Math.cos(a) * rr]);
    }
    return row;
  };
  const shell = grid([arc(x1, r), arc(x0, r)], false, side < 0);
  const wall: P3[][] = [arc(x0, r), arc(x0, r).map(([x, , z]) => [x, DIMS.archY - 0.07, z] as P3)];
  return merge([shell, grid(wall, false, side > 0)]);
}

/** Underbody: the skin's bottom boundary, notched around the wheels, triangulated flat-ish. */
function underPan(): BufferGeometry[] {
  const skin = bodySkin();
  const all: number[] = [];
  for (const list of skin.facesByTag.values()) all.push(...list);
  const loops = boundaryLoops(skin.mesh, all);
  const loop = loops.sort((a, b) => b.length - a.length)[0];
  const pts: Vector3[] = [];
  const inArch = (p: Vector3) => [DIMS.axleF, DIMS.axleR].some((za) => Math.abs(p.z - za) < DIMS.archR + 0.035) && p.y > 0.3;
  for (const v of loop) {
    const p = new Vector3(skin.mesh.pos[v * 3], skin.mesh.pos[v * 3 + 1], skin.mesh.pos[v * 3 + 2]);
    if (inArch(p)) pts.push(new Vector3(Math.sign(p.x) * LINER_X, DIMS.archY - 0.07, p.z));
    else pts.push(new Vector3(p.x * 0.985, p.y + 0.012, p.z - Math.sign(p.z) * 0.012));
  }
  // drop consecutive duplicates in plan (notch walls are vertical)
  const flat: Vector3[] = [];
  for (const p of pts) {
    const q = flat[flat.length - 1];
    if (!q || Math.hypot(p.x - q.x, p.z - q.z) > 0.004) flat.push(p);
  }
  const contour = flat.map((p) => new Vector2(p.x, p.z));
  const tris = ShapeUtils.triangulateShape(contour, []);
  const down: number[] = [], up: number[] = [];
  for (const [a, b, c] of tris) {
    const A = flat[a], B = flat[b], C = flat[c];
    const ny = (B.z - A.z) * (C.x - A.x) - (B.x - A.x) * (C.z - A.z);
    const tri = ny < 0 ? [A, B, C] : [A, C, B];
    for (const p of tri) down.push(p.x, p.y, p.z);
    for (const p of [tri[0], tri[2], tri[1]]) up.push(p.x, p.y + 0.004, p.z);
  }
  const mk = (arr: number[]) => { const g = new BG(); g.setAttribute('position', new Float32BufferAttribute(arr, 3)); g.computeVertexNormals(); return g; };
  return [mk(down), mk(up)];
}

/** B-pillar between the door openings, just inside the door frames. */
function bPillar(): RoleGeo {
  const r: RoleGeo = {};
  const z = DIMS.zDoorSplit;
  const rows: P3[][] = [];
  for (let i = 0; i <= 14; i++) {
    const y = 0.33 + (1.4 - 0.33) * (i / 14);
    const h = fromSide(1, z, y);
    if (!h) continue;
    const xo = h.p.x - 0.03, xi = h.p.x - 0.13;
    rows.push([[xo, y, z + 0.045], [xo, y, z - 0.045], [xi, y, z - 0.05], [xi, y, z + 0.05]]);
  }
  const g = grid(rows, true);
  push(r, 'paintIn', g, mirrorX(g));
  const trim: P3[][] = rows.map((row) => [
    [row[3][0] - 0.004, row[3][1], z + 0.06], [row[3][0] - 0.022, row[3][1], z], [row[3][0] - 0.004, row[3][1], z - 0.06],
  ]);
  if (trim.length > 1) { const t = grid(trim, false, true); push(r, 'trim', t, mirrorX(t)); }
  // seat-belt webbing and upper anchor
  const x = rows[rows.length - 3][3][0] - 0.03;
  const belt = merge([rbox(0.012, 0.84, 0.045, 0.004, x - 0.01, 0.82, z - 0.075, -0.06), rbox(0.03, 0.06, 0.035, 0.01, x, 1.22, z - 0.06)]);
  push(r, 'black', belt, mirrorX(belt));
  return r;
}

function exhaust(): BufferGeometry[] {
  // downpipe -> cat -> centre pipe in the tunnel -> muffler -> twin tips
  const out = [tube([[0.02, 0.36, 1.25], [0.02, 0.2, 1.05], [0.02, 0.19, 0.6], [0.03, 0.2, -0.9], [0.1, 0.22, -1.6]], 0.026, 12), rbox(0.14, 0.12, 0.34, 0.05, 0.02, 0.19, 0.78)];
  out.push(rbox(0.8, 0.16, 0.3, 0.07, 0, 0.27, -2.28));
  for (const s of [1, -1]) out.push(tube([[0.1, 0.22, -1.6], [0.3 * s, 0.24, -1.95], [0.32 * s, 0.26, -2.14]], 0.024, 10));
  for (const s of [1, -1]) out.push(tube([[0.38 * s, 0.27, -2.42], [0.5 * s, 0.28, -2.52], [0.5 * s, 0.285, -2.62]], 0.024, 10));
  return out;
}

/** Subframes, suspension, drive shafts, tank and exhaust (the game's "frame" group). */
export function runningGear(): RoleGeo {
  const r: RoleGeo = {};
  const { axleF, axleR, track } = DIMS;
  push(r, 'frame', rbox(1.0, 0.06, 0.12, 0.02, 0, 0.23, axleF + 0.18), rbox(1.0, 0.06, 0.12, 0.02, 0, 0.23, axleF - 0.2), rbox(0.08, 0.06, 0.5, 0.02, 0.44, 0.23, axleF), rbox(0.08, 0.06, 0.5, 0.02, -0.44, 0.23, axleF));
  for (const s of [1, -1]) {
    push(r, 'susp', tube([[0.46 * s, 0.23, axleF + 0.16], [(track - 0.1) * s, 0.25, axleF], [0.46 * s, 0.23, axleF - 0.18]], 0.018, 8));
    push(r, 'susp', cyl([(track - 0.12) * s, 0.36, axleF], [0.6 * s, 0.86, axleF - 0.02], 0.03, 0.026, 14));
    push(r, 'spring', cyl([(track - 0.15) * s, 0.55, axleF - 0.005], [0.62 * s, 0.78, axleF - 0.015], 0.07, 0.07, 18, true));
    push(r, 'susp', tube([[0.05 * s, 0.27, axleF - 0.1], [(track - 0.12) * s, 0.34, axleF]], 0.013, 8));
    push(r, 'susp', tube([[0.55 * s, 0.26, axleR + 0.45], [(track - 0.13) * s, 0.3, axleR]], 0.03, 10));
    push(r, 'susp', cyl([(track - 0.15) * s, 0.3, axleR - 0.08], [(track - 0.2) * s, 0.72, axleR - 0.14], 0.025, 0.022, 12));
    push(r, 'spring', cyl([(track - 0.25) * s, 0.3, axleR + 0.02], [(track - 0.25) * s, 0.5, axleR + 0.02], 0.065, 0.065, 18, true));
    push(r, 'susp', cyl([0.12 * s, 0.35, axleF - 0.02], [(track - 0.1) * s, DIMS.wheelR, axleF], 0.018, 0.018, 10));
  }
  push(r, 'susp', cyl([-(track - 0.13), 0.3, axleR + 0.05], [track - 0.13, 0.3, axleR + 0.05], 0.035, 0.035, 12));
  push(r, 'frame', rbox(0.9, 0.2, 0.42, 0.05, 0, 0.37, axleR + 0.45));
  push(r, 'exhaust', ...exhaust());
  return r;
}

export function buildClosures(): RoleGeo {
  const r: RoleGeo = {};
  const { axleF, axleR } = DIMS;
  push(r, 'under', ...underPan());
  for (const s of [1, -1] as const) push(r, 'liner', liner(axleF, s), liner(axleR, s));

  // engine bay: firewall, plenum, aprons with strut towers, radiator support
  const bay: BufferGeometry[] = [box(1.62, 0.6, 0.03, 0, 0.62, 0.935), box(1.62, 0.03, 0.12, 0, 0.915, 0.985, 0.18), box(1.26, 0.08, 0.06, 0, 0.87, 2.1)];
  for (const s of [1, -1]) {
    bay.push(box(0.03, 0.44, 1.12, 0.6 * s, 0.63, 1.55));
    bay.push(box(0.23, 0.025, 1.12, 0.715 * s, 0.855, 1.55, 0, 0, -0.06 * s));
    bay.push(cyl([0.62 * s, 0.8, axleF - 0.02], [0.6 * s, 0.9, axleF - 0.02], 0.085, 0.075, 24));
    bay.push(box(0.06, 0.5, 0.06, 0.6 * s, 0.63, 2.12));
  }
  push(r, 'paintIn', ...bay);
  for (const s of [1, -1]) push(r, 'black', cyl([0.6 * s, 0.9, axleF - 0.02], [0.6 * s, 0.912, axleF - 0.02], 0.045, 0.045, 20));

  // trunk tub
  push(r, 'carpet',
    box(1.5, 0.03, 1.02, 0, 0.5, -2.2),
    box(1.56, 0.5, 0.03, 0, 0.76, -1.68),
    box(0.03, 0.44, 0.98, 0.76, 0.73, -2.2),
    box(0.03, 0.44, 0.98, -0.76, 0.73, -2.2),
    box(1.46, 0.36, 0.03, 0, 0.68, -2.7),
  );
  push(r, 'trim', box(1.42, 0.05, 0.05, 0, 0.87, -2.68));
  push(r, 'trim', box(1.56, 0.02, 0.46, 0, 1.045, -1.89, -0.1));
  for (const s of [1, -1]) push(r, 'black', cyl([0.45 * s, 1.058, -1.95], [0.45 * s, 1.064, -1.95], 0.075, 0.075, 24));

  // cabin floor with tunnel, firewall insulation, kick panels, sills, rear seat base
  push(r, 'carpet',
    box(1.66, 0.03, 2.58, 0, DIMS.yFloor, -0.36),
    box(0.26, 0.16, 2.1, 0, DIMS.yFloor + 0.08, -0.2),
    box(1.5, 0.3, 0.03, 0, 0.44, 0.88, -0.5),
    box(1.46, 0.14, 0.5, 0, DIMS.yFloor + 0.08, -1.14),
  );
  for (const s of [1, -1]) {
    push(r, 'trim', box(0.1, 0.3, 0.28, 0.79 * s, 0.46, 0.76));
    push(r, 'black', rbox(0.14, 0.07, 1.95, 0.02, 0.78 * s, 0.325, -0.28));
  }

  for (const [role, list] of Object.entries(bPillar())) push(r, role, ...list);
  // roof-rail inner trims above the door openings
  const rail: P3[] = [];
  for (let i = 0; i <= 12; i++) {
    const z = 0.08 - (1.4 * i) / 12;
    const h = fromTop(0.7, z, ['roof']);
    if (h) rail.push([0.71, h.p.y - 0.055, z]);
  }
  if (rail.length > 2) { const t = tube(rail, 0.028, 8); push(r, 'headliner', t, mirrorX(t)); }
  return r;
}
