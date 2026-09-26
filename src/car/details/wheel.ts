// 17" five-double-spoke alloy on a 235/55 R17 tyre, plus a ventilated disc and caliper.
// Built for the left side: axle along +x (outer face towards +x), centred at the origin.
import type { BufferGeometry } from 'three';
import { DIMS } from '../dims';
import { cyl, grid, lathe, merge, rbox, type P3 } from '../mesh/prims';

export interface WheelGeo {
  tire: BufferGeometry;
  rim: BufferGeometry;
  hub: BufferGeometry; // nuts + centre cap
  disc: BufferGeometry;
  caliper: BufferGeometry;
}

const W = DIMS.tyreW;
const R = DIMS.wheelR;
const RIM = 0.2159;

function tireGeo(): BufferGeometry {
  const h0 = -W / 2;
  const p: [number, number][] = [
    [RIM - 0.004, 0.014], [RIM + 0.02, 0.003], [RIM + 0.07, -0.004], [R - 0.03, 0.004], [R - 0.012, 0.016], [R - 0.003, 0.034],
  ];
  // tread with four circumferential grooves
  const tread: [number, number][] = [];
  const grooves = [0.07, 0.1, 0.135, 0.165];
  tread.push([R, 0.042]);
  for (const g of grooves) tread.push([R, g - 0.007], [R - 0.009, g - 0.005], [R - 0.009, g + 0.005], [R, g + 0.007]);
  tread.push([R, W - 0.042]);
  const back = p.map(([r, h]) => [r, W - h] as [number, number]).reverse();
  const prof = [...p, ...tread, ...back].map(([r, h]) => [r, h] as [number, number]);
  return lathe(prof, [h0, 0, 0], [h0 + 1, 0, 0], 72);
}

function rimGeo(): BufferGeometry {
  const xo = W / 2; // outer face plane
  const barrel = lathe([
    [RIM - 0.012, 0.02], [RIM - 0.006, 0.03], [RIM - 0.028, 0.06], [RIM - 0.03, W - 0.07], [RIM - 0.01, W - 0.035],
    [RIM + 0.004, W - 0.022], [RIM + 0.012, W - 0.012], [RIM + 0.006, W - 0.004], [RIM - 0.012, W - 0.006], [RIM - 0.03, W - 0.02],
  ], [-W / 2, 0, 0], [-W / 2 + 1, 0, 0], 72);
  const parts: BufferGeometry[] = [barrel];
  // hub face
  parts.push(lathe([[0.001, 0], [0.058, 0], [0.078, -0.006], [0.084, -0.02], [0.084, -0.04]].map(([r, h]) => [r, h] as [number, number]), [xo - 0.042, 0, 0], [xo - 0.042 - 1, 0, 0], 40));
  // five double spokes, concave: hub end sits deeper than the lip end
  for (let i = 0; i < 5; i++) {
    for (const off of [-0.105, 0.105]) {
      const a = (i / 5) * Math.PI * 2 + off;
      parts.push(spoke(a, off > 0 ? 1 : -1, xo));
    }
  }
  return merge(parts);
}

function spoke(a: number, lean: number, xo: number): BufferGeometry {
  // cross-section rows from hub (r0) to lip (r1); each row: 4 corners of a tapered beam
  const rows: P3[][] = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const r = 0.07 + (RIM - 0.075) * t;
    const halfW = 0.0165 - 0.006 * t;
    const depth = 0.034 - 0.012 * t;
    const x = xo - 0.045 + 0.034 * Math.sqrt(t); // concave dish
    const ang = a + lean * 0.06 * t; // spokes of a pair converge slightly towards the lip
    const c = Math.cos(ang), s = Math.sin(ang);
    const tx = -s, ty = c; // tangential
    const pt = (u: number, d: number): P3 => [x - d, c * r + tx * u, s * r + ty * u];
    rows.push([pt(-halfW, 0), pt(halfW, 0), pt(halfW * 0.9, depth), pt(-halfW * 0.9, depth)]);
  }
  return grid(rows, true, true);
}

function hubGeo(): BufferGeometry {
  const xo = W / 2 - 0.042;
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 5;
    const y = Math.cos(a) * 0.05, z = Math.sin(a) * 0.05;
    parts.push(cyl([xo, y, z], [xo + 0.016, y, z], 0.0105, 0.0095, 6));
  }
  parts.push(lathe([[0.001, 0.012], [0.02, 0.011], [0.03, 0.006], [0.033, 0]].map(([r, h]) => [r, h] as [number, number]), [xo, 0, 0], [xo + 1, 0, 0], 32));
  return merge(parts);
}

export function buildWheel(): WheelGeo {
  const discX = W / 2 - 0.105;
  const disc = merge([
    cyl([discX - 0.014, 0, 0], [discX + 0.014, 0, 0], 0.163, 0.163, 48),
    cyl([discX + 0.014, 0, 0], [discX + 0.05, 0, 0], 0.085, 0.085, 32),
  ]);
  // caliper hugging the disc at the rear-top
  const caliper = merge([
    rbox(0.07, 0.13, 0.06, 0.012, discX, 0.105, -0.075, -0.62),
    rbox(0.03, 0.09, 0.04, 0.008, discX + 0.034, 0.1, -0.07, -0.62),
  ]);
  return { tire: tireGeo(), rim: rimGeo(), hub: hubGeo(), disc, caliper };
}
