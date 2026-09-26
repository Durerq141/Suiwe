// Cabin: dashboard with instrument binnacle and centre stack, console, front buckets,
// rear bench, door cards, headliner trims, visors, mirror, pedals, steering wheel.
// Anchors (cluster, column, radio, gear lever) match the game's gauge/control code.
import { type BufferGeometry, Matrix4, PlaneGeometry, TorusGeometry, Vector3 } from 'three';
import { DIMS } from '../dims';
import { box, cyl, fan, grid, rbox, tube, type P3 } from '../mesh/prims';
import { bodySkin, skinGeometry } from '../body/skin';
import { fromSide, fromTop } from '../body/surface';
import { frameMatrix } from './trim';
import { boundaryLoops } from '../mesh/solidify';

export type RoleGeo = Record<string, BufferGeometry[]>;
const add = (r: RoleGeo, role: string, ...g: BufferGeometry[]) => { (r[role] ??= []).push(...g); };

export const ANCHORS = {
  cluster: { top: new Vector3(0.42, 1.05, 0.462), bottom: new Vector3(0.42, 0.94, 0.442) },
  steeringHub: new Vector3(0.42, 0.98, 0.1),
  steeringDir: new Vector3(0, 0.423, -0.906),
  radio: new Vector3(0, 0.848, 0.2895),
  gearLever: new Vector3(0, 0.556, 0.13),
  handbrake: new Vector3(0.068, 0.568, -0.2),
  dome: new Vector3(0, 1.45, -0.35),
};

const smoothstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Dashboard shell: a loft of (z, y) sections across the cabin width. */
function dashboard(): BufferGeometry[] {
  const rows: P3[][] = [];
  const n = 34;
  for (let i = 0; i <= n; i++) {
    const x = -DASH_W + (2 * DASH_W * i) / n;
    const ax = Math.abs(x);
    const top = 1.012 + 0.014 * (1 - (ax / DASH_W) ** 2);
    // driver binnacle pocket and passenger-side wave
    const w = 1 - smoothstep(0.1, 0.19, Math.abs(x - 0.42));
    const sec: [number, number][] = [
      [0.92, 0.968],
      [0.72, top + 0.004 + 0.02 * w],
      [0.56, top + 0.045 * w],
      [0.46 - 0.02 * w, top - 0.012 + 0.052 * w],
      [0.425 - 0.015 * w, top - 0.055 + 0.07 * w],
      [0.41 + 0.06 * w, top - 0.09 + 0.045 * w],
      [0.405 + 0.07 * w, 0.935],
      [0.395, 0.86],
      [0.4, 0.75],
      [0.44, 0.645],
      [0.53, 0.58],
      [0.72, 0.545],
      [0.92, 0.53],
    ];
    rows.push(sec.map(([z, y]) => [x, y, z] as P3));
  }
  // end caps against the door cards
  return [grid(rows, false, true), fan(rows[0], true), fan(rows[rows.length - 1])];
}
const DASH_W = 0.8;

/** Decorative strip across the lower dash face (skips the centre stack). */
function dashStrip(): BufferGeometry[] {
  const out: BufferGeometry[] = [];
  for (const [x0, x1] of [[-DASH_W + 0.02, -0.17], [0.17, DASH_W - 0.02]] as const) {
    out.push(rbox(x1 - x0, 0.032, 0.012, 0.005, (x0 + x1) / 2, 0.815, 0.392));
  }
  return out;
}

