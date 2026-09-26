// 17" five-double-spoke alloy on a 235/55 R17 tyre, plus a ventilated disc and caliper.
// Built for the left side: axle along +x (outer face towards +x), centred at the origin.
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { DIMS } from '../dims';
import { cyl, lathe, merge, rbox, type P3 } from '../mesh/prims';

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
  return merge([barrel, castFace(xo)]);
}

/**
 * Cast wheel face on a polar grid: 5 twin spokes, trapezoid windows between them,
 * concave dish, every window closed by side walls so the spokes have real depth.
 */
function castFace(xo: number): BufferGeometry {
  const NA = 150, NR = 14;
  const r0 = 0.03, r1 = RIM - 0.008;
  const radius = (i: number) => r0 + ((r1 - r0) * i) / NR;
  const depth = (r: number) => xo - 0.058 + 0.05 * Math.sqrt((r - r0) / (r1 - r0)); // face plane (concave)
  const T = 0.03; // spoke thickness
  const solid = (ia: number, ir: number) => {
    const r = radius(ir + 0.5);
    if (r < 0.088 || r > r1 - 0.014) return true; // hub and lip ring
    const a = ((ia + 0.5) / NA) * Math.PI * 2;
    const per = (Math.PI * 2) / 5;
    const u = (((a % per) + per) % per) - per / 2; // angle from pair centre
    const t = (r - 0.088) / (r1 - 0.014 - 0.088);
    const arc = Math.abs(u) * r; // distance from the pair centre along the arc (m)
    const slot = 0.0035 + 0.004 * (1 - t); // half-slot between the twin spokes
    const spokeW = 0.021 + 0.014 * t; // each spoke widens towards the lip
    return arc > slot && arc < slot + spokeW;
  };
  const P = (ia: number, ir: number, dx = 0): P3 => {
    const a = (ia / NA) * Math.PI * 2, r = radius(ir);
    return [depth(r) + dx, Math.cos(a) * r, Math.sin(a) * r];
  };
  const pos: number[] = [];
  const quad = (a: P3, b: P3, c: P3, d: P3) => { for (const p of [a, b, c, a, c, d]) pos.push(p[0], p[1], p[2]); };
  for (let ia = 0; ia < NA; ia++) for (let ir = 0; ir < NR; ir++) {
    if (!solid(ia, ir)) continue;
    const ia2 = (ia + 1) % NA;
    quad(P(ia, ir), P(ia, ir + 1), P(ia2, ir + 1), P(ia2, ir));
    quad(P(ia, ir, -T), P(ia2, ir, -T), P(ia2, ir + 1, -T), P(ia, ir + 1, -T));
    // walls towards open neighbours
    if (!solid((ia - 1 + NA) % NA, ir)) quad(P(ia, ir), P(ia, ir, -T), P(ia, ir + 1, -T), P(ia, ir + 1));
    if (!solid(ia2, ir)) quad(P(ia2, ir), P(ia2, ir + 1), P(ia2, ir + 1, -T), P(ia2, ir, -T));
    if (ir > 0 && !solid(ia, ir - 1)) quad(P(ia, ir), P(ia2, ir), P(ia2, ir, -T), P(ia, ir, -T));
    if (ir < NR - 1 && !solid(ia, ir + 1)) quad(P(ia, ir + 1), P(ia, ir + 1, -T), P(ia2, ir + 1, -T), P(ia2, ir + 1));
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
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
