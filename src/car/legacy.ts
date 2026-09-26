// Adapter between the new sedan and the game's car systems (materials by role, part
// pivots, hinges, gauges, steering, glovebox, fuel door). The game keeps its own
// materials and animation; only geometry and anchor positions come from here.
import { type BufferGeometry, Vector3 } from 'three';
import { buildCarParts, PART_PIVOTS, type RoleGeo } from './parts';
import { runningGear } from './body/closures';
import { OIL_CAP, RAD_CAP } from './details/engine';
import { fuelDoor } from './details/trim';
import { buildWheel } from './details/wheel';
import { steeringWheel } from './details/interior';
import { rbox } from './mesh/prims';

/** New role -> game role (materials are resolved by the game). */
const ROLE: Record<string, string> = {
  tailLens: 'tail',
  tailGlow: 'tail',
  drl: 'lamp',
  reflector: 'lamp',
  lampChrome: 'lampHousing',
  fog: 'lens',
  reflectorRed: 'red',
  seal: 'rubber',
  accent: 'chrome',
  dashSoft: 'dash',
  gauge: 'black',
  trimBlack: 'blackGloss',
  satin: 'chrome',
  rimDark: 'rim',
  amber: 'indicator',
};

function toGame(src: RoleGeo, skip: readonly string[] = []): Record<string, BufferGeometry[]> {
  const out: Record<string, BufferGeometry[]> = {};
  for (const [role, list] of Object.entries(src)) {
    if (skip.includes(role)) continue;
    (out[ROLE[role] ?? role] ??= []).push(...list);
  }
  return out;
}

let built: ReturnType<typeof buildCarParts> | null = null;
const car = () => (built ??= buildCarParts({ steering: false, frame: false }));

/** Body shell + structure + cabin (the game adds frame, gauges, controls itself). */
export function legacyShell(): Record<string, BufferGeometry[]> {
  return toGame(car().shell);
}

const wheelLocal = (() => {
  let w: ReturnType<typeof buildWheel> | null = null;
  return () => (w ??= buildWheel());
})();

/** Part geometry in car space (wheels: at the origin, left-hand orientation). */
export function legacyPart(name: string): Record<string, BufferGeometry[]> | null {
  if (name.startsWith('wheel_')) {
    const w = wheelLocal();
    return { tire: [w.tire], rim: [w.rim], chrome: [w.hub] };
  }
  const p = car().parts[name];
  return p ? toGame(p) : null;
}

export const legacyDisc = () => wheelLocal().disc;
export const legacyCaliper = () => wheelLocal().caliper;

/** Pivots that differ from the game's old table (hinges and wheel centres). */
export const LEGACY_PIVOTS: Record<string, Vector3> = { ...PART_PIVOTS };

export function legacySteering(): { wheel: Record<string, BufferGeometry[]>; fixed: Record<string, BufferGeometry[]>; keyPos: Vector3 } {
  const sw = steeringWheel();
  return { wheel: toGame(sw.wheel), fixed: toGame(sw.fixed), keyPos: new Vector3(0.062, -0.02, -0.16) };
}

/** Glovebox lid on the new dash face, hinged at its lower edge. */
export function legacyGlovebox(): { geo: BufferGeometry[]; hinge: Vector3 } {
  const hinge = new Vector3(-0.44, 0.712, 0.418);
  const lid = rbox(0.34, 0.12, 0.018, 0.012, 0, 0.062, -0.012, 0.3);
  const handle = rbox(0.08, 0.012, 0.01, 0.004, 0, 0.1, -0.03, 0.3);
  return { geo: [lid, handle], hinge };
}

/** Fuel door on the left rear quarter, anchored on the skin. */
export function legacyFuelDoor(): { door: BufferGeometry[]; cap: BufferGeometry; neck: Vector3; hinge: Vector3 } {
  const f = fuelDoor();
  return { door: f.door, cap: f.cap, neck: f.neck, hinge: f.hinge };
}

/** Running gear + exhaust replace the old ladder frame. */
export function legacyFrame(): Record<string, BufferGeometry[]> {
  return toGame(runningGear());
}

export const LEGACY_POINTS = {
  oil: new Vector3(...OIL_CAP),
  radiator: new Vector3(...RAD_CAP),
  exhaust: new Vector3(-0.5, 0.285, -2.92),
};
