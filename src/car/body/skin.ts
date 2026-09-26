// Refined body skin: subdivides the cage and cuts it into per-tag geometry.
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { type QuadMesh, subdivideN, vertexNormals } from '../mesh/subdiv';
import { buildBodyCage, type BodyCage, TAG_ID, type Tag, TAGS } from './cage';

export interface BodySkin {
  cage: BodyCage;
  mesh: QuadMesh;
  normals: Float32Array;
  facesByTag: Map<Tag, number[]>;
  levels: number;
}

let cached: BodySkin | null = null;

export function bodySkin(levels = 3): BodySkin {
  if (cached && cached.levels === levels) return cached;
  const cage = buildBodyCage();
  const mesh = subdivideN(cage, levels);
  const normals = vertexNormals(mesh);
  const facesByTag = new Map<Tag, number[]>();
  for (let f = 0; f < mesh.tags.length; f++) {
    const t = TAGS[mesh.tags[f]];
    let list = facesByTag.get(t);
    if (!list) facesByTag.set(t, (list = []));
    list.push(f);
  }
  cached = { cage, mesh, normals, facesByTag, levels };
  return cached;
}

export interface SkinGeoOptions {
  /** push along the vertex normal (negative = inwards) */
  offset?: number;
  flip?: boolean;
}

/** Geometry for the refined faces of the given tags (shared, smooth normals). */
export function skinGeometry(skin: BodySkin, tags: readonly Tag[], opt: SkinGeoOptions = {}): BufferGeometry {
  const faces = tags.flatMap((t) => skin.facesByTag.get(t) ?? []);
  return facesGeometry(skin, faces, opt);
}

export function facesGeometry(skin: BodySkin, faces: readonly number[], opt: SkinGeoOptions = {}): BufferGeometry {
  const { mesh, normals } = skin;
  const remap = new Map<number, number>();
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  const idx: number[] = [];
  const off = opt.offset ?? 0;
  const vert = (v: number) => {
    let i = remap.get(v);
    if (i !== undefined) return i;
    i = pos.length / 3;
    remap.set(v, i);
    const nx = normals[v * 3], ny = normals[v * 3 + 1], nz = normals[v * 3 + 2];
    const x = mesh.pos[v * 3] + nx * off, y = mesh.pos[v * 3 + 1] + ny * off, z = mesh.pos[v * 3 + 2] + nz * off;
    pos.push(x, y, z);
    const s = opt.flip ? -1 : 1;
    nor.push(nx * s, ny * s, nz * s);
    // box-projected UVs, metres (paint wear / dirt maps tile per metre)
    const ax = Math.abs(nx), ay = Math.abs(ny);
    if (ax > 0.6) uv.push(z, y); else if (ay > 0.6) uv.push(x, z); else uv.push(x, y);
    return i;
  };
  for (const f of faces) {
    const a = vert(mesh.quads[f * 4]), b = vert(mesh.quads[f * 4 + 1]), c = vert(mesh.quads[f * 4 + 2]), d = vert(mesh.quads[f * 4 + 3]);
    if (opt.flip) idx.push(a, c, b, a, d, c);
    else idx.push(a, b, c, a, c, d);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export const tagId = (t: Tag) => TAG_ID[t];
