// Catmull–Clark subdivision for quad cages with per-face tags, sharp creases and open
// boundaries. The car body is authored as a coarse cage and refined into a smooth skin;
// every refined quad remembers the tag of the cage face it came from, so panels can be
// cut out along cage edges without any gaps between them.

export type V3 = [number, number, number];

export interface QuadMesh {
  pos: Float64Array; // xyz per vertex
  quads: Int32Array; // 4 indices per face, CCW seen from outside
  tags: Uint16Array; // per face
  /** crease sharpness per undirected edge, keyed by edgeKey(); boundaries are always sharp */
  crease: Map<number, number>;
  /** vertices that must not move (corners) */
  corners?: Set<number>;
}

export const edgeKey = (a: number, b: number): number => (a < b ? a * 1048576 + b : b * 1048576 + a);

interface EdgeInfo {
  a: number;
  b: number;
  faces: number[];
}

function buildEdges(m: QuadMesh): { edges: EdgeInfo[]; index: Map<number, number> } {
  const edges: EdgeInfo[] = [];
  const index = new Map<number, number>();
  const nf = m.quads.length / 4;
  for (let f = 0; f < nf; f++) {
    for (let k = 0; k < 4; k++) {
      const a = m.quads[f * 4 + k];
      const b = m.quads[f * 4 + ((k + 1) & 3)];
      const key = edgeKey(a, b);
      let e = index.get(key);
      if (e === undefined) {
        e = edges.length;
        index.set(key, e);
        edges.push({ a, b, faces: [f] });
      } else edges[e].faces.push(f);
    }
  }
  return { edges, index };
}

/** One Catmull–Clark step. Vertex i of the input stays vertex i of the output. */
export function subdivide(m: QuadMesh): QuadMesh {
  const nv = m.pos.length / 3;
  const nf = m.quads.length / 4;
  const { edges, index } = buildEdges(m);
  const ne = edges.length;
  const out = new Float64Array((nv + ne + nf) * 3);
  const P = m.pos;

  // face points
  const fBase = nv + ne;
  for (let f = 0; f < nf; f++) {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 4; k++) {
      const v = m.quads[f * 4 + k];
      x += P[v * 3]; y += P[v * 3 + 1]; z += P[v * 3 + 2];
    }
    const o = (fBase + f) * 3;
    out[o] = x / 4; out[o + 1] = y / 4; out[o + 2] = z / 4;
  }

  const sharpOf = (e: EdgeInfo) => (e.faces.length < 2 ? Infinity : m.crease.get(edgeKey(e.a, e.b)) ?? 0);

  // edge points
  for (let i = 0; i < ne; i++) {
    const e = edges[i];
    const o = (nv + i) * 3;
    const s = sharpOf(e);
    const mx = (P[e.a * 3] + P[e.b * 3]) / 2, my = (P[e.a * 3 + 1] + P[e.b * 3 + 1]) / 2, mz = (P[e.a * 3 + 2] + P[e.b * 3 + 2]) / 2;
    if (s >= 1) {
      out[o] = mx; out[o + 1] = my; out[o + 2] = mz;
    } else {
      const f0 = (fBase + e.faces[0]) * 3, f1 = (fBase + e.faces[1]) * 3;
      const sx = (P[e.a * 3] + P[e.b * 3] + out[f0] + out[f1]) / 4;
      const sy = (P[e.a * 3 + 1] + P[e.b * 3 + 1] + out[f0 + 1] + out[f1 + 1]) / 4;
      const sz = (P[e.a * 3 + 2] + P[e.b * 3 + 2] + out[f0 + 2] + out[f1 + 2]) / 4;
      // fractional sharpness blends smooth and sharp rules
      out[o] = sx + (mx - sx) * s; out[o + 1] = sy + (my - sy) * s; out[o + 2] = sz + (mz - sz) * s;
    }
  }

  // vertex points
  const vEdges: number[][] = Array.from({ length: nv }, () => []);
  for (let i = 0; i < ne; i++) { vEdges[edges[i].a].push(i); vEdges[edges[i].b].push(i); }
  const vFaces: number[][] = Array.from({ length: nv }, () => []);
  for (let f = 0; f < nf; f++) for (let k = 0; k < 4; k++) vFaces[m.quads[f * 4 + k]].push(f);

  for (let v = 0; v < nv; v++) {
    const o = v * 3;
    const px = P[o], py = P[o + 1], pz = P[o + 2];
    const es = vEdges[v];
    if (!es.length) { out[o] = px; out[o + 1] = py; out[o + 2] = pz; continue; }
    const sharp = es.filter((i) => sharpOf(edges[i]) >= 1);
    if (m.corners?.has(v) || sharp.length > 2) {
      out[o] = px; out[o + 1] = py; out[o + 2] = pz;
    } else if (sharp.length === 2) {
      const other = (i: number) => (edges[i].a === v ? edges[i].b : edges[i].a);
      const a = other(sharp[0]), b = other(sharp[1]);
      out[o] = (P[a * 3] + 6 * px + P[b * 3]) / 8;
      out[o + 1] = (P[a * 3 + 1] + 6 * py + P[b * 3 + 1]) / 8;
      out[o + 2] = (P[a * 3 + 2] + 6 * pz + P[b * 3 + 2]) / 8;
    } else {
      const n = es.length;
      let qx = 0, qy = 0, qz = 0;
      for (const f of vFaces[v]) { const fo = (fBase + f) * 3; qx += out[fo]; qy += out[fo + 1]; qz += out[fo + 2]; }
      const fn = vFaces[v].length;
      qx /= fn; qy /= fn; qz /= fn;
      let rx = 0, ry = 0, rz = 0;
      for (const i of es) {
        const e = edges[i];
        rx += (P[e.a * 3] + P[e.b * 3]) / 2; ry += (P[e.a * 3 + 1] + P[e.b * 3 + 1]) / 2; rz += (P[e.a * 3 + 2] + P[e.b * 3 + 2]) / 2;
      }
      rx /= n; ry /= n; rz /= n;
      out[o] = (qx + 2 * rx + (n - 3) * px) / n;
      out[o + 1] = (qy + 2 * ry + (n - 3) * py) / n;
      out[o + 2] = (qz + 2 * rz + (n - 3) * pz) / n;
    }
  }

  // topology
  const quads = new Int32Array(nf * 16);
  const tags = new Uint16Array(nf * 4);
  const crease = new Map<number, number>();
  for (let f = 0; f < nf; f++) {
    const fp = fBase + f;
    for (let k = 0; k < 4; k++) {
      const v = m.quads[f * 4 + k];
      const vn = m.quads[f * 4 + ((k + 1) & 3)];
      const vp = m.quads[f * 4 + ((k + 3) & 3)];
      const eN = nv + index.get(edgeKey(v, vn))!;
      const eP = nv + index.get(edgeKey(vp, v))!;
      const q = (f * 4 + k) * 4;
      quads[q] = v; quads[q + 1] = eN; quads[q + 2] = fp; quads[q + 3] = eP;
      tags[f * 4 + k] = m.tags[f];
    }
  }
  for (let i = 0; i < ne; i++) {
    const e = edges[i];
    const s = m.crease.get(edgeKey(e.a, e.b));
    if (s && s > 0) {
      const child = Math.max(0, s - 1);
      if (child > 0) { crease.set(edgeKey(e.a, nv + i), child); crease.set(edgeKey(nv + i, e.b), child); }
    }
  }
  return { pos: out, quads, tags, crease, corners: m.corners };
}