function steeringWheel(): { wheel: RoleGeo; fixed: RoleGeo } {
  const wheel: RoleGeo = {}, fixed: RoleGeo = {};
  add(wheel, 'wheelRim', new TorusGeometry(0.183, 0.0175, 14, 72));
  for (const a of [0, Math.PI, -Math.PI / 2]) {
    const len = a === -Math.PI / 2 ? 0.11 : 0.12;
    const g = rbox(len, a === -Math.PI / 2 ? 0.05 : 0.038, 0.018, 0.008, 0, 0, 0);
    g.rotateZ(a);
    g.translate(Math.cos(a) * (0.183 - len / 2), Math.sin(a) * (0.183 - len / 2) - 0.004, -0.008);
    add(wheel, 'wheelSpoke', g);
  }
  add(wheel, 'wheelSpoke', rbox(0.16, 0.125, 0.05, 0.04, 0, -0.006, 0.012));
  add(wheel, 'wheelRim', rbox(0.14, 0.105, 0.02, 0.04, 0, -0.006, 0.04));
  add(wheel, 'switch', cyl([0, 0.0, 0.049], [0, 0.0, 0.052], 0.019, 0.019, 24));
  add(wheel, 'knob', cyl([0, 0.0, 0.052], [0, 0.0, 0.0535], 0.012, 0.012, 24));
  for (const s of [1, -1]) add(wheel, 'switch', rbox(0.03, 0.022, 0.008, 0.004, 0.095 * s, 0.01, 0.004));
  add(fixed, 'trim', rbox(0.1, 0.085, 0.3, 0.03, 0, -0.012, -0.2));
  add(fixed, 'trim', cyl([0, 0, -0.06], [0, 0, -0.03], 0.048, 0.045, 24));
  for (const s of [1, -1]) add(fixed, 'black', tube([[0.04 * s, 0.01, -0.09], [0.11 * s, 0.024, -0.085], [0.16 * s, 0.03, -0.08]], 0.006, 6));
  return { wheel, fixed };
}

/** Matrix that places steering-local geometry (rim in XY, axis +z towards driver). */
export function steeringMatrix(): Matrix4 {
  const u = ANCHORS.steeringDir.clone().normalize();
  const q = new Vector3(0, -u.z, u.y).normalize();
  if (q.y < 0) q.negate();
  const m = new Matrix4().makeBasis(new Vector3().crossVectors(q, u), q, u);
  m.setPosition(ANCHORS.steeringHub);
  return m;
}

export function frontSeat(sx: number): RoleGeo {
  const r: RoleGeo = {};
  const s = Math.sign(sx) || 1;
  const y0 = DIMS.yFloor;
  add(r, 'black', box(0.42, 0.1, 0.46, sx, y0 + 0.08, -0.33), box(0.04, 0.03, 0.62, sx + 0.17, y0 + 0.02, -0.3), box(0.04, 0.03, 0.62, sx - 0.17, y0 + 0.02, -0.3));
  // cushion + bolsters
  add(r, 'seat', rbox(0.5, 0.13, 0.52, 0.05, sx, y0 + 0.21, -0.32, -0.07));
  add(r, 'seatInsert', rbox(0.3, 0.03, 0.42, 0.012, sx, y0 + 0.285, -0.32, -0.07));
  for (const b of [1, -1]) add(r, 'seat', rbox(0.085, 0.1, 0.48, 0.035, sx + b * 0.215, y0 + 0.27, -0.33, -0.07, 0, b * 0.08));
  // backrest reclined ~15 degrees
  const back = (g: BufferGeometry) => { g.translate(0, 0.33, 0); g.rotateX(-0.26); g.translate(sx, y0 + 0.28, -0.6); return g; };
  add(r, 'seat', back(rbox(0.5, 0.66, 0.12, 0.05, 0, 0, 0)));
  add(r, 'seatInsert', back(rbox(0.3, 0.5, 0.03, 0.012, 0, 0.0, 0.058)));
  for (const b of [1, -1]) add(r, 'seat', back(rbox(0.09, 0.56, 0.14, 0.035, b * 0.215, -0.02, 0.03, 0, b * 0.18, 0)));
  // headrest on two posts
  add(r, 'seat', back(rbox(0.26, 0.18, 0.1, 0.045, 0, 0.47, 0.01)));
  for (const b of [1, -1]) add(r, 'chrome', back(cyl([b * 0.06, 0.33, 0.0], [b * 0.06, 0.4, 0.0], 0.006, 0.006, 8)));
  add(r, 'black', rbox(0.04, 0.04, 0.12, 0.012, sx + s * -0.26, y0 + 0.18, -0.12));
  return r;
}

