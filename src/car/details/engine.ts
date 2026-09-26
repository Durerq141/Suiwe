// Engine bay: transverse V6 with gearbox, belt drive, manifolds and cover (part
// "engine"), battery, radiator with fan shroud, and the fixed bay furniture (air box,
// reservoirs, brake master cylinder, fuse box, hoses, hood latch). Car space.
import type { BufferGeometry } from 'three';
import { box, cyl, lathe, rbox, tube, type P3 } from '../mesh/prims';

export type RoleGeo = Record<string, BufferGeometry[]>;
const add = (r: RoleGeo, role: string, ...g: BufferGeometry[]) => { (r[role] ??= []).push(...g); };

const EX = -0.04; // engine centre x (gearbox sits on the driver side)
const EZ = 1.46;

function engine(): RoleGeo {
  const r: RoleGeo = {};
  // block, sump, heads (V6, banks fore/aft), cam covers, engine cover
  add(r, 'engine', rbox(0.52, 0.28, 0.36, 0.03, EX, 0.5, EZ));
  add(r, 'engineDark', rbox(0.46, 0.1, 0.3, 0.03, EX, 0.32, EZ));
  for (const s of [1, -1]) {
    add(r, 'engine', rbox(0.54, 0.1, 0.16, 0.025, EX, 0.68, EZ + 0.13 * s, 0.32 * s));
    add(r, 'valveCover', rbox(0.52, 0.05, 0.13, 0.02, EX, 0.745, EZ + 0.16 * s, 0.32 * s));
    for (let i = 0; i < 3; i++) add(r, 'rubber', cyl([EX - 0.16 + i * 0.16, 0.77, EZ + 0.15 * s], [EX - 0.16 + i * 0.16, 0.8, EZ + 0.14 * s], 0.012, 0.012, 10));
  }
  add(r, 'intake', rbox(0.46, 0.07, 0.24, 0.035, EX, 0.83, EZ, 0));
  add(r, 'intake', rbox(0.44, 0.012, 0.2, 0.004, EX, 0.87, EZ));
  for (let i = -2; i <= 2; i++) add(r, 'engineDark', box(0.36, 0.006, 0.012, EX, 0.869, EZ + i * 0.035));
  add(r, 'chrome', cyl([EX, 0.866, EZ], [EX, 0.874, EZ], 0.035, 0.035, 24));
  // throttle body towards the air box
  add(r, 'engine', cyl([EX + 0.23, 0.82, EZ - 0.02], [EX + 0.3, 0.82, EZ - 0.02], 0.045, 0.045, 20));
  // timing cover, pulleys and serpentine belt on the passenger side
  const bx = EX - 0.3;
  add(r, 'engineDark', rbox(0.06, 0.4, 0.38, 0.02, bx + 0.03, 0.55, EZ));
  const pulleys: [number, number, number][] = [[0.34, EZ + 0.02, 0.075], [0.46, EZ + 0.24, 0.036], [0.36, EZ + 0.24, 0.055], [0.62, EZ + 0.1, 0.03], [0.7, EZ - 0.08, 0.04]];
  for (const [y, z, rr] of pulleys) {
    add(r, 'pulley', cyl([bx - 0.02, y, z], [bx - 0.045, y, z], rr, rr, 28));
    add(r, 'chrome', cyl([bx - 0.045, y, z], [bx - 0.05, y, z], rr * 0.35, rr * 0.35, 12));
  }
  const belt: P3[] = [];
  const ring = [[0.34 - 0.08, EZ + 0.02], [0.36 - 0.06, EZ + 0.28], [0.46 + 0.04, EZ + 0.27], [0.62 + 0.035, EZ + 0.12], [0.7 + 0.045, EZ - 0.08], [0.34 + 0.02, EZ - 0.06]];
  for (const [y, z] of [...ring, ring[0]]) belt.push([bx - 0.032, y, z]);
  add(r, 'rubber', tube(belt, 0.006, 6));
  add(r, 'alternator', cyl([bx + 0.01, 0.46, EZ + 0.24], [bx + 0.14, 0.46, EZ + 0.24], 0.06, 0.06, 24));
  add(r, 'engineDark', cyl([bx + 0.01, 0.36, EZ + 0.24], [bx + 0.16, 0.36, EZ + 0.24], 0.065, 0.065, 24));
  // exhaust manifold on the front bank
  for (let i = 0; i < 3; i++) {
    const x = EX - 0.16 + i * 0.16;
    add(r, 'exhaustHot', tube([[x, 0.66, EZ + 0.21], [x, 0.58, EZ + 0.27], [EX, 0.45, EZ + 0.3], [EX + 0.02, 0.36, EZ + 0.26]], 0.02, 8));
  }
  add(r, 'lampChrome', rbox(0.46, 0.14, 0.02, 0.01, EX, 0.6, EZ + 0.29, 0.25));
  // gearbox bolted to the driver end
  add(r, 'engine', rbox(0.26, 0.28, 0.32, 0.05, EX + 0.39, 0.45, EZ - 0.04));
  add(r, 'engine', lathe([[0.16, 0], [0.17, 0.03], [0.14, 0.08], [0.02, 0.1]], [EX + 0.26, 0.45, EZ - 0.04], [EX + 0.6, 0.45, EZ - 0.04], 28));
  add(r, 'capYellow', cyl([EX + 0.08, 0.86, EZ - 0.15], [EX + 0.08, 0.88, EZ - 0.15], 0.018, 0.018, 12));
  add(r, 'capYellow', cyl([EX - 0.12, 0.78, EZ + 0.19], [EX - 0.12, 0.9, EZ + 0.26], 0.007, 0.007, 8));
  return r;
}

