// Stand-alone PBR materials for the car roles (studio / previews). The game maps the
// same role names onto its own weathered materials.
import { Color, type Material, MeshPhysicalMaterial, MeshStandardMaterial, DoubleSide } from 'three';

export type RoleMaterials = Record<string, Material>;

export function studioMaterials(paint = '#8e1f24'): RoleMaterials {
  const std = (color: string | number, roughness: number, metalness = 0, extra: Partial<MeshStandardMaterial> = {}) =>
    new MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const paintMat = new MeshPhysicalMaterial({ color: new Color(paint), roughness: 0.38, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.06, side: DoubleSide });
  const m: RoleMaterials = {
    paint: paintMat,
    paintIn: paintMat,
    black: std('#141516', 0.62),
    blackGloss: std('#0b0c0d', 0.14, 0.2),
    trimBlack: std('#0e0f10', 0.3, 0.1),
    grille: std('#101112', 0.45, 0.25, { side: DoubleSide }),
    chrome: std('#dfe3e8', 0.06, 1),
    satin: std('#9ba1a8', 0.32, 1),
    rubber: std('#0c0c0c', 0.9),
    tire: std('#161616', 0.86),
    rim: std('#b8bec6', 0.24, 0.95),
    rimDark: std('#3a3d42', 0.4, 0.8),
    disc: std('#77777a', 0.5, 0.85),
    caliper: std('#2c2d31', 0.45, 0.45),
    glass: new MeshPhysicalMaterial({ color: '#1b2226', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.42, side: DoubleSide, depthWrite: false }),
    lens: new MeshPhysicalMaterial({ color: '#f2f6f8', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.22, side: DoubleSide, depthWrite: false }),
    tailLens: new MeshPhysicalMaterial({ color: '#8a0a0e', roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.93, clearcoat: 1 }),
    reflector: std('#dfe3e8', 0.12, 1, { side: DoubleSide }),
    lampHousing: std('#1c1d1f', 0.5, 0.2, { side: DoubleSide }),
    lampChrome: std('#e8ebef', 0.08, 1, { side: DoubleSide }),
    amber: new MeshPhysicalMaterial({ color: '#ff9a1f', roughness: 0.2, transparent: true, opacity: 0.8 }),
    under: std('#1d1c1b', 0.9, 0, { side: DoubleSide }),
    liner: std('#121212', 0.95, 0, { side: DoubleSide }),
    frame: std('#1b1b1b', 0.6, 0.4),
    plate: std('#e8e8e2', 0.5, 0.2),
    mirror: std('#dfe6ea', 0.02, 1),
    seal: std('#0a0a0a', 0.8, 0, { side: DoubleSide }),
    // interior
    dash: std('#232426', 0.78),
    dashSoft: std('#2c2d30', 0.9),
    trim: std('#3a3a3c', 0.7, 0, { side: DoubleSide }),
    carpet: std('#1c1c1d', 1),
    seat: std('#2a2a2c', 0.95),
    seatInsert: std('#38393c', 1),
    headliner: std('#8f8b84', 0.95, 0, { side: DoubleSide }),
    screen: std('#05070a', 0.2, 0.1, { emissive: new Color('#0c2a3a'), emissiveIntensity: 0.6 }),
    gauge: std('#0a0b0d', 0.35),
    accent: std('#8b8f95', 0.3, 0.9),
    engine: std('#6a6d70', 0.35, 0.6),
    engineDark: std('#1c1c1e', 0.65, 0.2),
  };
  return m;
}