export function rearSeat(): RoleGeo {
  const r: RoleGeo = {};
  const y0 = DIMS.yFloor;
  add(r, 'seat', rbox(1.4, 0.14, 0.5, 0.055, 0, y0 + 0.22, -1.12, -0.06));
  for (const x of [-0.42, 0.42]) add(r, 'seatInsert', rbox(0.34, 0.03, 0.4, 0.012, x, y0 + 0.295, -1.12, -0.06));
  const back = (g: BufferGeometry) => { g.translate(0, 0.3, 0); g.rotateX(-0.3); g.translate(0, y0 + 0.28, -1.38); return g; };
  add(r, 'seat', back(rbox(1.42, 0.6, 0.12, 0.05, 0, 0, 0)));
  for (const x of [-0.42, 0.42]) add(r, 'seatInsert', back(rbox(0.34, 0.44, 0.03, 0.012, x, 0.0, 0.058)));
  for (const x of [-0.46, 0, 0.46]) add(r, 'seat', back(rbox(0.24, 0.13, 0.09, 0.04, x, 0.39, 0.0)));
  return r;
}

/** Door card: the door skin offset inside the door shell, plus handle, armrest, switches, speaker, pocket. */
export function doorCard(tag: 'door_fl' | 'door_rl'): RoleGeo {
  const r: RoleGeo = {};
  const skin = bodySkin();
  const D = 0.108;
  add(r, 'trim', skinGeometry(skin, [tag], { offset: -D, flip: true }));
  const front = tag === 'door_fl';
  const zf = front ? DIMS.zCowl - 0.08 : DIMS.zDoorSplit - 0.1;
  const zr = front ? DIMS.zDoorSplit + 0.08 : -1.12;
  const zm = (zf + zr) / 2, len = zf - zr;
  const put = (role: string, g: BufferGeometry, z: number, y: number) => {
    const h = fromSide(1, z, y, [tag]);
    if (h) add(r, role, g.applyMatrix4(frameMatrix(h)));
  };
  // local frame: Z outward (card face at Z = -D), X rearwards, Y up
  put('armrest', rbox(len * 0.62, 0.05, 0.075, 0.02, 0, 0, -D - 0.03), zm - len * 0.05, 0.72);
  put('dashSoft', rbox(len * 0.55, 0.12, 0.03, 0.02, 0, 0, -D - 0.008), zm - len * 0.05, 0.8);
  put('seatInsert', rbox(len * 0.62, 0.17, 0.012, 0.01, 0, 0, -D - 0.004), zm, 0.87);
  put('chrome', rbox(0.1, 0.028, 0.012, 0.008, 0, 0, -D - 0.012), zf - 0.12, 0.885);
  put('black', rbox(0.13, 0.05, 0.014, 0.012, 0, 0, -D - 0.004), zf - 0.12, 0.885);
  put('black', cyl([0, 0, -D - 0.002], [0, 0, -D - 0.012], 0.068, 0.068, 28), zf - 0.13, 0.49);
  put('dashSoft', rbox(len * 0.5, 0.11, 0.045, 0.015, 0, 0, -D - 0.022), zm - len * 0.12, 0.43);
  if (front) {
    put('switch', rbox(0.12, 0.014, 0.05, 0.006, 0, 0, -D - 0.045), zm + len * 0.18, 0.75);
    put('dashSoft', rbox(0.12, 0.06, 0.03, 0.012, 0, 0, -D - 0.01), zf - 0.05, 0.97);
  }
  // window-sill cap along the door top
  const loops = boundaryLoops(skin.mesh, skin.facesByTag.get(tag) ?? []);
  const loop = loops.sort((a, b) => b.length - a.length)[0] ?? [];
  const pts = loop.map((v) => new Vector3(skin.mesh.pos[v * 3], skin.mesh.pos[v * 3 + 1], skin.mesh.pos[v * 3 + 2]));
  const maxY = Math.max(...pts.map((p) => p.y));
  const cap: P3[] = [];
  for (const p of pts.filter((q) => q.y > maxY - 0.04 && q.z < zf + 0.05 && q.z > zr - 0.2).sort((a, b) => b.z - a.z)) {
    const h = fromSide(1, p.z, p.y - 0.03, [tag]);
    if (h) { const q = h.p.clone().addScaledVector(h.n, -0.075); cap.push([q.x, q.y + 0.012, q.z]); }
  }
  if (cap.length > 2) add(r, 'dashSoft', tube(cap, 0.02, 8));
  return r;
}

