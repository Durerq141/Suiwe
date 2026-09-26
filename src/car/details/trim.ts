// Exterior hardware, every piece anchored on the exact skin surface (body/surface.ts).
import { type BufferGeometry, Matrix4, Vector3 } from 'three';
import { bodySkin } from '../body/skin';
import { type Tag } from '../body/cage';
import { fromBelow, fromFront, fromRear, fromSide, fromTop, type Hit } from '../body/surface';
import { boundaryLoops } from '../mesh/solidify';
import { box, cyl, grid, lathe, merge, mirrorX, rbox, tube, type P3 } from '../mesh/prims';

export type RoleGeo = Record<string, BufferGeometry[]>;
const add = (r: RoleGeo, role: string, ...g: (BufferGeometry | null | undefined)[]) => { for (const x of g) if (x) (r[role] ??= []).push(x); };
const UP = new Vector3(0, 1, 0);

/** Local frame on a hit: Z = outward normal, Y = `up` projected, X = Y x Z. */
export function frameMatrix(h: Hit, up = UP, lift = 0): Matrix4 {
  const z = h.n.clone().normalize();
  const y = up.clone().addScaledVector(z, -up.dot(z)).normalize();
  const x = new Vector3().crossVectors(y, z).normalize();
  const m = new Matrix4().makeBasis(x, y, z);
  m.setPosition(h.p.clone().addScaledVector(z, lift));
  return m;
}
const at = (g: BufferGeometry, m: Matrix4) => g.applyMatrix4(m);
const P = (v: Vector3): P3 => [v.x, v.y, v.z];

/** A raised strip that follows the surface along a list of hits (side mouldings, belt trims). */
function surfaceStrip(hits: Hit[], half: number, height: number, up = UP): BufferGeometry | null {
  if (hits.length < 2) return null;
  const rows: P3[][] = [];
  for (const h of hits) {
    const n = h.n, b = up.clone().addScaledVector(n, -up.dot(n)).normalize();
    const base = h.p.clone().addScaledVector(n, -0.002);
    const top = h.p.clone().addScaledVector(n, height);
    rows.push([
      P(base.clone().addScaledVector(b, -half)),
      P(top.clone().addScaledVector(b, -half * 0.8)),
      P(top.clone().addScaledVector(b, half * 0.8)),
      P(base.clone().addScaledVector(b, half)),
    ]);
  }
  return grid(rows, false, true);
}

function sample(fn: (t: number) => Hit | null, t0: number, t1: number, n: number): Hit[] {
  const out: Hit[] = [];
  for (let i = 0; i <= n; i++) { const h = fn(t0 + ((t1 - t0) * i) / n); if (h) out.push(h); }
  return out;
}

// ------------------------------------------------------------------- side

export function mirror(side: 1 | -1): RoleGeo {
  const r: RoleGeo = {};
  const h0 = fromSide(1, 0.74, 0.972, ['door_fl']);
  if (!h0) return r;
  // mounted on the door shoulder; the housing stays level whatever the panel slope
  const h = { ...h0, n: new Vector3(h0.n.x, 0, h0.n.z).normalize() };
  const m = frameMatrix(h);
  // local: Z outward, Y up, X towards the rear
  add(r, 'blackGloss', at(rbox(0.14, 0.05, 0.03, 0.012, 0.01, 0.0, 0.0), m));
  add(r, 'black', at(rbox(0.08, 0.04, 0.09, 0.016, 0.01, 0.03, 0.05, 0.25, 0, 0), m));
  add(r, 'paint', at(rbox(0.095, 0.12, 0.215, 0.042, 0.02, 0.085, 0.155), m));
  add(r, 'blackGloss', at(rbox(0.012, 0.106, 0.2, 0.036, 0.02 + 0.044, 0.085, 0.155), m));
  add(r, 'mirror', at(rbox(0.004, 0.094, 0.186, 0.03, 0.02 + 0.051, 0.085, 0.155), m));
  add(r, 'amber', at(rbox(0.03, 0.01, 0.1, 0.004, -0.005, 0.085 - 0.058, 0.2), m));
  if (side > 0) return r;
  const out: RoleGeo = {};
  for (const [k, list] of Object.entries(r)) out[k] = list.map(mirrorX);
  return out;
}

