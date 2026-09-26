// The sedan's body cage: a band that runs around the car (bumpers, fenders, doors,
// quarters) plus a top grid (hood, windshield, roof, rear window, deck). Row 4 of the
// band *is* the boundary of the top grid, so the refined skin is one watertight surface.
// Points are authored on the surface; fitCage() solves for the control points.
import { DIMS } from '../dims';
import { curve, lerp } from './curves';
import { type QuadMesh, edgeKey, fitCage } from '../mesh/subdiv';

export const TAGS = [
  'roof', 'aPillar', 'cPillar', 'quarter', 'rocker', 'cowl',
  'hood', 'trunk', 'fender_fl', 'fender_fr',
  'door_fl', 'door_fr', 'door_rl', 'door_rr',
  'frame_fl', 'frame_fr', 'frame_rl', 'frame_rr',
  'glass_fl', 'glass_fr', 'glass_rl', 'glass_rr',
  'windshield', 'window_r', 'bumper_f', 'bumper_r',
  'headlight_l', 'headlight_r', 'taillight_l', 'taillight_r',
  'grille', 'intake', 'plate_r',
] as const;
export type Tag = (typeof TAGS)[number];
export const TAG_ID = Object.fromEntries(TAGS.map((t, i) => [t, i])) as Record<Tag, number>;

/** Side stations: rows of the top grid and side columns of the band (front -> rear). */
export const Z = [
  2.27, 2.08, // 0 front corner, 1 headlight rear
  1.9, 1.76, 1.58, 1.45, 1.32, 1.14, 1.0, // 2..8 front arch
  0.9, 0.5, 0.1, // 9 cowl, 10 windshield mid, 11 roof front
  -0.13, -0.33, -0.4, -0.48, -0.8, // 12..16 cabin, door split at 14
  -1.0, -1.16, -1.34, -1.45, -1.58, -1.76, -1.9, // 17..23 rear arch
  -2.12, -2.5, -2.72, // 24 deck front, 25 tail, 26 rear corner
] as const;
const N = Z.length;
const F = 9; // top-grid columns: c0 belt, c1 glass top / seam, c2 rail, c3 mid, c4 centre, mirrored

const J = { cowl: 9, wsMid: 10, roofF: 11, bFront: 13, split: 14, bRear: 15, archR0: 17, cStart: 18, rwTop: 19, axleR: 20, deck: 24, tail: 25 } as const;
const FRONT_ARCH = [2, 8] as const;
const REAR_ARCH = [17, 23] as const;

// ------------------------------------------------------------------ design lines
const beltY = curve([[2.27, 0.83], [2.08, 0.862], [1.45, 0.93], [0.9, 0.985], [0.1, 1.0], [-0.4, 1.016], [-1.34, 1.05], [-2.12, 1.07], [-2.5, 1.072], [-2.72, 1.06]]);
const beltX = curve([[2.27, 0.78], [2.08, 0.862], [1.45, 0.898], [0.9, 0.89], [-0.4, 0.882], [-1.45, 0.892], [-2.12, 0.884], [-2.5, 0.858], [-2.72, 0.79]]);
const sideX = curve([[2.27, 0.83], [2.08, 0.912], [1.45, 0.962], [0.9, 0.951], [-0.4, 0.953], [-1.45, 0.964], [-2.12, 0.948], [-2.5, 0.908], [-2.72, 0.84]]);
const row0Y = curve([[2.27, 0.25], [1.9, 0.262], [1.0, 0.232], [-1.0, 0.232], [-1.9, 0.28], [-2.72, 0.3]]);
const row1Y = curve([[2.27, 0.39], [1.9, 0.4], [1.0, 0.33], [-1.0, 0.33], [-1.9, 0.43], [-2.72, 0.45]]);
const row3Y = curve([[2.27, 0.7], [2.08, 0.735], [1.45, 0.83], [0.9, 0.862], [-0.4, 0.878], [-1.45, 0.9], [-2.12, 0.905], [-2.5, 0.88], [-2.72, 0.868]]);
const hoodY = curve([[2.3, 0.852], [1.9, 0.9], [1.45, 0.944], [1.0, 0.978], [0.9, 0.988]]);
const roofY = curve([[0.1, 1.418], [-0.13, 1.466], [-0.4, 1.49], [-0.8, 1.488], [-1.16, 1.466], [-1.34, 1.435]]);
const deckY = curve([[-2.12, 1.078], [-2.5, 1.088], [-2.72, 1.082]]);

