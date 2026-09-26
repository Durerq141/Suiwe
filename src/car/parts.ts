// Part catalogue: which body tags make up which detachable part, their solid build
// (panel gap, shut-face depth, inner skin) and hinge pivots.
import { type BufferGeometry, Vector3 } from 'three';
import { DIMS } from './dims';
import { bodySkin, skinGeometry, type BodySkin } from './body/skin';
import { type Tag } from './body/cage';
import { solidify, boundaryLoops } from './mesh/solidify';
import { buildClosures } from './body/closures';
import { headlightInternals, taillightInternals } from './details/lamps';
import { buildWheel } from './details/wheel';
import { beltMoulding, frontTrim, fuelDoor, handle, mirror, rearTrim, shellSideTrims, shellTrim, sideMoulding, trunkTrim } from './details/trim';
import { cabin, doorCard, frontSeat, rearSeat } from './details/interior';
import { engineBay } from './details/engine';
import { mirrorX, tube, type P3 } from './mesh/prims';

export type RoleGeo = Record<string, BufferGeometry[]>;

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** Hinge / attachment pivots in car space (parts are authored in car space). */
export const PART_PIVOTS: Record<string, Vector3> = {
  door_fl: v(0.93, 0.62, DIMS.zCowl - 0.03),
  door_fr: v(-0.93, 0.62, DIMS.zCowl - 0.03),
  door_rl: v(0.94, 0.62, DIMS.zDoorSplit - 0.03),
  door_rr: v(-0.94, 0.62, DIMS.zDoorSplit - 0.03),
  hood: v(0, 0.975, DIMS.zCowl + 0.02),
  trunk: v(0, 1.07, DIMS.zDeck - 0.02),
  wheel_fl: v(DIMS.track, DIMS.wheelR, DIMS.axleF),
  wheel_fr: v(-DIMS.track, DIMS.wheelR, DIMS.axleF),
  wheel_rl: v(DIMS.track, DIMS.wheelR, DIMS.axleR),
  wheel_rr: v(-DIMS.track, DIMS.wheelR, DIMS.axleR),
};

const facesOf = (skin: BodySkin, tags: readonly Tag[] = []) => tags.flatMap((t) => skin.facesByTag.get(t) ?? []);
const add = (r: RoleGeo, role: string, ...g: (BufferGeometry | null | undefined)[]) => { for (const x of g) if (x) (r[role] ??= []).push(x); };
const mergeInto = (dst: RoleGeo, src: RoleGeo) => { for (const [role, list] of Object.entries(src)) (dst[role] ??= []).push(...list); };
const mirrored = (src: RoleGeo): RoleGeo => Object.fromEntries(Object.entries(src).map(([k, l]) => [k, l.map(mirrorX)]));

/** Painted panel: outer skin, dark shut edge, optional inner skin. */
function panel(skin: BodySkin, tags: readonly Tag[], depth: number, inner: boolean): RoleGeo {
  const r: RoleGeo = {};
  const f = facesOf(skin, tags);
  if (!f.length) return r;
  const s = solidify(skin.mesh, skin.normals, f, { gap: 0.0025, rim: depth });
  add(r, 'paint', s.geo(f));
  add(r, 'seal', s.rim);
  if (inner) add(r, 'paintIn', s.geo(f, -depth, true));
  return r;
}

/** Recessed opening (grille, intake, plate pocket): walls + back face pushed in. */
function recess(skin: BodySkin, tags: readonly Tag[], depth: number, back: string, wall: string): RoleGeo {
  const r: RoleGeo = {};
  const f = facesOf(skin, tags);
  if (!f.length) return r;
  const s = solidify(skin.mesh, skin.normals, f, { gap: 0.002, rim: depth });
  add(r, back, s.geo(f, -depth));
  add(r, wall, s.rim);
  return r;
}

function glass(skin: BodySkin, tags: readonly Tag[], inset: number): RoleGeo {
  const f = facesOf(skin, tags);
  if (!f.length) return {};
  const s = solidify(skin.mesh, skin.normals, f, { gap: 0.002, rim: 0.008 });
  return { glass: [s.geo(f, -inset)], seal: [s.rim!] };
}

/** Door: 10 cm deep shell, window frame, glass, frame strip above the glass. */
function door(skin: BodySkin, name: 'door_fl' | 'door_fr' | 'door_rl' | 'door_rr'): RoleGeo {
  const side = name.endsWith('l') ? 'l' : 'r';
  const fr = name[5] as 'f' | 'r';
  const r = panel(skin, [name], 0.1, true);
  const frameTag = `frame_${fr}${side}` as Tag, glassTag = `glass_${fr}${side}` as Tag;
  const fs = solidify(skin.mesh, skin.normals, facesOf(skin, [frameTag]), { gap: 0.0025, rim: 0.035 });
  add(r, 'blackGloss', fs.geo(facesOf(skin, [frameTag])));
  add(r, 'black', fs.rim, fs.geo(facesOf(skin, [frameTag]), -0.035, true));
  mergeInto(r, glass(skin, [glassTag], 0.012));
  // upper frame strip along the top edge of the glass
  const loops = boundaryLoops(skin.mesh, facesOf(skin, [glassTag]));
  if (loops.length) {
    const loop = loops.sort((a, b) => b.length - a.length)[0];
    const pts = loop.map((vi) => new Vector3(skin.mesh.pos[vi * 3], skin.mesh.pos[vi * 3 + 1], skin.mesh.pos[vi * 3 + 2]));
    const top = pts.filter((p) => p.y > 1.2).sort((a, b) => b.z - a.z).map((p) => [p.x * 0.992, p.y - 0.006, p.z] as P3);
    if (top.length > 2) add(r, 'blackGloss', tube(top, 0.011, 8));
  }
  return r;
}