export function handle(side: 1 | -1, z: number, tag: Tag): RoleGeo {
  const r: RoleGeo = {};
  const h = fromSide(1, z, 0.9, [tag]);
  if (!h) return r;
  const m = frameMatrix(h);
  add(r, 'chrome', at(rbox(0.135, 0.028, 0.02, 0.01, 0, 0, 0.012), m));
  add(r, 'blackGloss', at(rbox(0.16, 0.05, 0.006, 0.012, 0, -0.002, 0.001), m));
  if (tag === 'door_fl') add(r, 'chrome', at(cyl([-0.085, 0, 0.0], [-0.085, 0, 0.012], 0.011, 0.011, 16), m));
  if (side > 0) return r;
  const out: RoleGeo = {};
  for (const [k, list] of Object.entries(r)) out[k] = list.map(mirrorX);
  return out;
}

/** Black rub strip along a panel at mid height (left side; mirrored by caller). */
export function sideMoulding(tag: Tag, z0: number, z1: number): BufferGeometry | null {
  return surfaceStrip(sample((z) => fromSide(1, z, 0.6, [tag]), z0, z1, 24), 0.02, 0.008);
}

/** Chrome/black strip on the belt line of a door, taken from the panel's top boundary. */
export function beltMoulding(tag: Tag): BufferGeometry | null {
  const skin = bodySkin();
  const faces = skin.facesByTag.get(tag) ?? [];
  const loops = boundaryLoops(skin.mesh, faces);
  if (!loops.length) return null;
  const loop = loops.sort((a, b) => b.length - a.length)[0];
  const pts = loop.map((v) => new Vector3(skin.mesh.pos[v * 3], skin.mesh.pos[v * 3 + 1], skin.mesh.pos[v * 3 + 2]));
  const maxY = Math.max(...pts.map((p) => p.y));
  const top = pts.map((p, i) => ({ p, i })).filter(({ p }) => p.y > maxY - 0.045).sort((a, b) => b.p.z - a.p.z);
  if (top.length < 2) return null;
  const hits: Hit[] = [];
  for (const { p } of top) {
    const h = fromSide(Math.sign(p.x) as 1 | -1, p.z, p.y - 0.008, [tag]);
    if (h) hits.push(h);
  }
  return surfaceStrip(hits, 0.008, 0.005);
}

export function fuelDoor(): { door: BufferGeometry[]; ring: BufferGeometry; cap: BufferGeometry; neck: Vector3; hinge: Vector3 } {
  const h = fromSide(1, -1.84, 0.87, ['quarter'])!;
  const m = frameMatrix(h);
  const door = at(rbox(0.16, 0.13, 0.006, 0.03, 0, 0, 0.0005), m);
  const ring: P3[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const x = Math.sign(c) * Math.min(1, Math.abs(c) * 1.4) * 0.081, y = Math.sign(s) * Math.min(1, Math.abs(s) * 1.4) * 0.066;
    ring.push(P(new Vector3(x, y, -0.0005).applyMatrix4(m)));
  }
  const cap = at(cyl([0, 0, -0.03], [0, 0, -0.012], 0.034, 0.034, 20), m);
  return { door: [door], ring: tube(ring, 0.0018, 5), cap, neck: new Vector3(0, 0, -0.02).applyMatrix4(m), hinge: new Vector3(0.08, 0, 0).applyMatrix4(m) };
}

// ------------------------------------------------------------------ front

