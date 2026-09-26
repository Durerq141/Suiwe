// Lamp internals behind the lenses that are cut from the body skin: housings,
// reflectors, projector modules, LED light guides, indicators and reverse lamps.
import { type BufferGeometry, Vector3 } from 'three';
import { type BodySkin } from '../body/skin';
import { type Tag } from '../body/cage';
import { cyl, fan, grid, lathe, tube, type P3 } from '../mesh/prims';
import { boundaryLoops } from '../mesh/solidify';

export type RoleGeo = Record<string, BufferGeometry[]>;
const add = (r: RoleGeo, role: string, ...g: BufferGeometry[]) => { (r[role] ??= []).push(...g); };

interface Region { faces: number[]; centroid: Vector3; normal: Vector3; loop: Vector3[] }

function region(skin: BodySkin, tag: Tag): Region {
  const faces = skin.facesByTag.get(tag) ?? [];
  const c = new Vector3(), n = new Vector3();
  let cnt = 0;
  for (const f of faces) for (let k = 0; k < 4; k++) {
    const v = skin.mesh.quads[f * 4 + k];
    c.x += skin.mesh.pos[v * 3]; c.y += skin.mesh.pos[v * 3 + 1]; c.z += skin.mesh.pos[v * 3 + 2];
    n.x += skin.normals[v * 3]; n.y += skin.normals[v * 3 + 1]; n.z += skin.normals[v * 3 + 2];
    cnt++;
  }
  c.divideScalar(cnt);
  n.normalize();
  const loops = boundaryLoops(skin.mesh, faces);
  const longest = loops.sort((a, b) => b.length - a.length)[0] ?? [];
  const loop = longest.map((v) => new Vector3(skin.mesh.pos[v * 3], skin.mesh.pos[v * 3 + 1], skin.mesh.pos[v * 3 + 2]));
  return { faces, centroid: c, normal: n, loop };
}

/** Back tray of a lamp: the lens outline pushed inwards along -n, closed by a back plate. */
function tray(reg: Region, depth: number): BufferGeometry[] {
  const pts = (a: Vector3[]) => a.map((p) => [p.x, p.y, p.z] as P3);
  const front = pts(reg.loop.map((p) => p.clone().addScaledVector(reg.normal, -0.01)));
  const back = pts(reg.loop.map((p) => p.clone().addScaledVector(reg.normal, -depth)));
  return [grid([front, back], true), fan(back)];
}

/** Points along the lower part of a lens outline, inset towards the centroid. */
function lowerGuide(reg: Region, inset: number, depth: number, fraction = 0.45): P3[] {
  const ys = reg.loop.map((p) => p.y);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const lim = minY + (maxY - minY) * fraction;
  // longest run of consecutive loop points under the limit
  const n = reg.loop.length;
  let best: number[] = [];
  for (let s = 0; s < n; s++) {
    if (reg.loop[s].y > lim || reg.loop[(s - 1 + n) % n].y <= lim) continue;
    const run: number[] = [];
    for (let k = 0; k < n && reg.loop[(s + k) % n].y <= lim; k++) run.push((s + k) % n);
    if (run.length > best.length) best = run;
  }
  if (best.length < 3) best = reg.loop.map((_, i) => i).slice(0, Math.floor(n / 2));
  return best.map((i) => {
    const p = reg.loop[i].clone();
    p.lerp(reg.centroid, inset).addScaledVector(reg.normal, -depth);
    return [p.x, p.y, p.z] as P3;
  });
}