// top-grid column half-widths per region (c1, c2, c3)
function topX(j: number): [number, number, number] {
  const z = Z[j];
  if (j <= J.cowl) {
    const b = beltX(z);
    return [b - 0.075, b * 0.66, b * 0.33];
  }
  if (j <= J.roofF) {
    const t = (j - J.cowl) / (J.roofF - J.cowl);
    return [lerp(0.815, 0.742, t), lerp(0.752, 0.688, t), lerp(0.4, 0.37, t)];
  }
  if (j <= J.rwTop) return [0.742, 0.688, 0.37];
  if (j <= J.deck) {
    const t = (j - J.rwTop) / (J.deck - J.rwTop);
    return [lerp(0.742, 0.81, t), lerp(0.688, 0.7, t), lerp(0.37, 0.36, t)];
  }
  const b = beltX(z);
  return [b - 0.085, b * 0.68, b * 0.34];
}

// height of the top surface at column c (1..4) of row j
function topY(j: number, c: number): number {
  const z = Z[j];
  const fall = [0, 0, 0, 0, 0]; // per-column drop below the centre line
  if (j <= J.cowl) {
    const y = hoodY(z);
    fall[1] = 0.03; fall[2] = 0.012; fall[3] = 0.004;
    return y - fall[c] + (c === 2 ? 0.004 : 0); // subtle power-bulge line along c2
  }
  if (j <= J.roofF) {
    const yc = j === J.cowl ? 0.988 : j === J.wsMid ? 1.222 : 1.418;
    fall[1] = j === J.roofF ? 0.075 : 0.02; fall[2] = j === J.roofF ? 0.03 : 0.012; fall[3] = 0.008;
    return yc - fall[c];
  }
  if (j <= J.rwTop) {
    fall[1] = 0.1; fall[2] = 0.035; fall[3] = 0.01;
    return roofY(z) - fall[c];
  }
  if (j <= J.deck) {
    const t = (j - J.rwTop) / (J.deck - J.rwTop);
    const yc = lerp(1.435, 1.078, Math.pow(t, 1.08));
    fall[1] = lerp(0.1, 0.03, t); fall[2] = lerp(0.035, 0.012, t); fall[3] = 0.008;
    return yc - fall[c];
  }
  fall[1] = 0.022; fall[2] = 0.008; fall[3] = 0.003;
  return deckY(z) - fall[c];
}

// plan curvature: glass wraps, hood/deck ends are rounded
function topDz(j: number, x: number): number {
  const u = x / 0.8;
  if (j === 0) return -0.055 * u * u;
  if (j === N - 1) return 0.05 * u * u;
  if (j >= J.cowl && j <= J.roofF) return -0.05 * u * u * (j === J.roofF ? 0.5 : 1);
  if (j >= J.rwTop && j <= J.deck) return 0.045 * u * u * (j === J.rwTop ? 0.5 : 1);
  return 0;
}

// wheel-arch opening edge: the band's bottom edge follows it
function archY(z: number, zc: number, r: number): number {
  const dz = z - zc;
  return DIMS.archY + Math.sqrt(Math.max(0, r * r - dz * dz));
}

// ------------------------------------------------------------------- cage build

export interface BodyCage extends QuadMesh {
  /** grid bookkeeping used by trim/detail builders */
  top: number[][]; // [j][c] -> vertex
  band: number[][]; // [k][row 0..4] -> vertex
  loop: { side: 'F' | 'L' | 'B' | 'R'; j: number; c: number }[];
}

