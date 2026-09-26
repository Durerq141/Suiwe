// Stand-alone PBR materials for the car roles (studio / previews). The game maps the
// same role names onto its own weathered materials.
import { CanvasTexture, Color, type Material, MeshPhysicalMaterial, MeshStandardMaterial, DoubleSide, SRGBColorSpace } from 'three';

export type RoleMaterials = Record<string, Material>;

export function studioMaterials(paint = '#b9a58f'): RoleMaterials {
  const std = (color: string | number, roughness: number, metalness = 0, extra: Partial<MeshStandardMaterial> = {}) =>
    new MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const paintMat = new MeshPhysicalMaterial({ color: new Color(paint), roughness: 0.42, metalness: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.08, side: DoubleSide });
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
    tailLens: new MeshPhysicalMaterial({ color: '#b3121a', roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.62, clearcoat: 1, side: DoubleSide, depthWrite: false }),
    reflector: std('#dfe3e8', 0.12, 1, { side: DoubleSide }),
    lampHousing: std('#1c1d1f', 0.5, 0.2, { side: DoubleSide }),
    lampChrome: std('#e8ebef', 0.08, 1, { side: DoubleSide }),
    lamp: std('#fffaf0', 0.2, 0, { emissive: new Color('#fff4df'), emissiveIntensity: 0.25 }),
    drl: std('#ffffff', 0.2, 0, { emissive: new Color('#f4f8ff'), emissiveIntensity: 1.6 }),
    fog: new MeshPhysicalMaterial({ color: '#f5f6f0', roughness: 0.05, transparent: true, opacity: 0.55 }),
    tailGlow: std('#5a0505', 0.3, 0, { emissive: new Color('#ff1a12'), emissiveIntensity: 0.35 }),
    reverse: std('#e8e8e8', 0.2),
    reflectorRed: std('#7a0a0a', 0.3),
    amber: new MeshPhysicalMaterial({ color: '#ff9a1f', roughness: 0.2, transparent: true, opacity: 0.8 }),
    under: std('#1d1c1b', 0.9, 0, { side: DoubleSide }),
    liner: std('#121212', 0.95, 0, { side: DoubleSide }),
    plate: std('#e8e8e2', 0.5, 0.2),
    mirror: std('#dfe6ea', 0.02, 1),
    seal: std('#0a0a0a', 0.85, 0, { side: DoubleSide }),
    grilleBack: std('#060606', 0.9, 0, { side: DoubleSide }),
    grilleBar: std('#2a2c2f', 0.35, 0.6),
    badgeBlue: std('#1d3f8a', 0.25, 0.3),
    pad: std('#171717', 1, 0, { side: DoubleSide }),
    wood: std('#6b4a2e', 0.35),
    gaugeFace: new MeshStandardMaterial({ map: gaugeTexture(), roughness: 0.5, emissive: new Color('#ffffff'), emissiveMap: gaugeTexture(), emissiveIntensity: 0.25 }),
    hose: std('#0e0e0e', 0.75),
    pulley: std('#6c6c70', 0.4, 0.8),
    alternator: std('#9a9ca0', 0.35, 0.8),
    exhaustHot: std('#5a4a3e', 0.7, 0.4),
    valveCover: std('#2c2d31', 0.32, 0.3),
    intake: std('#1b1c1e', 0.55),
    capYellow: std('#e0b020', 0.4),
    capBlue: std('#2050c0', 0.4),
    reservoir: std('#d8d4c8', 0.5),
    radCore: std('#3c3e40', 0.7, 0.5),
    battery: std('#161616', 0.6),
    batteryTop: std('#242424', 0.6),
    batteryLabel: std('#b8261a', 0.5),
    red: std('#b01818', 0.4),
    frame: std('#1b1b1b', 0.6, 0.4),
    susp: std('#2b2b2d', 0.6, 0.4),
    spring: std('#303236', 0.45, 0.4),
    exhaust: std('#5a5a57', 0.65, 0.7),
    // interior
    dash: std('#232426', 0.78),
    dashSoft: std('#2c2d30', 0.9),
    trim: std('#3a3a3c', 0.7, 0, { side: DoubleSide }),
    carpet: std('#1c1c1d', 1),
    seat: std('#2a2a2c', 0.95),
    seatInsert: std('#38393c', 1),
    headliner: std('#8f8b84', 0.95, 0, { side: DoubleSide }),
    console: std('#26272a', 0.7),
    armrest: std('#303134', 0.6),
    knob: std('#1a1b1d', 0.4),
    switch: std('#101112', 0.5),
    wheelRim: std('#1a1a1b', 0.55),
    wheelSpoke: std('#202123', 0.5),
    dome: std('#e8e2d0', 0.4),
    screen: std('#05070a', 0.2, 0.1, { emissive: new Color('#0c2a3a'), emissiveIntensity: 0.6 }),
    gauge: std('#0a0b0d', 0.35),
    accent: std('#8b8f95', 0.3, 0.9),
    engine: std('#6a6d70', 0.35, 0.6),
    engineDark: std('#1c1c1e', 0.65, 0.2),
  };
  return m;
}

let gaugeTex: CanvasTexture | null = null;
/** Two-dial cluster face used by the studio previews (the game draws its own). */
function gaugeTexture() {
  if (gaugeTex) return gaugeTex;
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 340;
  const g = c.getContext('2d')!;
  g.fillStyle = '#060708'; g.fillRect(0, 0, c.width, c.height);
  const dial = (cx: number, max: number, label: string) => {
    g.save(); g.translate(cx, 175);
    g.strokeStyle = '#2a2d31'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 148, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI * 0.75 + (Math.PI * 1.5 * i) / 40;
      const big = i % 5 === 0;
      g.strokeStyle = big ? '#f2f2f2' : '#9aa0a6'; g.lineWidth = big ? 5 : 2;
      g.beginPath(); g.moveTo(Math.cos(a) * (big ? 112 : 124), Math.sin(a) * (big ? 112 : 124)); g.lineTo(Math.cos(a) * 138, Math.sin(a) * 138); g.stroke();
      if (big) { g.fillStyle = '#e8e8e8'; g.font = '600 26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.round((max * i) / 40)), Math.cos(a) * 88, Math.sin(a) * 88); }
    }
    g.fillStyle = '#9aa0a6'; g.font = '500 22px sans-serif'; g.fillText(label, 0, 60);
    g.strokeStyle = '#ff5a1e'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(Math.PI * 0.8) * 120, Math.sin(Math.PI * 0.8) * 120); g.stroke();
    g.fillStyle = '#222'; g.beginPath(); g.arc(0, 0, 16, 0, Math.PI * 2); g.fill();
    g.restore();
  };
  dial(245, 8, 'x1000 rpm'); dial(779, 240, 'km/h');
  g.fillStyle = '#0d1a22'; g.fillRect(440, 110, 144, 130); g.fillStyle = '#7fd3ff'; g.font = '600 30px sans-serif'; g.textAlign = 'center'; g.fillText('D  21°', 512, 160); g.fillText('0 km', 512, 205);
  gaugeTex = new CanvasTexture(c);
  gaugeTex.colorSpace = SRGBColorSpace;
  return gaugeTex;
}
