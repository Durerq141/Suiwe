// Car studio & critic. Renders the generated sedan the way the reference sheets show a
// car (front 3/4, profile, rear 3/4, dashboard, cabin, engine bay) plus inspection modes.
//   /studio.html?view=sheet            six-frame contact sheet (default)
//   /studio.html?view=orbit            free orbit
//   /studio.html?view=holes            see-through / gap detector
import {
  ACESFilmicToneMapping, AmbientLight, Color, DirectionalLight, Mesh, MeshBasicMaterial, PCFSoftShadowMap, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Scene, ShadowMaterial, SRGBColorSpace, Vector3, WebGLRenderer, type Object3D,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCarModel } from '../car/model';
import { studioMaterials } from '../car/materials';

const params = new URLSearchParams(location.search);
const view = params.get('view') ?? 'sheet';
const hud = document.getElementById('hud')!;

const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#ecebe8');
const pmrem = new PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new AmbientLight(0xffffff, 0.15));
const sun = new DirectionalLight(0xffffff, 1.6);
sun.position.set(3, 8, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 });
sun.shadow.radius = 6;
scene.add(sun);
const ground = new Mesh(new PlaneGeometry(40, 40), new ShadowMaterial({ opacity: 0.22 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const t0 = performance.now();
const mats = studioMaterials(params.get('paint') ?? '#7d1a20');
const car = buildCarModel(mats);
scene.add(car.root);
const buildMs = performance.now() - t0;

let tris = 0;
car.root.traverse((o: Object3D) => { const m = o as Mesh; if (m.isMesh) tris += (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3; });

function setOpen(name: string, open: boolean) {
  const p = car.parts[name];
  if (!p) return;
  const a = open ? 1 : 0;
  if (name === 'hood') p.rotation.x = -1.05 * a;
  else if (name === 'trunk') p.rotation.x = 1.15 * a;
  else if (name.startsWith('door_')) p.rotation.y = (name.endsWith('l') ? -1 : 1) * 1.1 * a;
}
for (const n of (params.get('open') ?? '').split(',').filter(Boolean)) setOpen(n, true);
for (const n of (params.get('hide') ?? '').split(',').filter(Boolean)) if (car.parts[n]) car.parts[n].visible = false;

interface Shot { label: string; pos: [number, number, number]; look: [number, number, number]; fov: number; open?: string[]; hide?: string[] }
const SHOTS: Shot[] = [
  { label: 'Перед 3/4', pos: [4.3, 1.55, 5.2], look: [0, 0.68, 0.1], fov: 30 },
  { label: 'Профиль', pos: [9.5, 0.95, -0.22], look: [0, 0.72, -0.22], fov: 30 },
  { label: 'Зад 3/4', pos: [4.4, 1.7, -5.9], look: [0, 0.72, -0.35], fov: 30 },
  { label: 'Торпеда', pos: [0.22, 1.2, -0.95], look: [0.12, 0.95, 0.7], fov: 68, hide: ['seat_d', 'seat_p'] },
  { label: 'Салон сзади', pos: [-0.32, 1.22, 0.32], look: [0.12, 0.74, -1.3], fov: 70 },
  { label: 'Моторный отсек', pos: [0, 2.35, 3.75], look: [0, 0.62, 1.45], fov: 42, open: ['hood'] },
];

const camera = new PerspectiveCamera(35, innerWidth / innerHeight, 0.02, 200);

function applyShot(s: Shot, aspect: number) {
  camera.fov = s.fov;
  camera.aspect = aspect;
  camera.position.set(...s.pos);
  camera.lookAt(new Vector3(...s.look));
  camera.updateProjectionMatrix();
  for (const n of Object.keys(car.parts)) { car.parts[n].visible = true; setOpen(n, false); }
  for (const n of s.open ?? []) setOpen(n, true);
  for (const n of s.hide ?? []) if (car.parts[n]) car.parts[n].visible = false;
}

function renderSheet() {
  const W = innerWidth, H = innerHeight;
  const cols = 3, rows = 2, pad = 6, labelH = 22;
  const cw = Math.floor((W - pad * (cols + 1)) / cols), ch = Math.floor((H - pad * (rows + 1)) / rows) - labelH;
  renderer.setScissorTest(true);
  renderer.setClearColor(0xffffff, 1);
  renderer.clear();
  SHOTS.forEach((s, i) => {
    const cx = pad + (i % cols) * (cw + pad);
    const cy = H - (pad + Math.floor(i / cols) * (ch + labelH + pad)) - ch; // GL origin bottom-left
    renderer.setViewport(cx, cy, cw, ch);
    renderer.setScissor(cx, cy, cw, ch);
    applyShot(s, cw / ch);
    renderer.render(scene, camera);
  });
  renderer.setScissorTest(false);
  const labels = document.querySelectorAll('.lbl');
  labels.forEach((l) => l.remove());
  SHOTS.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'lbl';
    el.textContent = `${i + 1}. ${s.label}`;
    Object.assign(el.style, { position: 'fixed', left: `${pad + (i % cols) * (cw + pad)}px`, top: `${pad + Math.floor(i / cols) * (ch + labelH + pad) + ch + 2}px`, width: `${cw}px`, textAlign: 'center', color: '#333', font: '600 13px system-ui' });
    document.body.appendChild(el);
  });
}

function renderHoles() {
  // everything flat white on black: any black pixel enclosed by the car silhouette is a hole
  const white = new MeshBasicMaterial({ color: 0xffffff, side: 2 });
  const saved = new Map<Mesh, unknown>();
  car.root.traverse((o) => { const m = o as Mesh; if (m.isMesh) { saved.set(m, m.material); m.material = white; } });
  const bg = scene.background;
  scene.background = new Color(0x000000);
  ground.visible = false;
  const W = innerWidth, H = innerHeight;
  const dirs: [number, number, number][] = [[1, 0.25, 0.9], [1, 0.12, 0], [1, 0.3, -1], [-1, 0.25, 0.9], [0, 0.2, 1], [0, 0.2, -1], [0.6, 1, 0.3], [0, -0.35, 1]];
  const cols = 4, rows = 2, cw = Math.floor(W / cols), ch = Math.floor(H / rows);
  renderer.setScissorTest(true);
  const report: string[] = [];
  dirs.forEach((d, i) => {
    const cx = (i % cols) * cw, cy = H - (Math.floor(i / cols) + 1) * ch;
    renderer.setViewport(cx, cy, cw, ch);
    renderer.setScissor(cx, cy, cw, ch);
    const dir = new Vector3(...d).normalize();
    camera.fov = 28; camera.aspect = cw / ch;
    camera.position.copy(dir.multiplyScalar(12)).add(new Vector3(0, 0.7, -0.2));
    camera.lookAt(0, 0.7, -0.2);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    report.push(`view ${i}: ${countHoles(cx, cy, cw, ch)} hole px`);
  });
  renderer.setScissorTest(false);
  scene.background = bg;
  ground.visible = true;
  saved.forEach((mat, m) => { m.material = mat as never; });
  (window as unknown as { __holes: string[] }).__holes = report;
  hud.textContent += '\n' + report.join('\n');
}

function countHoles(x: number, y: number, w: number, h: number): number {
  const gl = renderer.getContext();
  const px = new Uint8Array(w * h * 4);
  gl.readPixels(x * renderer.getPixelRatio(), y * renderer.getPixelRatio(), w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
  const dark = (i: number) => px[i * 4] < 128;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let i = 0; i < w; i++) { stack.push(i, (h - 1) * w + i); }
  for (let j = 0; j < h; j++) { stack.push(j * w, j * w + w - 1); }
  while (stack.length) {
    const i = stack.pop()!;
    if (seen[i] || !dark(i)) continue;
    seen[i] = 1;
    const cx = i % w, cy = (i / w) | 0;
    if (cx > 0) stack.push(i - 1);
    if (cx < w - 1) stack.push(i + 1);
    if (cy > 0) stack.push(i - w);
    if (cy < h - 1) stack.push(i + w);
  }
  let holes = 0;
  for (let i = 0; i < w * h; i++) if (dark(i) && !seen[i]) { holes++; px[i * 4] = 255; }
  return holes;
}

hud.textContent = `build ${buildMs.toFixed(0)} ms · ${Math.round(tris / 1000)}k tris · ${Object.keys(car.parts).length} parts`;

if (view === 'orbit') {
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(4.5, 1.8, 5.2);
  controls.target.set(0, 0.7, 0);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
} else if (view === 'holes') {
  renderHoles();
} else if (view.startsWith('shot')) {
  applyShot(SHOTS[Number(view.slice(4)) || 0], innerWidth / innerHeight);
  renderer.render(scene, camera);
} else {
  renderSheet();
}
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); if (view === 'sheet') renderSheet(); });
(window as unknown as { __studioReady: boolean }).__studioReady = true;