export function subdivideN(m: QuadMesh, levels: number): QuadMesh {
  let r = m;
  for (let i = 0; i < levels; i++) r = subdivide(r);
  return r;
}

/**
 * Moves cage vertices so that, after `levels` refinements, vertex i lands on target i.
 * Lets the body be designed by points *on* the surface instead of control points.
 */
export function fitCage(m: QuadMesh, targets: Float64Array, levels = 2, iterations = 8, weight?: Float64Array): QuadMesh {
  const pos = new Float64Array(targets);
  const nv = pos.length / 3;
  for (let it = 0; it < iterations; it++) {
    const s = subdivideN({ ...m, pos }, levels);
    for (let v = 0; v < nv; v++) {
      const w = weight ? weight[v] : 1;
      if (w <= 0) continue;
      for (let c = 0; c < 3; c++) pos[v * 3 + c] += (targets[v * 3 + c] - s.pos[v * 3 + c]) * w;
    }
  }
  return { ...m, pos };
}

/** Area-weighted vertex normals of a quad mesh (computed over all faces). */
export function vertexNormals(m: QuadMesh): Float32Array {
  const n = new Float32Array(m.pos.length);
  const P = m.pos;
  const nf = m.quads.length / 4;
  for (let f = 0; f < nf; f++) {
    const a = m.quads[f * 4], b = m.quads[f * 4 + 1], c = m.quads[f * 4 + 2], d = m.quads[f * 4 + 3];
    // diagonal cross product = 2x quad area normal
    const ux = P[c * 3] - P[a * 3], uy = P[c * 3 + 1] - P[a * 3 + 1], uz = P[c * 3 + 2] - P[a * 3 + 2];
    const vx = P[d * 3] - P[b * 3], vy = P[d * 3 + 1] - P[b * 3 + 1], vz = P[d * 3 + 2] - P[b * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const v of [a, b, c, d]) { n[v * 3] += nx; n[v * 3 + 1] += ny; n[v * 3 + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}
