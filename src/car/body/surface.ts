// Exact surface queries on the refined body skin. Every exterior detail (mirrors,
// handles, plates, grille bars, lamps, fuel door, exhaust, trims) is anchored with
// these instead of approximate design formulas, so nothing floats or sinks in.
import { Vector3 } from 'three';
import { bodySkin, type BodySkin } from './skin';
import { TAG_ID, type Tag } from './cage';

export interface Hit { p: Vector3; n: Vector3; face: number; tag: number }

/** axis 0 = x (u=z, v=y), 1 = y (u=x, v=z), 2 = z (u=x, v=y) */
type Axis = 0 | 1 | 2;
const UV: Record<Axis, [number, number]> = { 0: [2, 1], 1: [0, 2], 2: [0, 1] };
const CELL = 0.04;

class AxisGrid {
  cells = new Map<number, number[]>();
  constructor(private skin: BodySkin, private axis: Axis) {
    const { mesh } = skin;
    const [ua, va] = UV[axis];
    const nf = mesh.quads.length / 4;
    for (let f = 0; f < nf; f++) {
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (let k = 0; k < 4; k++) {
        const v = mesh.quads[f * 4 + k];
        const u = mesh.pos[v * 3 + ua], w = mesh.pos[v * 3 + va];
        if (u < u0) u0 = u; if (u > u1) u1 = u; if (w < v0) v0 = w; if (w > v1) v1 = w;
      }
      for (let i = Math.floor(u0 / CELL); i <= Math.floor(u1 / CELL); i++)
        for (let j = Math.floor(v0 / CELL); j <= Math.floor(v1 / CELL); j++) {
          const key = (i + 2000) * 4000 + (j + 2000);
          let c = this.cells.get(key);
          if (!c) this.cells.set(key, (c = []));
          c.push(f);
        }
    }
  }

  /** All hits along the axis at (u, v), sorted by coordinate descending. */
  hits(u: number, v: number, tags?: Set<number>): Hit[] {
    const { mesh, normals } = this.skin;
    const [ua, va] = UV[this.axis];
    const a = this.axis;
    const key = (Math.floor(u / CELL) + 2000) * 4000 + (Math.floor(v / CELL) + 2000);
    const out: Hit[] = [];
    for (const f of this.cells.get(key) ?? []) {
      if (tags && !tags.has(mesh.tags[f])) continue;
      const q = [mesh.quads[f * 4], mesh.quads[f * 4 + 1], mesh.quads[f * 4 + 2], mesh.quads[f * 4 + 3]];
      for (const [i0, i1, i2] of [[0, 1, 2], [0, 2, 3]]) {
        const A = q[i0], B = q[i1], C = q[i2];
        const ax = mesh.pos[A * 3 + ua], ay = mesh.pos[A * 3 + va];
        const bx = mesh.pos[B * 3 + ua], by = mesh.pos[B * 3 + va];
        const cx = mesh.pos[C * 3 + ua], cy = mesh.pos[C * 3 + va];
        const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
        if (Math.abs(d) < 1e-12) continue;
        const l1 = ((by - cy) * (u - cx) + (cx - bx) * (v - cy)) / d;
        const l2 = ((cy - ay) * (u - cx) + (ax - cx) * (v - cy)) / d;
        const l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const p = new Vector3();
        const n = new Vector3();
        for (const [id, l] of [[A, l1], [B, l2], [C, l3]] as const) {
          p.x += mesh.pos[id * 3] * l; p.y += mesh.pos[id * 3 + 1] * l; p.z += mesh.pos[id * 3 + 2] * l;
          n.x += normals[id * 3] * l; n.y += normals[id * 3 + 1] * l; n.z += normals[id * 3 + 2] * l;
        }
        n.normalize();
        out.push({ p, n, face: f, tag: mesh.tags[f] });
        break;
      }
    }
    return out.sort((h1, h2) => h2.p.getComponent(a) - h1.p.getComponent(a));
  }
}

let grids: AxisGrid[] | null = null;
const grid = (a: Axis) => (grids ??= [0, 1, 2].map((ax) => new AxisGrid(bodySkin(), ax as Axis)))[a];

/**
 * First surface hit coming from +inf (sign 1) or -inf (sign -1) along an axis.
 * side(x):  ray from the side, (u, v) = (z, y)
 * front(z): (u, v) = (x, y);  top(y): (u, v) = (x, z)
 */
export function cast(axis: Axis, sign: 1 | -1, u: number, v: number, tags?: readonly Tag[]): Hit | null {
  const set = tags ? new Set(tags.map((t) => TAG_ID[t])) : undefined;
  const hs = grid(axis).hits(u, v, set);
  if (!hs.length) return null;
  return sign > 0 ? hs[0] : hs[hs.length - 1];
}

export const fromSide = (s: 1 | -1, z: number, y: number, tags?: readonly Tag[]) => cast(0, s, z, y, tags);
export const fromFront = (x: number, y: number, tags?: readonly Tag[]) => cast(2, 1, x, y, tags);
export const fromRear = (x: number, y: number, tags?: readonly Tag[]) => cast(2, -1, x, y, tags);
export const fromTop = (x: number, z: number, tags?: readonly Tag[]) => cast(1, 1, x, z, tags);
export const fromBelow = (x: number, z: number, tags?: readonly Tag[]) => cast(1, -1, x, z, tags);

/** Orthonormal frame on the surface: n outward, t along `along` projected on the tangent plane. */
export function frameAt(h: Hit, along: Vector3): { o: Vector3; n: Vector3; t: Vector3; b: Vector3 } {
  const t = along.clone().addScaledVector(h.n, -along.dot(h.n)).normalize();
  const b = new Vector3().crossVectors(h.n, t).normalize();
  return { o: h.p.clone(), n: h.n.clone(), t, b };
}
