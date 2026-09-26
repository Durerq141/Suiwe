// Small geometry toolkit for the car's hard-surface details.
import { BoxGeometry, BufferGeometry, CylinderGeometry, Euler, Float32BufferAttribute, LatheGeometry, Matrix4, Quaternion, Vector2, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type P3 = readonly [number, number, number];

/** Normalises attributes (position/normal/uv, non-indexed) so geometries can be merged. */
export function clean(g: BufferGeometry): BufferGeometry {
  const r = g.index ? g.toNonIndexed() : g;
  if (!r.attributes.normal) r.computeVertexNormals();
  if (!r.attributes.uv) r.setAttribute('uv', new Float32BufferAttribute(new Float32Array(r.attributes.position.count * 2), 2));
  for (const k of Object.keys(r.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') r.deleteAttribute(k);
  return r;
}

export function merge(list: BufferGeometry[]): BufferGeometry {
  return mergeGeometries(list.map(clean), false)!;
}

export function place(g: BufferGeometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0): BufferGeometry {
  if (rx || ry || rz) g.applyMatrix4(new Matrix4().makeRotationFromEuler(new Euler(rx, ry, rz, 'YXZ')));
  g.translate(x, y, z);
  return g;
}

export const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => place(new BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
export const rbox = (w: number, h: number, d: number, r: number, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) =>
  place(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)), x, y, z, rx, ry, rz);

/** Cylinder whose axis runs from a to b. */
export function cyl(a: P3, b: P3, r0: number, r1 = r0, seg = 20, open = false): BufferGeometry {
  const A = new Vector3(...a), B = new Vector3(...b);
  const len = A.distanceTo(B);
  const g = new CylinderGeometry(r1, r0, len, seg, 1, open);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), B.clone().sub(A).normalize());
  g.applyQuaternion(q);
  const m = A.add(B).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}

/** Lathe of an (r, h) profile around the axis a->b. */
export function lathe(profile: [number, number][], a: P3, b: P3, seg = 32): BufferGeometry {
  const g = new LatheGeometry(profile.map(([r, h]) => new Vector2(Math.max(r, 1e-4), h)), seg);
  const A = new Vector3(...a), B = new Vector3(...b);
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), B.clone().sub(A).normalize()));
  g.translate(A.x, A.y, A.z);
  return g;
}

/** Quad strip between two polylines of equal length (rows[i] -> rows[i+1]). */
export function grid(rows: P3[][], closeU = false, flip = false): BufferGeometry {
  const pos: number[] = [];
  const R = rows.length, C = rows[0].length;
  const cols = closeU ? C : C - 1;
  for (let i = 0; i < R - 1; i++) {
    for (let j = 0; j < cols; j++) {
      const j2 = (j + 1) % C;
      const a = rows[i][j], b = rows[i][j2], c = rows[i + 1][j2], d = rows[i + 1][j];
      const tri = flip ? [a, c, b, a, d, c] : [a, b, c, a, c, d];
      for (const p of tri) pos.push(p[0], p[1], p[2]);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Flat polygon (fan from centroid) — fine for convex-ish outlines. */
export function fan(pts: P3[], flip = false): BufferGeometry {
  const c = pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length, s[2] + p[2] / pts.length], [0, 0, 0]);
  const pos: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const tri = flip ? [c, b, a] : [c, a, b];
    for (const p of tri) pos.push(p[0], p[1], p[2]);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Tube along a polyline. */
export function tube(path: P3[], r: number, seg = 10, closed = false): BufferGeometry {
  const rings: P3[][] = [];
  const n = path.length;
  let prevN = new Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const p = new Vector3(...path[i]);
    const a = new Vector3(...path[Math.max(0, i - 1)]), b = new Vector3(...path[Math.min(n - 1, i + 1)]);
    const t = b.sub(a).normalize();
    let nn = prevN.clone().sub(t.clone().multiplyScalar(prevN.dot(t)));
    if (nn.lengthSq() < 1e-6) nn = new Vector3(1, 0, 0).cross(t);
    nn.normalize();
    prevN = nn;
    const bn = t.clone().cross(nn);
    const ring: P3[] = [];
    for (let k = 0; k < seg; k++) {
      const ang = (k / seg) * Math.PI * 2;
      const d = nn.clone().multiplyScalar(Math.cos(ang) * r).add(bn.clone().multiplyScalar(Math.sin(ang) * r));
      ring.push([p.x + d.x, p.y + d.y, p.z + d.z]);
    }
    rings.push(ring);
  }
  if (closed) rings.push(rings[0]);
  return grid(rings, true);
}

export const mirrorX = (g: BufferGeometry): BufferGeometry => {
  const m = g.clone();
  m.scale(-1, 1, 1);
  // scaling by -1 flips winding: swap two vertices of every triangle
  const r = clean(m);
  for (const name of ['position', 'normal', 'uv'] as const) {
    const a = r.attributes[name];
    const s = a.itemSize;
    for (let i = 0; i < a.count; i += 3) {
      for (let c = 0; c < s; c++) {
        const t = a.array[(i + 1) * s + c];
        (a.array as Float32Array)[(i + 1) * s + c] = a.array[(i + 2) * s + c];
        (a.array as Float32Array)[(i + 2) * s + c] = t;
      }
    }
  }
  return r;
};