export function buildBodyCage(): BodyCage {
  const pts: number[] = [];
  const add = (x: number, y: number, z: number) => { pts.push(x, y, z); return pts.length / 3 - 1; };

  // top grid
  const top: number[][] = [];
  for (let j = 0; j < N; j++) {
    const row: number[] = [];
    const [x1, x2, x3] = topX(j);
    const xs = [0, x1, x2, x3, 0];
    for (let c = 0; c < F; c++) {
      const cc = c <= 4 ? c : 8 - c;
      const s = c <= 4 ? 1 : -1;
      if (cc === 0) { row.push(-1); continue; } // belt vertex belongs to the band, filled below
      const x = xs[cc] * s;
      row.push(add(x, topY(j, cc), Z[j] + topDz(j, xs[cc])));
    }
    top.push(row);
  }

  // band loop (see header): front R->L, left F->B, rear L->R, right B->F
  const loop: BodyCage['loop'] = [];
  for (let c = 8; c >= 1; c--) loop.push({ side: 'F', j: 0, c });
  for (let j = 0; j <= N - 2; j++) loop.push({ side: 'L', j, c: 0 });
  for (let c = 0; c <= 7; c++) loop.push({ side: 'B', j: N - 1, c });
  for (let j = N - 1; j >= 1; j--) loop.push({ side: 'R', j, c: 8 });

  const band: number[][] = [];
  const corners = new Set<number>();
  for (const col of loop) {
    const rows = bandColumn(col, top);
    const ids = rows.slice(0, 4).map((p) => add(p[0], p[1], p[2]));
    let topId = top[col.j][col.c];
    if (topId < 0) { topId = add(rows[4][0], rows[4][1], rows[4][2]); top[col.j][col.c] = topId; }
    band.push([...ids, topId]);
    // crisp corners where an arch meets the sill/bumper line
    if (col.side === 'L' || col.side === 'R') {
      if (col.j === FRONT_ARCH[0] || col.j === FRONT_ARCH[1] || col.j === REAR_ARCH[0] || col.j === REAR_ARCH[1]) corners.add(ids[0]);
    }
  }

  // faces
  const quads: number[] = [];
  const tags: number[] = [];
  const face = (a: number, b: number, c: number, d: number, tag: Tag) => { quads.push(a, b, c, d); tags.push(TAG_ID[tag]); };
  const L = loop.length;
  for (let k = 0; k < L; k++) {
    const k2 = (k + 1) % L;
    for (let r = 0; r < 4; r++) face(band[k][r], band[k2][r], band[k2][r + 1], band[k][r + 1], bandTag(loop[k], loop[k2], r));
  }
  for (let j = 0; j < N - 1; j++) {
    for (let c = 0; c < F - 1; c++) face(top[j][c], top[j + 1][c], top[j + 1][c + 1], top[j][c + 1], topTag(j, c));
  }

  // creases: shoulder all around, hood/deck edges, glass surrounds
  const crease = new Map<number, number>();
  const setCrease = (a: number, b: number, s: number) => crease.set(edgeKey(a, b), s);
  for (let k = 0; k < L; k++) setCrease(band[k][4], band[(k + 1) % L][4], 1.6);
  for (let k = 0; k < L; k++) {
    const col = loop[k];
    // character line along the doors
    if ((col.side === 'L' || col.side === 'R') && col.j >= 1 && col.j < N - 1) {
      const nxt = loop[(k + 1) % L];
      if (nxt.side === col.side) setCrease(band[k][3], band[(k + 1) % L][3], 0.7);
    }
  }
  const glassRows: [number, number, number, number][] = [[J.cowl, J.roofF, 2, 6], [J.rwTop, J.deck, 2, 6]];
  for (const [j0, j1, c0, c1] of glassRows) {
    for (let j = j0; j < j1; j++) { setCrease(top[j][c0], top[j + 1][c0], 1); setCrease(top[j][c1], top[j + 1][c1], 1); }
  }
  for (let j = J.roofF; j < J.rwTop; j++) { setCrease(top[j][1], top[j + 1][1], 1); setCrease(top[j][7], top[j + 1][7], 1); }

  const targets = new Float64Array(pts);
  const cage: QuadMesh = { pos: targets, quads: new Int32Array(quads), tags: new Uint16Array(tags), crease, corners };
  const fitted = fitCage(cage, targets, 2, 10);
  return { ...fitted, top, band, loop };
}

