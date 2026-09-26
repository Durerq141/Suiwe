// Turns a patch of the refined skin into a solid sheet-metal part: the outer skin is
// pulled back from its edges to leave a real panel gap, an inner skin is offset
// inwards and a rim closes the edge. Openings in the body get the same treatment as
// jamb flanges, so no edge anywhere is paper-thin and nothing can be seen "between"
// outer and inner skins.
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { type QuadMesh, edgeKey } from './subdiv';

export interface SolidOptions {
  /** half of the visible panel gap, applied along the surface at open edges */
  gap?: number;
  /** rim depth measured along -normal */
  rim?: number;
}

export interface SolidPart {
  /** geometry for any subset of the solidified faces (offset along the normal, optional flip) */
  geo(faces: readonly number[], offset?: number, flip?: boolean): BufferGeometry;
  rim: BufferGeometry | null;
  /** ordered boundary loops (refined vertex ids) */
  loops: number[][];
}

interface Patch {
  pos: Map<number, [number, number, number]>;
  nor: Map<number, [number, number, number]>;
}

/** Directed boundary edges of a face set, chained into loops (face winding order). */
export function boundaryLoops(mesh: QuadMesh, faces: readonly number[]): number[][] {
  const count = new Map<number, number>();
  for (const f of faces) for (let k = 0; k < 4; k++) {
    const a = mesh.quads[f * 4 + k], b = mesh.quads[f * 4 + ((k + 1) & 3)];
    const key = edgeKey(a, b);
    count.set(key, (count.get(key) ?? 0) + 1);
  }
  const next = new Map<number, number[]>();
  for (const f of faces) for (let k = 0; k < 4; k++) {
    const a = mesh.quads[f * 4 + k], b = mesh.quads[f * 4 + ((k + 1) & 3)];
    if (count.get(edgeKey(a, b)) === 1) (next.get(a) ?? next.set(a, []).get(a)!).push(b);
  }
  const loops: number[][] = [];
  const used = new Set<string>();
  for (const [start, outs] of next) {
    for (const first of outs) {
      if (used.has(start + ':' + first)) continue;
      const loop = [start];
      used.add(start + ':' + first);
      let cur = first;
      let guard = 0;
      while (cur !== start && guard++ < 100000) {
        loop.push(cur);
        const cands = next.get(cur) ?? [];
        const nx = cands.find((c) => !used.has(cur + ':' + c));
        if (nx === undefined) break;
        used.add(cur + ':' + nx);
        cur = nx;
      }
      loops.push(loop);
    }
  }
  return loops;
}

export function solidify(mesh: QuadMesh, normals: Float32Array, faces: readonly number[], opt: SolidOptions = {}): SolidPart {
  const gap = opt.gap ?? 0.0025;
  const rimDepth = opt.rim ?? 0.012;
  const P = mesh.pos;
  const patch: Patch = { pos: new Map(), nor: new Map() };
  for (const f of faces) for (let k = 0; k < 4; k++) {
    const v = mesh.quads[f * 4 + k];
    if (!patch.pos.has(v)) {
      patch.pos.set(v, [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]);
      patch.nor.set(v, [normals[v * 3], normals[v * 3 + 1], normals[v * 3 + 2]]);
    }
  }
  const loops = boundaryLoops(mesh, faces);

  // pull boundary vertices (and, less, the next ring) back from the edge
  if (gap > 0) {
    const moved = new Map<number, [number, number, number]>();
    for (const loop of loops) {
      const n = loop.length;
      for (let i = 0; i < n; i++) {
        const v = loop[i];
        const a = patch.pos.get(loop[(i - 1 + n) % n])!, b = patch.pos.get(loop[(i + 1) % n])!;
        const p = patch.pos.get(v)!, nr = patch.nor.get(v)!;
        const tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2];
        // interior lies to the left of the directed edge seen from outside: d = n x t
        let dx = nr[1] * tz - nr[2] * ty, dy = nr[2] * tx - nr[0] * tz, dz = nr[0] * ty - nr[1] * tx;
        const l = Math.hypot(dx, dy, dz) || 1;
        dx /= l; dy /= l; dz /= l;
        moved.set(v, [p[0] + dx * gap, p[1] + dy * gap, p[2] + dz * gap]);
      }
    }
    for (const [v, p] of moved) patch.pos.set(v, p);
  }


  let rim: BufferGeometry | null = null;
  if (rimDepth > 0) {
    const pos: number[] = [], nor: number[] = [], uv: number[] = [];
    for (const loop of loops) {
      const n = loop.length;
      for (let i = 0; i < n; i++) {
        const a = loop[i], b = loop[(i + 1) % n];
        const pa = patch.pos.get(a)!, pb = patch.pos.get(b)!, na = patch.nor.get(a)!, nb = patch.nor.get(b)!;
        const qa: [number, number, number] = [pa[0] - na[0] * rimDepth, pa[1] - na[1] * rimDepth, pa[2] - na[2] * rimDepth];
        const qb: [number, number, number] = [pb[0] - nb[0] * rimDepth, pb[1] - nb[1] * rimDepth, pb[2] - nb[2] * rimDepth];
        // outward (away from the patch interior): t x n
        const tx = pb[0] - pa[0], ty = pb[1] - pa[1], tz = pb[2] - pa[2];
        const mx = (na[0] + nb[0]) / 2, my = (na[1] + nb[1]) / 2, mz = (na[2] + nb[2]) / 2;
        let ox = ty * mz - tz * my, oy = tz * mx - tx * mz, oz = tx * my - ty * mx;
        const ol = Math.hypot(ox, oy, oz) || 1;
        ox /= ol; oy /= ol; oz /= ol;
        for (const p of [pa, pb, qb, pa, qb, qa]) { pos.push(p[0], p[1], p[2]); nor.push(ox, oy, oz); uv.push(0, 0); }
      }
    }
    rim = new BufferGeometry();
    rim.setAttribute('position', new Float32BufferAttribute(pos, 3));
    rim.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    rim.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  }
  return { geo: (f, offset = 0, flip = false) => buildGeo(mesh, f, patch, offset, flip), rim, loops };
}

function buildGeo(mesh: QuadMesh, faces: readonly number[], patch: Patch, offset: number, flip: boolean): BufferGeometry {
  const remap = new Map<number, number>();
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  const vert = (v: number) => {
    let i = remap.get(v);
    if (i !== undefined) return i;
    i = pos.length / 3;
    remap.set(v, i);
    const p = patch.pos.get(v)!, n = patch.nor.get(v)!;
    const x = p[0] + n[0] * offset, y = p[1] + n[1] * offset, z = p[2] + n[2] * offset;
    pos.push(x, y, z);
    const s = flip ? -1 : 1;
    nor.push(n[0] * s, n[1] * s, n[2] * s);
    const ax = Math.abs(n[0]), ay = Math.abs(n[1]);
    if (ax > 0.6) uv.push(z, y); else if (ay > 0.6) uv.push(x, z); else uv.push(x, y);
    return i;
  };
  for (const f of faces) {
    const a = vert(mesh.quads[f * 4]), b = vert(mesh.quads[f * 4 + 1]), c = vert(mesh.quads[f * 4 + 2]), d = vert(mesh.quads[f * 4 + 3]);
    if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