export function frontTrim(): RoleGeo {
  const r: RoleGeo = {};
  const skin = bodySkin();
  // chrome surround hugging the grille opening
  const gl = boundaryLoops(skin.mesh, skin.facesByTag.get('grille') ?? []);
  for (const loop of gl) {
    const pts = loop.map((v) => {
      const p = new Vector3(skin.mesh.pos[v * 3], skin.mesh.pos[v * 3 + 1], skin.mesh.pos[v * 3 + 2]);
      return P(p.addScaledVector(new Vector3(skin.normals[v * 3], skin.normals[v * 3 + 1], skin.normals[v * 3 + 2]), 0.002));
    });
    add(r, 'chrome', tube([...pts, pts[0]], 0.0085, 8));
  }
  // horizontal bars inside the recessed grille
  const gy = gridRange('grille');
  for (let k = 1; k <= 5; k++) {
    const y = gy[0] + ((gy[1] - gy[0]) * k) / 6;
    const hits = sample((x) => fromFront(x, y, ['grille']), -0.55, 0.55, 30);
    const pts = hits.map((h) => P(h.p.clone().addScaledVector(h.n, -0.014)));
    if (pts.length > 2) add(r, k === 3 ? 'chrome' : 'grilleBar', tube(pts, k === 3 ? 0.006 : 0.0045, 8));
  }
  // badge on the middle bar
  const bh = fromFront(0, (gy[0] + gy[1]) / 2, ['grille']);
  if (bh) {
    const m = frameMatrix(bh, UP, -0.004);
    const badge = lathe([[0.001, 0.009], [0.044, 0.008], [0.05, 0.003], [0.046, 0]], [0, 0, 0], [0, 0, 1], 40);
    badge.scale(1, 0.6, 1);
    add(r, 'chrome', at(badge, m));
    const inner = cyl([0, 0, 0.0085], [0, 0, 0.0095], 0.04, 0.04, 40);
    inner.scale(1, 0.6, 1);
    add(r, 'badgeBlue', at(inner, m));
  }
  // lower intake: honeycomb-like mesh behind the opening
  const iy = gridRange('intake');
  for (let k = 0; k <= 6; k++) {
    const y = iy[0] + 0.012 + ((iy[1] - iy[0] - 0.024) * k) / 6;
    const pts = sample((x) => fromFront(x, y, ['intake']), -0.6, 0.6, 30).map((h) => P(h.p.clone().addScaledVector(h.n, -0.022)));
    if (pts.length > 2) add(r, 'grille', tube(pts, 0.0035, 6));
  }
  for (let k = 0; k <= 18; k++) {
    const x = -0.56 + (1.12 * k) / 18;
    const pts = sample((y) => fromFront(x, y, ['intake']), iy[0], iy[1], 8).map((h) => P(h.p.clone().addScaledVector(h.n, -0.024)));
    if (pts.length > 2) add(r, 'grille', tube(pts, 0.003, 5));
  }
  // fog lamps set into the bumper corners
  for (const s of [1, -1]) {
    const h = fromFront(0.66 * s, 0.44, ['bumper_f']);
    if (!h) continue;
    const m = frameMatrix(h);
    add(r, 'blackGloss', at(rbox(0.16, 0.085, 0.03, 0.03, 0, 0, -0.008), m));
    add(r, 'lampChrome', at(cyl([0, 0, -0.02], [0, 0, 0.004], 0.036, 0.034, 28, true), m));
    add(r, 'fog', at(cyl([0, 0, 0.0], [0, 0, 0.008], 0.036, 0.036, 28), m));
  }
  // plate on the bumper between grille and intake (520 x 112 mm)
  const ph = fromFront(0, 0.635, ['bumper_f']);
  if (ph) {
    const m = frameMatrix(ph);
    add(r, 'black', at(rbox(0.545, 0.132, 0.02, 0.006, 0, 0, -0.004), m));
    add(r, 'plate', at(box(0.52, 0.112, 0.003, 0, 0, 0.0075), m));
  }
  return r;
}