export function buildCarParts(opts: { steering?: boolean } = {}): { shell: RoleGeo; parts: Record<string, RoleGeo> } {
  const skin = bodySkin();
  const shellTags: Tag[] = ['roof', 'aPillar', 'cPillar', 'quarter', 'rocker', 'cowl'];
  const sf = facesOf(skin, shellTags);
  const s = solidify(skin.mesh, skin.normals, sf, { gap: 0.0025, rim: 0.08 });
  const shell: RoleGeo = { paint: [s.geo(sf)], seal: [s.rim!] };
  mergeInto(shell, buildClosures());
  mergeInto(shell, shellTrim());
  mergeInto(shell, shellSideTrims());
  mergeInto(shell, rearTrim());
  mergeInto(shell, cabin(opts));
  mergeInto(shell, engineBay().fixed);
  add(shell, 'headliner', skinGeometry(skin, ['roof'], { offset: -0.03, flip: true }));
  add(shell, 'trim', skinGeometry(skin, ['aPillar', 'cPillar'], { offset: -0.025, flip: true }));
  const fd = fuelDoor();
  add(shell, 'seal', fd.ring);

  const parts: Record<string, RoleGeo> = {};
  parts.hood = panel(skin, ['hood'], 0.02, true);
  add(parts.hood, 'pad', skinGeometry(skin, ['hood'], { offset: -0.045, flip: true }));
  parts.trunk = panel(skin, ['trunk'], 0.02, true);
  mergeInto(parts.trunk, recess(skin, ['plate_r'], 0.014, 'paint', 'seal'));
  mergeInto(parts.trunk, trunkTrim());
  parts.fender_fl = panel(skin, ['fender_fl'], 0.03, false);
  parts.fender_fr = panel(skin, ['fender_fr'], 0.03, false);
  for (const d of ['door_fl', 'door_fr', 'door_rl', 'door_rr'] as const) parts[d] = door(skin, d);
  parts.windshield = glass(skin, ['windshield'], 0.004);
  parts.window_r = glass(skin, ['window_r'], 0.004);
  parts.bumper_f = panel(skin, ['bumper_f'], 0.03, false);
  mergeInto(parts.bumper_f, recess(skin, ['grille'], 0.05, 'grilleBack', 'grille'));
  mergeInto(parts.bumper_f, recess(skin, ['intake'], 0.06, 'grilleBack', 'grille'));
  mergeInto(parts.bumper_f, frontTrim());
  parts.bumper_r = panel(skin, ['bumper_r'], 0.03, false);
  for (const sd of ['l', 'r'] as const) {
    const hl = solidify(skin.mesh, skin.normals, facesOf(skin, [`headlight_${sd}`]), { gap: 0.002, rim: 0.035 });
    parts[`headlight_${sd}`] = { lens: [hl.geo(facesOf(skin, [`headlight_${sd}`]))], lampHousing: [hl.rim!] };
    mergeInto(parts[`headlight_${sd}`], headlightInternals(skin, sd));
    const tl = solidify(skin.mesh, skin.normals, facesOf(skin, [`taillight_${sd}`]), { gap: 0.002, rim: 0.04 });
    parts[`taillight_${sd}`] = { tailLens: [tl.geo(facesOf(skin, [`taillight_${sd}`]))], lampHousing: [tl.rim!] };
    mergeInto(parts[`taillight_${sd}`], taillightInternals(skin, sd));
  }

  // hardware on the doors (left authored, right mirrored)
  const left: Record<string, RoleGeo> = { door_fl: {}, door_rl: {} };
  mergeInto(left.door_fl, mirror(1));
  mergeInto(left.door_fl, handle(1, -0.26, 'door_fl'));
  mergeInto(left.door_rl, handle(1, -1.12, 'door_rl'));
  for (const [tag, z0, z1] of [['door_fl', 0.84, -0.36], ['door_rl', -0.44, -1.0]] as const) {
    add(left[tag], 'blackGloss', sideMoulding(tag, z0, z1));
    add(left[tag], 'chrome', beltMoulding(tag));
    mergeInto(left[tag], doorCard(tag));
  }
  mergeInto(parts.door_fl, left.door_fl);
  mergeInto(parts.door_rl, left.door_rl);
  mergeInto(parts.door_fr, mirrored(left.door_fl));
  mergeInto(parts.door_rr, mirrored(left.door_rl));

  parts.seat_d = frontSeat(0.42);
  parts.seat_p = frontSeat(-0.42);
  parts.seat_r = rearSeat();
  const bay = engineBay();
  parts.engine = bay.engine;
  parts.battery = bay.battery;
  parts.radiator = bay.radiator;

  const w = buildWheel();
  for (const name of ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']) {
    const p = PART_PIVOTS[name];
    const right = name.endsWith('r');
    const place = (g: BufferGeometry) => { const c = g.clone(); if (right) c.rotateY(Math.PI); c.translate(p.x, p.y, p.z); return c; };
    parts[name] = { tire: [place(w.tire)], rim: [place(w.rim)], chrome: [place(w.hub)], disc: [place(w.disc)], caliper: [place(w.caliper)] };
  }
  return { shell, parts };
}

export { fuelDoor };