// ------------------------------------------------------------------ band columns

/** Five surface points (bottom -> top) for one band column. */
function bandColumn(col: { side: 'F' | 'L' | 'B' | 'R'; j: number; c: number }, top: number[][]): number[][] {
  // the loop's end rows start/finish on a corner cell; corners are side columns
  if ((col.side === 'F' || col.side === 'B') && col.c !== 0 && col.c !== 8) return endColumn(col.side, col.c, top);
  const s = col.side === 'L' || col.c === 0 ? 1 : -1;
  const j = col.j;
  const z = Z[j];
  const sx = sideX(z);
  let y0 = row0Y(z), y1 = row1Y(z);
  let y3 = row3Y(z);
  const y4 = beltY(z), x4 = beltX(z);
  let x0 = sx - 0.05, x1 = sx - 0.012;
  const inArch = (j > FRONT_ARCH[0] && j < FRONT_ARCH[1]) || (j > REAR_ARCH[0] && j < REAR_ARCH[1]);
  if (inArch) {
    const zc = j < 12 ? DIMS.axleF : DIMS.axleR;
    y0 = archY(z, zc, DIMS.archR);
    y1 = archY(z, zc, DIMS.archR + 0.045);
    x0 = sx - 0.004; x1 = sx + 0.004; // flared lip
    y3 = Math.max(y3, y1 + 0.05);
  }
  let y2 = lerp(y1, y3, 0.5);
  if (inArch) y2 = lerp(y1, y3, 0.4);
  // plan rounding at the corners
  let z0 = z, z1 = z, z2 = z, z3 = z, z4 = z;
  if (j === 0 || j === N - 1) {
    const dir = j === 0 ? 1 : -1;
    const push = j === 0 ? [0.03, 0.062, 0.066, 0.045, 0] : [0.02, 0.045, 0.05, 0.035, 0];
    z0 += dir * push[0]; z1 += dir * push[1]; z2 += dir * push[2]; z3 += dir * push[3]; z4 += dir * push[4];
  }
  return [
    [x0 * s, y0, z0],
    [x1 * s, y1, z1],
    [sx * s, y2, z2],
    [(sx - 0.006) * s, y3, z3],
    [x4 * s, y4, z4],
  ];
}

/** Front / rear face columns (x taken from the top grid's end row). */
function endColumn(side: 'F' | 'B', c: number, top: number[][]): number[][] {
  const cc = c <= 4 ? c : 8 - c;
  const s = c <= 4 ? 1 : -1;
  const j = side === 'F' ? 0 : N - 1;
  const [x1, x2, x3] = topX(j);
  const x = [0, x1, x2, x3, 0][cc];
  const u = x / 0.85;
  void top;
  if (side === 'F') {
    const zb = DIMS.zFront;
    return [
      [x * s, 0.245, zb - 0.075 - 0.07 * u * u],
      [x * s, 0.385, zb - 0.012 - 0.1 * u * u],
      [x * s, 0.56, zb - 0.1 * u * u],
      [x * s, 0.715, zb - 0.055 - 0.085 * u * u],
      [x * s, topY(0, cc), Z[0] + topDz(0, x)],
    ];
  }
  const zb = DIMS.zRear;
  return [
    [x * s, 0.3, zb + 0.07 + 0.06 * u * u],
    [x * s, 0.45, zb + 0.006 + 0.075 * u * u],
    [x * s, 0.64, zb + 0.022 + 0.075 * u * u],
    [x * s, 0.862, zb + 0.07 + 0.07 * u * u],
    [x * s, topY(N - 1, cc), Z[N - 1] + topDz(N - 1, x)],
  ];
}

// ---------------------------------------------------------------------- tagging