function gridRange(tag: Tag): [number, number] {
  const skin = bodySkin();
  let y0 = Infinity, y1 = -Infinity;
  for (const f of skin.facesByTag.get(tag) ?? []) for (let k = 0; k < 4; k++) {
    const y = skin.mesh.pos[skin.mesh.quads[f * 4 + k] * 3 + 1];
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return [y0 + 0.008, y1 - 0.008];
}

// ------------------------------------------------------------------- rear

export function rearTrim(): RoleGeo {
  const r: RoleGeo = {};
  for (const s of [1, -1]) {
    // reflectors on the bumper corners
    const rh = fromRear(0.74 * s, 0.5, ['bumper_r']);
    if (rh) add(r, 'reflectorRed', at(rbox(0.13, 0.024, 0.006, 0.006, 0, 0, 0.001), frameMatrix(rh)));
  }
  // twin exhaust tips just proud of the bumper's lower edge
  const under = fromBelow(0.5, -2.66, ['bumper_r']);
  const yb = under ? under.p.y : 0.32;
  for (const s of [1, -1]) {
    const x = 0.5 * s, y = yb - 0.035;
    const back = fromRear(x, yb + 0.02, ['bumper_r']);
    const z1 = (back ? back.p.z : -2.84) - 0.03;
    add(r, 'chrome', cyl([x, y, z1 + 0.2], [x, y, z1], 0.038, 0.042, 28, true));
    add(r, 'black', cyl([x, y, z1 + 0.19], [x, y, z1 + 0.004], 0.033, 0.033, 20, true), cyl([x, y, z1 + 0.1], [x, y, z1 + 0.106], 0.034, 0.034, 20));
  }
  return r;
}

export function trunkTrim(): RoleGeo {
  const r: RoleGeo = {};
  const ph = fromRear(0, 0.755, ['plate_r']);
  if (ph) {
    const m = frameMatrix(ph, UP, -0.012);
    add(r, 'plate', at(box(0.52, 0.112, 0.003, 0, 0, 0.002), m));
    add(r, 'lampHousing', at(box(0.08, 0.012, 0.012, 0, 0.068, 0.0), m));
  }
  // chrome garnish above the plate recess
  const hits = sample((x) => fromRear(x, 0.9, ['trunk']), -0.46, 0.46, 20);
  add(r, 'chrome', surfaceStrip(hits, 0.011, 0.005));
  const bh = fromRear(0, 0.955, ['trunk']);
  if (bh) {
    const badge = lathe([[0.001, 0.007], [0.036, 0.006], [0.04, 0.002], [0.036, 0]], [0, 0, 0], [0, 0, 1], 32);
    badge.scale(1, 0.6, 1);
    add(r, 'chrome', at(badge, frameMatrix(bh, UP, -0.002)));
  }
  return r;
}

export function shellTrim(): RoleGeo {
  const r: RoleGeo = {};
  // shark-fin antenna on the roof
  const ah = fromTop(0, -1.18, ['roof']);
  if (ah) {
    const m = frameMatrix(ah, new Vector3(0, 0, -1));
    // local: Z up (normal), Y rearwards
    add(r, 'blackGloss', at(merge([rbox(0.06, 0.17, 0.04, 0.02, 0, 0, 0.012), rbox(0.045, 0.1, 0.05, 0.02, 0, 0.03, 0.03)]), m));
  }
  // wipers parked on the lower windshield
  for (const [x0, x1] of [[0.06, 0.66], [-0.5, 0.1]] as const) {
    const hits = sample((x) => fromTop(x, 0.855, ['windshield']), x0, x1, 10);
    const arm = hits.map((h) => P(h.p.clone().addScaledVector(h.n, 0.014)));
    const blade = hits.map((h) => P(h.p.clone().addScaledVector(h.n, 0.006)));
    if (arm.length > 2) add(r, 'black', tube(arm, 0.0055, 6), tube(blade, 0.004, 6));
    const piv = fromTop(x0 - 0.04, 0.925, ['cowl', 'hood', 'windshield']);
    if (piv) add(r, 'black', cyl(P(piv.p), P(piv.p.clone().addScaledVector(piv.n, 0.02)), 0.014, 0.012, 12));
  }
  return r;
}

/** Side mouldings and belt strips for the shell pieces (left + mirrored right). */
export function shellSideTrims(): RoleGeo {
  const r: RoleGeo = {};
  for (const [tag, z0, z1] of [['quarter', -1.95, -2.35]] as const) {
    const g = sideMoulding(tag as Tag, z0, z1);
    if (g) add(r, 'blackGloss', g, mirrorX(g));
  }
  return r;
}
