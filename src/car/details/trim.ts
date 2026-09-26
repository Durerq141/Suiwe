// Exterior hardware: mirrors, handles, wipers, grille slats, intake mesh, fog lamps,
// plates, exhaust tips, antenna, trunk garnish.
import type { BufferGeometry } from 'three';
import { DIMS } from '../dims';
import { box, cyl, lathe, merge, mirrorX, rbox, tube, type P3 } from '../mesh/prims';

export type RoleGeo = Record<string, BufferGeometry[]>;
const add = (r: RoleGeo, role: string, ...g: BufferGeometry[]) => { (r[role] ??= []).push(...g); };

/** Front face z at (x, y) — matches the band's end-column design. */
function frontZ(x: number, y: number): number {
  const u = x / 0.85;
  const rows: [number, number][] = [[0.245, DIMS.zFront - 0.075 - 0.07 * u * u], [0.385, DIMS.zFront - 0.012 - 0.1 * u * u], [0.56, DIMS.zFront - 0.1 * u * u], [0.715, DIMS.zFront - 0.055 - 0.085 * u * u], [0.852, 2.27 - 0.055 * u * u]];
  for (let i = 0; i < rows.length - 1; i++) {
    const [y0, z0] = rows[i], [y1, z1] = rows[i + 1];
    if (y <= y1) return z0 + ((y - y0) / (y1 - y0)) * (z1 - z0);
  }
  return rows[rows.length - 1][1];
}

export function mirror(side: 1 | -1): RoleGeo {
  const r: RoleGeo = {};
  const cap = merge([rbox(0.21, 0.115, 0.1, 0.045, 0.02, 0, 0, 0, 0.12, 0)]);
  const glass = rbox(0.19, 0.098, 0.01, 0.03, 0.02, 0, -0.052, 0, 0.12, 0);
  const arm = rbox(0.12, 0.05, 0.05, 0.02, -0.06, -0.035, 0.01, 0, 0.3, 0);
  const base = rbox(0.11, 0.07, 0.03, 0.015, -0.115, -0.03, 0.02, 0, 0, 0);
  for (const g of [cap, glass, arm, base]) g.translate(0.99, 1.07, 0.6);
  // housing is authored with its long axis along x
  const out = (g: BufferGeometry) => (side > 0 ? g : mirrorX(g));
  add(r, 'paint', out(cap));
  add(r, 'mirror', out(glass));
  add(r, 'black', out(arm), out(base));
  return r;
}

export function handle(side: 1 | -1, z: number): RoleGeo {
  const g = rbox(0.028, 0.03, 0.14, 0.012, 0.955, 0.884, z);
  const pocket = rbox(0.01, 0.045, 0.1, 0.01, 0.95, 0.884, z + 0.005);
  const out = (x: BufferGeometry) => (side > 0 ? x : mirrorX(x));
  return { chrome: [out(g)], black: [out(pocket)] };
}

export function frontTrim(): RoleGeo {
  const r: RoleGeo = {};
  // upper grille: chrome slats following the nose curvature, recessed
  for (const y of [0.748, 0.786, 0.822]) {
    const pts: P3[] = [];
    for (let i = 0; i <= 20; i++) { const x = -0.48 + 0.96 * (i / 20); pts.push([x, y, frontZ(x, y) - 0.022]); }
    add(r, 'chrome', tube(pts, 0.0055, 8));
  }
  // badge
  add(r, 'chrome', lathe([[0.001, 0.006], [0.045, 0.005], [0.052, 0.0], [0.045, -0.002]].map(([a, b]) => [a, b] as [number, number]), [0, 0.786, frontZ(0, 0.786) - 0.012], [0, 0.786, frontZ(0, 0.786) + 1], 32).scale(1, 0.62, 1).translate(0, 0.786 * 0.38, 0));
  // lower intake mesh
  for (let i = 0; i <= 5; i++) {
    const y = 0.4 + 0.028 * i;
    const pts: P3[] = [];
    for (let k = 0; k <= 16; k++) { const x = -0.5 + (k / 16); pts.push([x, y, frontZ(x, y) - 0.03]); }
    add(r, 'black', tube(pts, 0.004, 6));
  }
  for (let k = 0; k <= 12; k++) {
    const x = -0.48 + (0.96 * k) / 12;
    add(r, 'black', cyl([x, 0.39, frontZ(x, 0.39) - 0.03], [x, 0.545, frontZ(x, 0.545) - 0.03], 0.004, 0.004, 5));
  }
  // fog lamps
  for (const s of [1, -1]) {
    const x = 0.66 * s, y = 0.41, z = frontZ(x, y);
    add(r, 'black', cyl([x, y, z - 0.03], [x, y, z + 0.004], 0.058, 0.058, 28));
    add(r, 'lampChrome', cyl([x, y, z - 0.024], [x, y, z + 0.003], 0.042, 0.04, 28, true));
    add(r, 'fog', cyl([x, y, z - 0.002], [x, y, z + 0.0055], 0.038, 0.038, 28));
  }
  // plate holder + plate (520 x 112 mm)
  const zp = frontZ(0, 0.46);
  add(r, 'black', rbox(0.56, 0.14, 0.016, 0.006, 0, 0.465, zp + 0.004));
  add(r, 'plate', box(0.52, 0.112, 0.004, 0, 0.465, zp + 0.014));
  return r;
}

export function rearTrim(): RoleGeo {
  const r: RoleGeo = {};
  // exhaust tips
  for (const s of [1, -1]) {
    const x = 0.52 * s;
    add(r, 'chrome', cyl([x, 0.305, -2.62], [x, 0.3, -2.9], 0.036, 0.042, 24, true));
    add(r, 'black', cyl([x, 0.305, -2.62], [x, 0.3, -2.86], 0.03, 0.03, 16, true), cyl([x, 0.304, -2.75], [x, 0.303, -2.76], 0.031, 0.031, 16));
    add(r, 'reflectorRed', rbox(0.12, 0.022, 0.012, 0.006, 0.7 * s, 0.53, -2.846 + 0.035 * 0.7 * 0.7));
  }
  return r;
}

export function trunkTrim(): RoleGeo {
  const r: RoleGeo = {};
  const z = (x: number, y: number) => DIMS.zRear + 0.022 + 0.075 * (x / 0.85) ** 2 + ((y - 0.64) / (0.862 - 0.64)) * (0.048 + (0.07 - 0.075) * (x / 0.85) ** 2);
  const pts: P3[] = [];
  for (let i = 0; i <= 18; i++) { const x = -0.44 + (0.88 * i) / 18; pts.push([x, 0.875, z(x, 0.875) + 0.006]); }
  add(r, 'chrome', tube(pts, 0.007, 8));
  add(r, 'plate', box(0.52, 0.112, 0.004, 0, 0.75, z(0, 0.75) - 0.004));
  add(r, 'black', rbox(0.56, 0.14, 0.012, 0.006, 0, 0.75, z(0, 0.75) - 0.012));
  return r;
}

export function shellTrim(): RoleGeo {
  const r: RoleGeo = {};
  // shark-fin antenna
  add(r, 'blackGloss', merge([rbox(0.05, 0.05, 0.16, 0.022, 0, 1.49, -1.2), rbox(0.04, 0.03, 0.1, 0.015, 0, 1.52, -1.23)]));
  // wiper arms resting on the cowl
  for (const [x0, x1] of [[0.02, 0.62], [-0.52, 0.06]]) {
    add(r, 'black', tube([[x0, 1.005, 0.87], [(x0 + x1) / 2, 1.012, 0.855], [x1, 1.02, 0.83]], 0.007, 6));
  }
  return r;
}
