// Assembles the car from its generated parts into a scene graph (studio / previews).
// The game consumes the same parts through src/car/index.ts.
import { Group, Mesh, type BufferGeometry, type Material } from 'three';
import { type RoleMaterials } from './materials';
import { buildCarParts, PART_PIVOTS, type RoleGeo } from './parts';

export interface CarModel {
  root: Group;
  parts: Record<string, Group>;
}

export function roleMeshes(geo: RoleGeo, mats: RoleMaterials): Mesh[] {
  const out: Mesh[] = [];
  for (const [role, list] of Object.entries(geo)) {
    for (const g of list as BufferGeometry[]) {
      const mat = (mats[role] ?? mats.black) as Material;
      const m = new Mesh(g, mat);
      m.castShadow = !(role === 'glass' || role === 'lens');
      m.receiveShadow = true;
      m.userData.role = role;
      if (role === 'glass' || role === 'lens') m.renderOrder = 2;
      out.push(m);
    }
  }
  return out;
}

export function buildCarModel(mats: RoleMaterials): CarModel {
  const root = new Group();
  root.name = 'car';
  const { shell, parts } = buildCarParts();
  for (const m of roleMeshes(shell, mats)) root.add(m);
  const groups: Record<string, Group> = {};
  for (const [name, geo] of Object.entries(parts)) {
    const g = new Group();
    g.name = name;
    const pivot = PART_PIVOTS[name];
    if (pivot) g.position.copy(pivot);
    for (const m of roleMeshes(geo, mats)) {
      if (pivot) m.position.copy(pivot).negate();
      g.add(m);
    }
    root.add(g);
    groups[name] = g;
  }
  return { root, parts: groups };
}