/** Everything bolted to the body shell inside the cabin. */
export function cabin(opts: { steering?: boolean } = {}): RoleGeo {
  const r: RoleGeo = {};
  add(r, 'dash', ...dashboard());
  add(r, 'wood', ...dashStrip());
  // binnacle hood over the cluster
  const hood: P3[][] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (i / 16);
    const x = 0.42 + Math.cos(a) * 0.17, y = 1.0 + Math.sin(a) * 0.075;
    hood.push([[x, y, 0.53], [x, y + 0.004, 0.43], [x, y - 0.006, 0.405]]);
  }
  add(r, 'dashSoft', grid(hood.map((h) => h), false, false));
  add(r, 'gauge', box(0.34, 0.14, 0.02, 0.42, 0.995, 0.475, 0.18));
  // centre stack with screen, vents and climate controls
  add(r, 'dashSoft', rbox(0.32, 0.46, 0.12, 0.03, 0, 0.78, 0.36, 0.18));
  add(r, 'blackGloss', rbox(0.25, 0.3, 0.02, 0.012, 0, 0.815, 0.29, 0.18));
  add(r, 'screen', box(0.19, 0.105, 0.004, 0, 0.87, 0.278, 0.18));
  for (const s of [1, -1]) {
    add(r, 'black', rbox(0.085, 0.05, 0.02, 0.01, 0.066 * s, 0.955, 0.3, 0.18));
    add(r, 'black', rbox(0.1, 0.065, 0.02, 0.02, 0.74 * s, 0.93, 0.36));
    for (let k = -1; k <= 1; k++) add(r, 'accent', box(0.08, 0.004, 0.012, 0.066 * s, 0.955 + k * 0.014, 0.292, 0.18));
  }
  for (const x of [-0.07, 0, 0.07]) add(r, 'knob', cyl([x, 0.7, 0.305], [x, 0.7, 0.285], 0.019, 0.018, 24));
  // console with shifter gate and armrest
  add(r, 'console', rbox(0.26, 0.26, 0.62, 0.03, 0, DIMS.yFloor + 0.13, 0.02), rbox(0.26, 0.34, 0.42, 0.035, 0, DIMS.yFloor + 0.16, -0.43));
  add(r, 'armrest', rbox(0.25, 0.045, 0.38, 0.02, 0, DIMS.yFloor + 0.34, -0.43));
  add(r, 'black', rbox(0.1, 0.006, 0.2, 0.004, ANCHORS.gearLever.x, ANCHORS.gearLever.y - 0.002, ANCHORS.gearLever.z));
  for (const z of [-0.02, -0.11]) add(r, 'black', cyl([-0.058, 0.565, z], [-0.058, 0.56, z], 0.037, 0.037, 24), new TorusGeometry(0.038, 0.004, 6, 24).rotateX(Math.PI / 2).translate(-0.058, 0.566, z));
  // glovebox face line, passenger knee panel
  add(r, 'dashSoft', rbox(0.38, 0.14, 0.03, 0.02, -0.44, 0.775, 0.415, 0.3));
  // visors, mirror and dome light pressed against the headliner / glass
  for (const s of [1, -1]) {
    const h = fromTop(0.36 * s, 0.02, ['roof', 'aPillar', 'windshield']);
    if (!h) continue;
    const y = h.p.y - 0.03 - 0.012;
    add(r, 'headliner', rbox(0.38, 0.018, 0.17, 0.008, 0.36 * s, y, -0.02, 0.2));
    add(r, 'black', cyl([0.13 * s, y + 0.004, 0.06], [0.55 * s, y + 0.004, 0.06], 0.006, 0.006, 8));
  }
  const mh = fromTop(0, 0.2, ['windshield']);
  if (mh) {
    const b = mh.p.clone().addScaledVector(mh.n, -0.008);
    add(r, 'black', rbox(0.05, 0.016, 0.07, 0.006, b.x, b.y - 0.006, b.z, 0.5));
    add(r, 'black', cyl([b.x, b.y - 0.01, b.z - 0.01], [b.x, b.y - 0.07, b.z - 0.03], 0.007, 0.007, 8));
    add(r, 'black', rbox(0.26, 0.07, 0.035, 0.02, b.x, b.y - 0.1, b.z - 0.045, 0.12));
    add(r, 'mirror', rbox(0.24, 0.055, 0.004, 0.015, b.x, b.y - 0.1, b.z - 0.064, 0.12));
  }
  const dh = fromTop(0, -0.36, ['roof']);
  if (dh) {
    add(r, 'headliner', rbox(0.26, 0.022, 0.14, 0.01, 0, dh.p.y - 0.03 - 0.01, -0.36));
    add(r, 'dome', rbox(0.16, 0.012, 0.07, 0.005, 0, dh.p.y - 0.03 - 0.022, -0.36));
  }
  // pedal box: arms from under the dash
  for (const [x, w, h, y, z] of [[0.33, 0.07, 0.1, 0.43, 0.63], [0.5, 0.05, 0.13, 0.44, 0.65]] as const) {
    add(r, 'rubber', rbox(w, h, 0.014, 0.005, x, y, z, -0.55));
    add(r, 'black', cyl([x, y + h * 0.4, z + 0.02], [x, 0.66, 0.74], 0.008, 0.008, 8));
  }
  add(r, 'black', rbox(0.3, 0.06, 0.1, 0.02, 0.42, 0.68, 0.76));
  // steering wheel, gauges, shifter, handbrake: static copies for previews (the game animates its own)
  if (opts.steering === false) return r;
  const c = ANCHORS.cluster, o = c.top.clone().add(c.bottom).multiplyScalar(0.5);
  const face = new PlaneGeometry(0.3, 0.1);
  face.applyMatrix4(new Matrix4().lookAt(new Vector3(), new Vector3(0, 0.179, -0.984), new Vector3(0, 1, 0)));
  face.translate(o.x, o.y + 0.001, o.z - 0.004);
  add(r, 'gaugeFace', face);
  const g = ANCHORS.gearLever;
  add(r, 'rubber', cyl([g.x, g.y, g.z], [g.x, g.y + 0.06, g.z], 0.035, 0.015, 16));
  add(r, 'chrome', cyl([g.x, g.y + 0.05, g.z], [g.x, g.y + 0.1, g.z], 0.007, 0.007, 8));
  add(r, 'knob', rbox(0.045, 0.065, 0.06, 0.02, g.x, g.y + 0.13, g.z + 0.008, 0.2));
  const hb = ANCHORS.handbrake;
  add(r, 'trim', rbox(0.034, 0.03, 0.2, 0.012, hb.x, hb.y + 0.01, hb.z + 0.1), rbox(0.036, 0.034, 0.08, 0.014, hb.x, hb.y + 0.012, hb.z + 0.19));
  const sw = steeringWheel();
  const m = steeringMatrix();
  for (const src of [sw.wheel, sw.fixed]) for (const [role, list] of Object.entries(src)) add(r, role, ...list.map((b) => b.clone().applyMatrix4(m)));
  return r;
}

export { steeringWheel };
