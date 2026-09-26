// Structure behind the skin: floor pan, wheel-well liners, engine bay, trunk tub and
// cabin floor. Everything a player can look into through an opening is closed.
import type { BufferGeometry } from 'three';
import { DIMS } from '../dims';
import { box, cyl, grid, merge, type P3 } from '../mesh/prims';

export type RoleGeo = Record<string, BufferGeometry[]>;
const push = (r: RoleGeo, role: string, ...g: BufferGeometry[]) => { (r[role] ??= []).push(...g); };

/** Half-cylinder liner shell over a wheel (open towards the ground). */
function liner(zc: number, side: 1 | -1): BufferGeometry {
  const r = DIMS.archR + 0.018;
  const x0 = 0.56 * side, x1 = 0.955 * side;
  const rows: P3[][] = [];
  const n = 22;
  for (const x of [x1, x0]) {
    const row: P3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = -0.18 + (Math.PI + 0.36) * (i / n); // a little past horizontal on both ends
      row.push([x, DIMS.archY + Math.sin(a) * r, zc + Math.cos(a) * r]);
    }
    rows.push(row);
  }
  const shell = grid(rows, false, side < 0);
  // inner wall closing the well towards the engine bay / cabin
  const wall: P3[][] = [[], []];
  for (let i = 0; i <= n; i++) {
    const a = -0.18 + (Math.PI + 0.36) * (i / n);
    wall[0].push([x0, DIMS.archY + Math.sin(a) * r, zc + Math.cos(a) * r]);
    wall[1].push([x0, DIMS.archY - 0.06, zc + Math.cos(a) * r]);
  }
  return merge([shell, grid(wall, false, side > 0)]);
}

export function buildClosures(): RoleGeo {
  const r: RoleGeo = {};
  const { axleF, axleR } = DIMS;
  // underbody pans
  // pans sit just above the skin's lowest edges and inside its outline
  push(r, 'under',
    box(1.72, 0.03, 2.1, 0, 0.262, 0.0),
    box(1.08, 0.03, 1.5, 0, 0.275, 1.72),
    box(1.46, 0.03, 0.34, 0, 0.285, 2.16),
    box(1.08, 0.03, 0.95, 0, 0.3, -1.47),
    box(1.56, 0.03, 0.74, 0, 0.318, -2.38),
  );
  for (const s of [1, -1] as const) push(r, 'liner', liner(axleF, s), liner(axleR, s));

  // engine bay: firewall, cowl plenum, aprons with strut towers, radiator support
  const bay: BufferGeometry[] = [
    box(1.62, 0.66, 0.03, 0, 0.62, 0.935),
    box(1.66, 0.03, 0.14, 0, 0.95, 0.99, 0.18),
    box(1.26, 0.5, 0.035, 0, 0.555, 2.13),
  ];
  for (const s of [1, -1]) {
    bay.push(box(0.03, 0.44, 1.12, 0.6 * s, 0.63, 1.55));
    bay.push(box(0.23, 0.025, 1.12, 0.715 * s, 0.855, 1.55, 0, 0, -0.06 * s));
    bay.push(cyl([0.6 * s, 0.6, axleF - 0.02], [0.585 * s, 0.9, axleF - 0.02], 0.1, 0.085, 24));
  }
  push(r, 'paintIn', ...bay);
  push(r, 'black', box(1.5, 0.012, 0.1, 0, 0.972, 0.965, 0.2)); // cowl vent grille

  // trunk tub
  push(r, 'carpet',
    box(1.58, 0.03, 1.12, 0, 0.5, -2.2),
    box(1.58, 0.52, 0.03, 0, 0.76, -1.66),
    box(0.03, 0.46, 1.08, 0.79, 0.74, -2.2),
    box(0.03, 0.46, 1.08, -0.79, 0.74, -2.2),
    box(1.46, 0.42, 0.03, 0, 0.71, -2.73),
  );
  push(r, 'trim', box(1.62, 0.025, 0.5, 0, 1.03, -1.86, -0.12)); // parcel shelf

  // cabin floor with transmission tunnel
  push(r, 'carpet',
    box(1.72, 0.03, 2.58, 0, DIMS.yFloor, -0.36),
    box(0.26, 0.16, 2.1, 0, DIMS.yFloor + 0.08, -0.2),
  );
  return r;
}