function battery(): RoleGeo {
  const r: RoleGeo = {};
  const x = -0.4, y = 0.62, z = 1.88;
  add(r, 'battery', rbox(0.25, 0.18, 0.17, 0.01, x, y, z));
  add(r, 'batteryTop', rbox(0.25, 0.02, 0.17, 0.006, x, y + 0.1, z));
  add(r, 'batteryLabel', box(0.2, 0.09, 0.002, x, y + 0.01, z + 0.086));
  add(r, 'red', cyl([x + 0.08, y + 0.11, z - 0.05], [x + 0.08, y + 0.14, z - 0.05], 0.012, 0.01, 12), rbox(0.05, 0.02, 0.05, 0.006, x + 0.08, y + 0.13, z - 0.05));
  add(r, 'black', cyl([x - 0.08, y + 0.11, z - 0.05], [x - 0.08, y + 0.14, z - 0.05], 0.012, 0.01, 12));
  add(r, 'black', box(0.03, 0.012, 0.2, x, y + 0.115, z), box(0.29, 0.03, 0.21, x, y - 0.1, z));
  add(r, 'rubber', tube([[x - 0.08, y + 0.14, z - 0.05], [x - 0.15, y + 0.12, z - 0.12], [x - 0.12, y - 0.02, z - 0.2]], 0.009, 6));
  add(r, 'red', tube([[x + 0.08, y + 0.14, z - 0.05], [x + 0.16, y + 0.1, z - 0.15], [x + 0.2, y + 0.02, z - 0.3]], 0.009, 6));
  return r;
}

function radiator(): RoleGeo {
  const r: RoleGeo = {};
  const z = 2.04;
  add(r, 'radCore', box(1.0, 0.42, 0.03, 0, 0.6, z));
  add(r, 'engineDark', box(1.06, 0.05, 0.05, 0, 0.83, z), box(1.06, 0.05, 0.05, 0, 0.37, z));
  for (const s of [1, -1]) add(r, 'engineDark', box(0.05, 0.47, 0.06, 0.53 * s, 0.6, z));
  // fan shroud with fan
  add(r, 'engineDark', rbox(0.8, 0.4, 0.06, 0.03, 0, 0.6, z - 0.05));
  for (const s of [1, -1]) {
    const x = 0.2 * s;
    add(r, 'black', cyl([x, 0.6, z - 0.09], [x, 0.6, z - 0.06], 0.17, 0.17, 32, true));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      add(r, 'black', box(0.03, 0.14, 0.006, x + Math.cos(a) * 0.08, 0.6 + Math.sin(a) * 0.08, z - 0.075, 0, 0.35, a - Math.PI / 2));
    }
    add(r, 'engine', cyl([x, 0.6, z - 0.1], [x, 0.6, z - 0.07], 0.045, 0.045, 20));
  }
  add(r, 'hose', tube([[-0.42, 0.8, z - 0.04], [-0.35, 0.82, z - 0.2], [-0.25, 0.8, 1.72], [-0.15, 0.76, 1.66]], 0.022, 10));
  add(r, 'hose', tube([[0.42, 0.42, z - 0.04], [0.36, 0.4, 1.8], [0.3, 0.42, 1.6]], 0.022, 10));
  return r;
}