type Col = { side: 'F' | 'L' | 'B' | 'R'; j: number; c: number };

function bandTag(a: Col, b: Col, r: number): Tag {
  // front face (and the corner quads that join it)
  if (a.side === 'F') return frontTag(a, b, r);
  if (a.side === 'B') return rearTag(a, b, r);
  const left = a.side === 'L';
  const j = left ? a.j : b.j; // front-most station of the quad
  const jn = left ? b.j : a.j;
  const lr = left ? 'l' : 'r';
  const fl = left ? 'fl' : 'fr';
  const rl = left ? 'rl' : 'rr';
  // corner quads between the front face and the side
  if (j === 0) return r === 3 ? (`headlight_${lr}` as Tag) : r >= 2 ? (`fender_${fl}` as Tag) : 'bumper_f';
  if (jn === N - 1 || j === N - 2) return r === 3 ? (`taillight_${lr}` as Tag) : r >= 2 ? 'quarter' : 'bumper_r';
  if (j < FRONT_ARCH[0]) return r >= 2 ? (`fender_${fl}` as Tag) : 'bumper_f';
  if (j < J.cowl) return `fender_${fl}` as Tag;
  if (j < J.split) return r === 0 ? 'rocker' : (`door_${fl}` as Tag);
  if (j < J.axleR) return r === 0 && j < REAR_ARCH[0] ? 'rocker' : (`door_${rl}` as Tag);
  if (j < REAR_ARCH[1]) return 'quarter';
  return r >= 2 ? 'quarter' : 'bumper_r';
}

function frontTag(a: Col, b: Col, r: number): Tag {
  // the left corner column (L, j=0) acts as c=0; distance from the side: 0 corner .. 4 centre
  const ca = a.side === 'F' ? a.c : 0, cb = b.side === 'F' ? b.c : 0;
  const lo = Math.min(ca <= 4 ? ca : 8 - ca, cb <= 4 ? cb : 8 - cb);
  const lr = ca + cb < 8 ? 'l' : 'r';
  if (r === 3) return lo <= 1 ? (`headlight_${lr}` as Tag) : 'grille';
  if (r === 1 && lo >= 2) return 'intake';
  return 'bumper_f';
}

function rearTag(a: Col, b: Col, r: number): Tag {
  // the right corner column (R, j=N-1) acts as c=8
  const ca = a.side === 'B' ? a.c : 8, cb = b.side === 'B' ? b.c : 8;
  const lo = Math.min(ca <= 4 ? ca : 8 - ca, cb <= 4 ? cb : 8 - cb);
  const lr = ca + cb < 8 ? 'l' : 'r';
  if (r === 3) return lo <= 1 ? (`taillight_${lr}` as Tag) : 'trunk';
  if (r === 2) return lo <= 1 ? 'bumper_r' : lo === 3 ? 'plate_r' : 'trunk';
  return 'bumper_r';
}

function topTag(j: number, c: number): Tag {
  const cc = c <= 3 ? c : 7 - c; // 0..3 from the side inwards
  const left = c <= 3;
  const lr = left ? 'l' : 'r';
  if (j < J.cowl) return cc === 0 ? (left ? 'fender_fl' : 'fender_fr') : 'hood';
  if (j < J.roofF) {
    if (cc >= 2) return 'windshield';
    if (cc === 1) return 'aPillar';
    return j === J.cowl ? (`frame_f${lr}` as Tag) : (`glass_f${lr}` as Tag);
  }
  if (j < J.rwTop) {
    if (cc >= 1) return 'roof';
    if (j < J.bFront) return `glass_f${lr}` as Tag;
    if (j < J.split) return `frame_f${lr}` as Tag;
    if (j < J.bRear) return `frame_r${lr}` as Tag;
    if (j < J.cStart) return `glass_r${lr}` as Tag;
    return 'cPillar';
  }
  if (j < J.deck) return cc >= 2 ? 'window_r' : 'cPillar';
  return cc === 0 ? 'quarter' : 'trunk';
}

