// Part catalogue: which body tags make up which detachable part, their solid build
// (panel gap, sheet thickness, rim) and hinge pivots.
import { type BufferGeometry, Vector3 } from 'three';
import { DIMS } from './dims';
import { bodySkin, type BodySkin } from './body/skin';
import { type Tag } from './body/cage';
import { solidify } from './mesh/solidify';
import { buildClosures } from './body/closures';
import { headlightInternals, taillightInternals } from './details/lamps';
import { buildWheel } from './details/wheel';
import { frontTrim, handle, mirror, rearTrim, shellTrim, trunkTrim } from './details/trim';

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

interface PanelSpec {
  paint?: Tag[];
  trim?: Tag[]; // gloss-black window surrounds
  glass?: Tag[];
  lens?: Tag[];
  grille?: Tag[];
  tail?: Tag[];
  /** sheet thickness of painted skin (0 = rim only) */
  sheet?: number;
}

const SHEET = 0.014;
const PANELS: Record<string, PanelSpec> = {
  hood: { paint: ['hood'], sheet: SHEET },
  trunk: { paint: ['trunk', 'plate_r'], sheet: SHEET },
  fender_fl: { paint: ['fender_fl'], sheet: 0 },
  fender_fr: { paint: ['fender_fr'], sheet: 0 },
  door_fl: { paint: ['door_fl'], trim: ['frame_fl'], glass: ['glass_fl'], sheet: SHEET },
  door_fr: { paint: ['door_fr'], trim: ['frame_fr'], glass: ['glass_fr'], sheet: SHEET },
  door_rl: { paint: ['door_rl'], trim: ['frame_rl'], glass: ['glass_rl'], sheet: SHEET },
  door_rr: { paint: ['door_rr'], trim: ['frame_rr'], glass: ['glass_rr'], sheet: SHEET },
  windshield: { glass: ['windshield'] },
  window_r: { glass: ['window_r'] },
  bumper_f: { paint: ['bumper_f'], grille: ['grille', 'intake'], sheet: 0 },
  bumper_r: { paint: ['bumper_r'], sheet: 0 },
  headlight_l: { lens: ['headlight_l'] },
  headlight_r: { lens: ['headlight_r'] },
  taillight_l: { tail: ['taillight_l'] },
  taillight_r: { tail: ['taillight_r'] },
};

const SHELL_TAGS: Tag[] = ['roof', 'aPillar', 'cPillar', 'quarter', 'rocker', 'cowl'];

const facesOf = (skin: BodySkin, tags: readonly Tag[] = []) => tags.flatMap((t) => skin.facesByTag.get(t) ?? []);
const add = (r: RoleGeo, role: string, ...g: (BufferGeometry | null)[]) => { for (const x of g) if (x) (r[role] ??= []).push(x); };

function buildPanel(skin: BodySkin, spec: PanelSpec): RoleGeo {
  const r: RoleGeo = {};
  const paint = facesOf(skin, spec.paint), trim = facesOf(skin, spec.trim), glass = facesOf(skin, spec.glass);
  const body = [...paint, ...trim];
  if (body.length) {
    const s = solidify(skin.mesh, skin.normals, [...body, ...glass], { gap: 0.0025, rim: spec.sheet || 0.03 });
    add(r, 'paint', s.geo(paint), s.rim);
    if (trim.length) add(r, 'blackGloss', s.geo(trim));
    if (spec.sheet) add(r, 'paintIn', s.geo(body, -spec.sheet, true));
    if (glass.length) add(r, 'glass', s.geo(glass, -0.006));
  } else if (glass.length) {
    const s = solidify(skin.mesh, skin.normals, glass, { gap: 0.002, rim: 0.006 });
    add(r, 'glass', s.geo(glass, -0.004));
    add(r, 'blackGloss', s.rim);
  }
  for (const [role, tags, rim] of [['lens', spec.lens, 0.035], ['grille', spec.grille, 0.045], ['tailLens', spec.tail, 0.04]] as const) {
    const f = facesOf(skin, tags);
    if (!f.length) continue;
    const s = solidify(skin.mesh, skin.normals, f, { gap: 0.002, rim });
    add(r, role, s.geo(f));
    add(r, role === 'grille' ? 'grille' : 'lampHousing', s.rim);
  }
  return r;
}

const mergeInto = (dst: RoleGeo, src: RoleGeo) => { for (const [role, list] of Object.entries(src)) (dst[role] ??= []).push(...list); };

export function buildCarParts(): { shell: RoleGeo; parts: Record<string, RoleGeo> } {
  const skin = bodySkin();
  const shellFaces = facesOf(skin, SHELL_TAGS);
  const s = solidify(skin.mesh, skin.normals, shellFaces, { gap: 0.0025, rim: 0.045 });
  const shell: RoleGeo = { paint: [s.geo(shellFaces)], paintIn: [s.rim!] };
  mergeInto(shell, buildClosures());
  mergeInto(shell, shellTrim());
  mergeInto(shell, rearTrim());
  const parts: Record<string, RoleGeo> = {};
  for (const [name, spec] of Object.entries(PANELS)) parts[name] = buildPanel(skin, spec);
  mergeInto(parts.headlight_l, headlightInternals(skin, 'l'));
  mergeInto(parts.headlight_r, headlightInternals(skin, 'r'));
  mergeInto(parts.taillight_l, taillightInternals(skin, 'l'));
  mergeInto(parts.taillight_r, taillightInternals(skin, 'r'));
  mergeInto(parts.bumper_f, frontTrim());
  mergeInto(parts.trunk, trunkTrim());
  mergeInto(parts.door_fl, mirror(1));
  mergeInto(parts.door_fr, mirror(-1));
  mergeInto(parts.door_fl, handle(1, -0.24));
  mergeInto(parts.door_fr, handle(-1, -0.24));
  mergeInto(parts.door_rl, handle(1, -1.13));
  mergeInto(parts.door_rr, handle(-1, -1.13));
  const w = buildWheel();
  for (const name of ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']) {
    // wheels are authored at the origin for the left side; parts are in car space
    const p = PART_PIVOTS[name];
    const right = name.endsWith('r');
    const place = (g: BufferGeometry) => { const c = g.clone(); if (right) c.rotateY(Math.PI); c.translate(p.x, p.y, p.z); return c; };
    parts[name] = { tire: [place(w.tire)], rim: [place(w.rim)], chrome: [place(w.hub)], disc: [place(w.disc)], caliper: [place(w.caliper)] };
  }
  return { shell, parts };
}