export function headlightInternals(skin: BodySkin, side: 'l' | 'r'): RoleGeo {
  const r: RoleGeo = {};
  const reg = region(skin, `headlight_${side}` as Tag);
  if (!reg.faces.length) return r;
  add(r, 'lampHousing', ...tray(reg, 0.11));
  const s = side === 'l' ? 1 : -1;
  const n = reg.normal;
  // projector (inner) and reflector bowl (outer)
  const inner = reg.centroid.clone().add(new Vector3(-0.07 * s, 0.005, 0.01)).addScaledVector(n, -0.05);
  const outer = reg.centroid.clone().add(new Vector3(0.075 * s, 0.0, -0.06)).addScaledVector(n, -0.055);
  const ax = (p: Vector3, d: number): [P3, P3] => [[p.x, p.y, p.z], [p.x + n.x * d, p.y + n.y * d, p.z + n.z * d]];
  const [pa, pb] = ax(inner, 0.05);
  add(r, 'lampChrome', cyl(pa, pb, 0.036, 0.04, 28, true));
  add(r, 'lens', lathe([[0.001, 0.035], [0.02, 0.03], [0.03, 0.018], [0.034, 0]].map(([a, b]) => [a, b] as [number, number]), pb, [pb[0] + n.x, pb[1] + n.y, pb[2] + n.z], 24));
  add(r, 'lamp', cyl([pb[0] + n.x * 0.002, pb[1] + n.y * 0.002, pb[2] + n.z * 0.002], [pb[0] + n.x * 0.004, pb[1] + n.y * 0.004, pb[2] + n.z * 0.004], 0.028, 0.028, 24));
  const [oa] = ax(outer, 0);
  add(r, 'reflector', lathe([[0.012, 0], [0.03, 0.01], [0.045, 0.028], [0.052, 0.05]].map(([a, b]) => [a, b] as [number, number]), oa, [oa[0] + n.x, oa[1] + n.y, oa[2] + n.z], 32));
  add(r, 'lamp', cyl(oa, [oa[0] + n.x * 0.02, oa[1] + n.y * 0.02, oa[2] + n.z * 0.02], 0.008, 0.008, 12));
  // LED daytime running light guide along the lower edge + amber indicator at the corner
  const guide = lowerGuide(reg, 0.12, 0.012, 0.42);
  if (guide.length > 2) add(r, 'drl', tube(guide, 0.0055, 8));
  return r;
}

export function taillightInternals(skin: BodySkin, side: 'l' | 'r'): RoleGeo {
  const r: RoleGeo = {};
  const reg = region(skin, `taillight_${side}` as Tag);
  if (!reg.faces.length) return r;
  add(r, 'lampHousing', ...tray(reg, 0.09));
  const n = reg.normal;
  // LED light guides: two loops following the outline
  for (const [inset, depth] of [[0.14, 0.012], [0.34, 0.018]] as const) {
    const ring = reg.loop.map((p) => p.clone().lerp(reg.centroid, inset).addScaledVector(n, -depth));
    add(r, 'tailGlow', tube([...ring, ring[0]].map((p) => [p.x, p.y, p.z] as P3), 0.005, 8));
  }
  // chrome reflector cups behind the lens, white reverse section at the inner end
  const s = side === 'l' ? 1 : -1;
  for (const [dx, rr] of [[0.06, 0.036], [-0.02, 0.032]] as const) {
    const c = reg.centroid.clone().add(new Vector3(dx * s, 0, 0)).addScaledVector(n, -0.06);
    add(r, 'lampChrome', lathe([[0.008, 0], [0.02, 0.008], [rr, 0.024], [rr + 0.004, 0.04]], [c.x, c.y, c.z], [c.x + n.x, c.y + n.y, c.z + n.z], 28));
    add(r, 'tailGlow', cyl([c.x, c.y, c.z], [c.x + n.x * 0.012, c.y + n.y * 0.012, c.z + n.z * 0.012], 0.008, 0.008, 10));
  }
  const rev = reg.centroid.clone().add(new Vector3(-0.1 * s, -0.005, 0)).addScaledVector(n, -0.035);
  add(r, 'lampChrome', lathe([[0.006, 0], [0.018, 0.008], [0.03, 0.022], [0.033, 0.032]], [rev.x, rev.y, rev.z], [rev.x + n.x, rev.y + n.y, rev.z + n.z], 24));
  add(r, 'reverse', cyl([rev.x + n.x * 0.026, rev.y + n.y * 0.026, rev.z + n.z * 0.026], [rev.x + n.x * 0.03, rev.y + n.y * 0.03, rev.z + n.z * 0.03], 0.032, 0.032, 20));
  return r;
}
