// Part catalogue: which body tags make up which detachable part, plus hinge pivots.
import { type BufferGeometry, Vector3 } from 'three';
import { DIMS } from './dims';
import { bodySkin, skinGeometry } from './body/skin';
import { type Tag } from './body/cage';

export type RoleGeo = Record<string, BufferGeometry[]>;

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** Hinge / attachment pivots in car space (parts are authored in car space). */
export const PART_PIVOTS: Record<string, Vector3> = {
  door_fl: v(0.93, 0.62, DIMS.zCowl - 0.03),
  door_fr: v(-0.93, 0.62, DIMS.zCowl - 0.03),
  door_rl: v(0.94, 0.62, DIMS.zDoorSplit - 0.03),
  door_rr: v(-0.94, 0.62, DIMS.zDoorSplit - 0.03),
  hood: v(0, 0.975, DIMS.zCowl + 0.02),
  trunk: v(0, 1.065, DIMS.zDeck - 0.02),
};

const PANEL_TAGS: Record<string, { paint?: Tag[]; glass?: Tag[]; trim?: Tag[]; lens?: Tag[]; grille?: Tag[] }> = {
  hood: { paint: ['hood'] },
  trunk: { paint: ['trunk', 'plate_r'] },
  fender_fl: { paint: ['fender_fl'] },
  fender_fr: { paint: ['fender_fr'] },
  door_fl: { paint: ['door_fl'], glass: ['glass_fl'], trim: ['frame_fl'] },
  door_fr: { paint: ['door_fr'], glass: ['glass_fr'], trim: ['frame_fr'] },
  door_rl: { paint: ['door_rl'], glass: ['glass_rl'], trim: ['frame_rl'] },
  door_rr: { paint: ['door_rr'], glass: ['glass_rr'], trim: ['frame_rr'] },
  windshield: { glass: ['windshield'] },
  window_r: { glass: ['window_r'] },
  bumper_f: { paint: ['bumper_f'], grille: ['grille', 'intake'] },
  bumper_r: { paint: ['bumper_r'] },
  headlight_l: { lens: ['headlight_l'] },
  headlight_r: { lens: ['headlight_r'] },
  taillight_l: { trim: ['taillight_l'] },
  taillight_r: { trim: ['taillight_r'] },
};

const SHELL_TAGS: Tag[] = ['roof', 'aPillar', 'cPillar', 'quarter', 'rocker', 'cowl'];

export function buildCarParts(): { shell: RoleGeo; parts: Record<string, RoleGeo> } {
  const skin = bodySkin();
  const shell: RoleGeo = { paint: [skinGeometry(skin, SHELL_TAGS)] };
  const parts: Record<string, RoleGeo> = {};
  for (const [name, spec] of Object.entries(PANEL_TAGS)) {
    const geo: RoleGeo = {};
    if (spec.paint) geo.paint = [skinGeometry(skin, spec.paint)];
    if (spec.glass) geo.glass = [skinGeometry(skin, spec.glass)];
    if (spec.trim) geo[name.startsWith('taillight') ? 'tailLens' : 'blackGloss'] = [skinGeometry(skin, spec.trim)];
    if (spec.lens) geo.lens = [skinGeometry(skin, spec.lens)];
    if (spec.grille) geo.grille = [skinGeometry(skin, spec.grille)];
    parts[name] = geo;
  }
  return { shell, parts };
}
