// Cabin: dashboard with instrument binnacle and centre stack, console, front buckets,
// rear bench, door cards, headliner trims, visors, mirror, pedals, steering wheel.
// Anchors (cluster, column, radio, gear lever) match the game's gauge/control code.
import { type BufferGeometry, Matrix4, TorusGeometry, Vector3 } from 'three';
import { DIMS } from '../dims';
import { box, cyl, grid, mirrorX, rbox, tube, type P3 } from '../mesh/prims';

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
function dashboard(): BufferGeometry {
  const rows: P3[][] = [];
  const n = 34;
  for (let i = 0; i <= n; i++) {
    const x = -0.86 + (1.72 * i) / n;
    const ax = Math.abs(x);
    const top = 1.012 + 0.014 * (1 - (ax / 0.86) ** 2);
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
  return grid(rows, false, true);
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
  add(wheel, 'wheelSpoke', rbox(0.15, 0.115, 0.055, 0.028, 0, -0.006, 0.014));
  add(wheel, 'chrome', cyl([0, 0.004, 0.041], [0, 0.004, 0.044], 0.018, 0.018, 24));
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

export function doorCard(part: 'door_fl' | 'door_fr' | 'door_rl' | 'door_rr'): RoleGeo {
  const r: RoleGeo = {};
  const front = part === 'door_fl' || part === 'door_fr';
  const z0 = front ? DIMS.zCowl - 0.05 : DIMS.zDoorSplit - 0.07;
  const z1 = front ? DIMS.zDoorSplit + 0.06 : -1.36;
  const zc = (z0 + z1) / 2, len = z0 - z1;
  const x = 0.865;
  const p = (b: BufferGeometry, role: string) => add(r, role, b);
  p(rbox(0.05, 0.56, len, 0.02, x, 0.66, zc), 'trim');
  p(rbox(0.035, 0.1, len - 0.02, 0.02, x - 0.02, 0.985, zc), 'dashSoft');
  p(rbox(0.07, 0.05, len * 0.55, 0.02, x - 0.045, 0.73, zc - len * 0.08), 'dashSoft');
  p(rbox(0.02, 0.2, len * 0.62, 0.01, x - 0.03, 0.84, zc - len * 0.05), 'seatInsert');
  p(cyl([x - 0.028, 0.5, zc + len * 0.18], [x - 0.03, 0.5, zc + len * 0.18], 0.075, 0.075, 28), 'black');
  p(rbox(0.012, 0.03, 0.09, 0.008, x - 0.035, 0.9, z0 - 0.12), 'chrome');
  if (front) p(rbox(0.04, 0.015, 0.1, 0.006, x - 0.08, 0.758, zc - 0.05), 'switch');
  if (part.endsWith('r')) {
    const out: RoleGeo = {};
    for (const [role, list] of Object.entries(r)) out[role] = list.map((b) => mirrorX(b));
    return out;
  }
  return r;
}

/** Everything bolted to the body shell inside the cabin. */
export function cabin(opts: { steering?: boolean } = {}): RoleGeo {
  const r: RoleGeo = {};
  add(r, 'dash', dashboard());
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
  add(r, 'dashSoft', rbox(0.32, 0.42, 0.12, 0.03, 0, 0.8, 0.355, 0.18));
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
  // glovebox face line, passenger knee panel
  add(r, 'dashSoft', rbox(0.38, 0.14, 0.03, 0.02, -0.44, 0.775, 0.415, 0.3));
  // pillars, visors, mirror, pedals
  for (const s of [1, -1]) {
    add(r, 'headliner', rbox(0.36, 0.014, 0.17, 0.006, 0.38 * s, 1.375, 0.13, 0.28));
    add(r, 'black', rbox(0.05, 0.3, 0.06, 0.02, 0.84 * s, 1.18, -0.4, 0, 0, 0.18 * s));
  }
  add(r, 'black', rbox(0.24, 0.065, 0.03, 0.02, 0, 1.3, 0.18, 0.2));
  add(r, 'mirror', box(0.22, 0.05, 0.004, 0, 1.3, 0.164, 0.2));
  add(r, 'black', cyl([0, 1.33, 0.19], [0, 1.37, 0.2], 0.008, 0.01, 8));
  add(r, 'rubber', rbox(0.07, 0.1, 0.012, 0.005, 0.36, 0.43, 0.62, -0.6), rbox(0.05, 0.13, 0.012, 0.005, 0.52, 0.44, 0.64, -0.5));
  add(r, 'dome', rbox(0.16, 0.02, 0.08, 0.01, ANCHORS.dome.x, ANCHORS.dome.y + 0.01, ANCHORS.dome.z));
  // steering wheel + column (static copy for previews; the game animates its own)
  if (opts.steering === false) return r;
  const sw = steeringWheel();
  const m = steeringMatrix();
  for (const src of [sw.wheel, sw.fixed]) for (const [role, list] of Object.entries(src)) add(r, role, ...list.map((b) => b.clone().applyMatrix4(m)));
  return r;
}

export { steeringWheel };