function fixed(): RoleGeo {
  const r: RoleGeo = {};
  // air box + intake duct (driver side front)
  add(r, 'intake', rbox(0.28, 0.16, 0.3, 0.03, 0.4, 0.72, 1.8));
  add(r, 'engineDark', box(0.3, 0.012, 0.32, 0.4, 0.8, 1.8));
  for (let i = 0; i < 4; i++) add(r, 'chrome', box(0.02, 0.02, 0.02, 0.26 + (i % 2) * 0.28, 0.8, 1.66 + Math.floor(i / 2) * 0.28));
  add(r, 'rubber', tube([[0.4, 0.8, 1.66], [0.36, 0.84, 1.52], [0.3, 0.83, 1.44], [0.29, 0.82, 1.44]], 0.042, 14));
  add(r, 'intake', tube([[0.44, 0.68, 1.96], [0.46, 0.7, 2.06], [0.44, 0.78, 2.1]], 0.04, 12));
  // coolant reservoir, washer tank, power-steering / brake reservoirs, master cylinder, fuse box
  add(r, 'reservoir', rbox(0.1, 0.14, 0.16, 0.03, -0.46, 0.76, 1.24));
  add(r, 'capYellow', cyl([-0.46, 0.83, 1.24], [-0.46, 0.86, 1.24], 0.028, 0.028, 16));
  add(r, 'reservoir', rbox(0.12, 0.2, 0.18, 0.03, -0.46, 0.66, 2.0));
  add(r, 'capBlue', cyl([-0.46, 0.76, 2.0], [-0.46, 0.79, 2.0], 0.025, 0.025, 16));
  add(r, 'engine', cyl([0.38, 0.8, 0.98], [0.38, 0.8, 1.18], 0.04, 0.04, 20), cyl([0.38, 0.8, 0.95], [0.38, 0.8, 0.98], 0.1, 0.1, 28));
  add(r, 'reservoir', rbox(0.1, 0.06, 0.08, 0.02, 0.38, 0.86, 1.08));
  add(r, 'capYellow', cyl([0.38, 0.89, 1.08], [0.38, 0.91, 1.08], 0.02, 0.02, 14));
  add(r, 'black', rbox(0.2, 0.08, 0.14, 0.02, 0.44, 0.78, 1.34));
  add(r, 'black', rbox(0.12, 0.06, 0.1, 0.02, -0.44, 0.78, 1.52));
  // brake lines and harness along the firewall
  add(r, 'chrome', tube([[0.38, 0.78, 1.18], [0.3, 0.72, 1.12], [0.1, 0.7, 1.02], [-0.3, 0.7, 1.0], [-0.52, 0.66, 1.05]], 0.004, 5));
  add(r, 'black', tube([[0.5, 0.74, 1.4], [0.3, 0.72, 1.3], [0.0, 0.9, 1.3], [-0.3, 0.88, 1.35], [-0.46, 0.74, 1.6]], 0.01, 6));
  // hood latch + prop rod on the radiator support
  add(r, 'engineDark', rbox(0.08, 0.05, 0.04, 0.01, 0, 0.9, 2.1));
  add(r, 'chrome', cyl([-0.5, 0.9, 2.1], [-0.5, 0.92, 1.3], 0.005, 0.005, 6));
  return r;
}

export function engineBay(): { engine: RoleGeo; battery: RoleGeo; radiator: RoleGeo; fixed: RoleGeo } {
  return { engine: engine(), battery: battery(), radiator: radiator(), fixed: fixed() };
}

