// @ts-nocheck
import { AdditiveBlending as TC, BackSide as iC, Bone as PQ, Box3 as Jg, BoxGeometry as uI, BufferAttribute as GI, BufferGeometry as SI, CanvasTexture as Mo, CatmullRomCurve3 as DC, CircleGeometry as VC, ClampToEdgeWrapping as LC, Color as nA, ConeGeometry as PB, CubeCamera as TE, CustomToneMapping as NQ, CylinderGeometry as VA, DirectionalLight as VQ, DoubleSide as OI, DynamicDrawUsage as XC, Euler as $I, ExtrudeGeometry as lB, Float32BufferAttribute as XA, FogExp2 as co, FrontSide as WB, Group as WA, HalfFloatType as wg, HemisphereLight as pi, IcosahedronGeometry as fo, InstancedMesh as WC, LatheGeometry as sQ, LinearFilter as Pg, LinearMipmapLinearFilter as VB, LineBasicMaterial as YE, LineSegments as wo, MathUtils as Ai, Matrix4 as TA, Mesh as cA, MeshBasicMaterial as pC, MeshPhysicalMaterial as rQ, MeshStandardMaterial as oI, NeutralToneMapping as ui, NoColorSpace as yB, NormalBlending as jQ, Object3D as Gg, OrthographicCamera as _B, Path as ZB, PCFShadowMap as di, PerspectiveCamera as vg, PlaneGeometry as PI, PMREMGenerator as ZE, PointLight as hQ, Points as yo, Quaternion as nI, Raycaster as Ni, RepeatWrapping as kC, RGBAFormat as EC, Scene as mC, ShaderChunk as pI, ShaderLib as zC, ShaderMaterial as xI, Shape as Zg, ShapeGeometry as aQ, Skeleton as Ki, SkinnedMesh as Ui, Sphere as FC, SphereGeometry as ug, SpotLight as Ji, Sprite as RE, SpriteMaterial as OQ, SRGBColorSpace as mg, TorusGeometry as Xg, TubeGeometry as nQ, Uint16BufferAttribute as Mi, UnsignedByteType as _g, Vector2 as eA, Vector3 as y, WebGLCubeRenderTarget as _E, WebGLRenderer as kn, WebGLRenderTarget as zI, ZeroFactor as qi } from "three";
import * as _I from "@dimforge/rapier3d-compat";
import { RoundedBoxGeometry as tg } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer as Rn } from "three/addons/postprocessing/EffectComposer.js";
import { GTAOPass as jE } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass as fn } from "three/addons/postprocessing/OutputPass.js";
import { Pass as oC } from "three/addons/postprocessing/Pass.js";
import { RenderPass as un } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass as Ii } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass as VE } from "three/addons/postprocessing/UnrealBloomPass.js";
import { mergeGeometries as uw, mergeVertices as bi } from "three/addons/utils/BufferGeometryUtils.js";
import { legacyShell, legacyPart, legacyDisc, legacyCaliper, LEGACY_PIVOTS, legacySteering, legacyGlovebox, legacyFuelDoor } from '../car/legacy';
var tC = { sunColor: new Float32Array([1, 0.9, 0.75]), sunDir: new Float32Array([0, 1, 0]), params: new Float32Array([0.012, 0, 8, 1]) }, zJ = `
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying vec3 vFogViewPos;
  uniform float fogDensity;
  uniform vec3 fogSunColor;
  uniform vec3 fogSunDir;
  uniform vec4 fogParams;
  vec3 applyFog(vec3 col, vec3 viewPos) {
    vec3 dirW = (vec4(viewPos, 0.0) * viewMatrix).xyz;
    float dist = length(dirW);
    vec3 fdir = dirW / max(dist, 1e-4);
    float k = fogParams.x;
    float y0 = max(cameraPosition.y - fogParams.y, -50.0);
    float dy = fdir.y * dist;
    float ht = abs(dy) > 0.05 ? (exp(-k * y0) - exp(-k * (y0 + dy))) / (k * dy) : exp(-k * y0);
    float amt = 1.0 - exp(-fogDensity * dist * max(ht, 0.0));
    float sunAmt = pow(max(dot(fdir, fogSunDir), 0.0), fogParams.z);
    vec3 fc = mix(fogColor, fogSunColor, sunAmt);
    return mix(col, fc, clamp(amt, 0.0, fogParams.w));
  }
#endif
`, Bw = false;
function Qw() {
  if (Bw) return;
  Bw = true;
  let B = ["basic", "lambert", "phong", "standard", "physical", "toon", "matcap", "points", "dashed", "sprite", "shadow"];
  for (let I of B) {
    let g = zC[I];
    g && (g.uniforms.fogSunColor = { value: tC.sunColor }, g.uniforms.fogSunDir = { value: tC.sunDir }, g.uniforms.fogParams = { value: tC.params });
  }
  let A = pI;
  A.fog_pars_vertex = `#ifdef USE_FOG
 varying vec3 vFogViewPos;
#endif
`, A.fog_vertex = `#ifdef USE_FOG
 vFogViewPos = mvPosition.xyz;
#endif
`, A.fog_pars_fragment = zJ, A.fog_fragment = `#ifdef USE_FOG
 gl_FragColor.rgb = applyFog(gl_FragColor.rgb, vFogViewPos);
#endif
`;
}
function iw() {
  return { fogColor: { value: new nA() }, fogDensity: { value: 25e-5 }, fogSunColor: { value: tC.sunColor }, fogSunDir: { value: tC.sunDir }, fogParams: { value: tC.params } };
}
var $J = `
uniform float uSeed;
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash32(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }
float sh(vec2 i, vec2 per){ return hash12(mod(i, per) + uSeed * 17.13); }
float vnoise(vec2 p, vec2 per){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(sh(i,per), sh(i+vec2(1.,0.),per), u.x), mix(sh(i+vec2(0.,1.),per), sh(i+vec2(1.,1.),per), u.x), u.y);
}
vec2 gh(vec2 i, vec2 per){ float a = hash12(mod(i,per) + uSeed*13.7 + 0.5) * 6.2831853; return vec2(cos(a), sin(a)); }
float gnoise(vec2 p, vec2 per){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*f*(f*(f*6.-15.)+10.);
  float a = dot(gh(i,per), f), b = dot(gh(i+vec2(1.,0.),per), f-vec2(1.,0.));
  float c = dot(gh(i+vec2(0.,1.),per), f-vec2(0.,1.)), d = dot(gh(i+vec2(1.,1.),per), f-vec2(1.,1.));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y) * 1.5;
}
// periodic fbm over the unit tile; freq must be an integer
float fbm(vec2 uv, vec2 freq, int oct){
  float s = 0., a = 0.5, n = 0.; vec2 f = freq;
  for (int i = 0; i < 10; i++){ if (i >= oct) break; s += a * gnoise(uv * f + float(i) * vec2(17., 31.), f); n += a; a *= 0.5; f *= 2.; }
  return s / n;
}
float fbmv(vec2 uv, vec2 freq, int oct){
  float s = 0., a = 0.5, n = 0.; vec2 f = freq;
  for (int i = 0; i < 10; i++){ if (i >= oct) break; s += a * vnoise(uv * f + float(i) * vec2(17., 31.), f); n += a; a *= 0.5; f *= 2.; }
  return s / n;
}
// periodic voronoi: x=F1, y=F2, z=cell id
vec3 voronoi(vec2 uv, vec2 freq){
  vec2 p = uv * freq; vec2 i = floor(p), f = fract(p);
  float F1 = 8., F2 = 8., id = 0.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 g = vec2(float(x), float(y));
    vec2 cell = mod(i + g, freq);
    vec2 o = hash22(cell + uSeed * 7.1);
    vec2 r = g + o - f; float d = dot(r, r);
    if (d < F1){ F2 = F1; F1 = d; id = hash12(cell + uSeed * 3.3 + 0.7); } else if (d < F2) F2 = d;
  }
  return vec3(sqrt(F1), sqrt(F2), id);
}
vec3 toLin(vec3 c){ return pow(c, vec3(2.2)); }
float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
`, AN = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", Kn = class {
  constructor(A) {
    this.renderer = A;
    this.quad = new cA(new PI(2, 2)), this.quad.frustumCulled = false, this.scene.add(this.quad), this.maxAniso = A.capabilities.getMaxAnisotropy();
  }
  renderer;
  scene = new mC();
  cam = new _B(-1, 1, 1, -1, 0, 1);
  quad;
  targets = [];
  maxAniso;
  run(A, I) {
    let g = I.width, C = I.height ?? I.width, Q = new zI(g, C, { type: I.float ? wg : _g, format: EC, generateMipmaps: I.mips !== false, minFilter: I.mips !== false ? VB : Pg, magFilter: Pg, wrapS: I.wrap === false ? LC : kC, wrapT: I.wrap === false ? LC : kC, colorSpace: I.srgb ? mg : yB, depthBuffer: false, anisotropy: Math.min(8, this.maxAniso) }), i = new xI({ vertexShader: AN, fragmentShader: `precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
${$J}
${A}
void main(){ gl_FragColor = texMain(vUv); }`, uniforms: { uSeed: { value: I.seed ?? 1 }, uRes: { value: new eA(g, C) }, ...I.uniforms || {} }, depthTest: false, depthWrite: false });
    this.quad.material = i;
    let E = this.renderer.getRenderTarget(), t = this.renderer.xr.enabled;
    return this.renderer.xr.enabled = false, this.renderer.setRenderTarget(Q), this.renderer.render(this.scene, this.cam), this.renderer.setRenderTarget(E), this.renderer.xr.enabled = t, i.dispose(), this.targets.push(Q), Q.texture.anisotropy = Math.min(8, this.maxAniso), Q.texture;
  }
  normalFrom(A, I, g, C = g, Q = 1) {
    return this.run(`uniform sampler2D uH; uniform float uStr;
      vec4 texMain(vec2 uv){
        vec2 e = 1.0 / uRes;
        float l = texture2D(uH, uv - vec2(e.x, 0.)).r, r = texture2D(uH, uv + vec2(e.x, 0.)).r;
        float d = texture2D(uH, uv - vec2(0., e.y)).r, u = texture2D(uH, uv + vec2(0., e.y)).r;
        vec3 n = normalize(vec3((l - r) * uStr, (d - u) * uStr, 1.0));
        return vec4(n * 0.5 + 0.5, 1.0);
      }`, { width: g, height: C, uniforms: { uH: { value: A }, uStr: { value: I } }, seed: Q });
  }
  disposeAll() {
    for (let A of this.targets) A.dispose();
    this.targets.length = 0;
  }
};
var IN = `
float rip(vec2 uv){
  vec2 w = vec2(fbm(uv, vec2(3.), 4), fbm(uv + vec2(0.31, 0.77), vec2(3.), 4));
  float ph = uv.x * 13. + w.x * 1.15 + fbm(uv, vec2(9.), 3) * 0.2;
  float f = fract(ph);
  float r = f < 0.68 ? f / 0.68 : (1. - f) / 0.32;
  r = smoothstep(0., 1., r);
  float amp = 0.45 + 0.55 * smoothstep(-0.45, 0.45, fbm(uv + vec2(0.5), vec2(2.), 3));
  return r * amp;
}
vec4 texMain(vec2 uv){
  float h = rip(uv) * 0.8;
  h += fbm(uv, vec2(48.), 3) * 0.06;
  h += (hash12(floor(uv * uRes) + uSeed) - 0.5) * 0.012;
  return vec4(h, 0., 0., 1.);
}`, gN = `
uniform sampler2D uH;
vec4 texMain(vec2 uv){
  float h = texture2D(uH, uv).r;
  vec3 base = toLin(vec3(0.88, 0.69, 0.47));
  float m = fbm(uv, vec2(5.), 5);
  vec3 c = base * (0.93 + 0.12 * m);
  c *= mix(0.9, 1.04, smoothstep(0.05, 0.6, h));
  vec2 cell = floor(uv * uRes);
  float g = hash12(cell + uSeed * 3.);
  if (g > 0.986) c *= 0.5 + 0.3 * hash12(cell + 1.3);
  else if (g < 0.01) c = mix(c, vec3(1.0), 0.3);
  float g2 = hash12(floor(uv * uRes * 0.5) + 5.1);
  if (g2 > 0.972) c *= vec3(1.04, 0.84, 0.74);
  return vec4(c, 1.);
}`, CN = `
vec4 texMain(vec2 uv){
  float a = fbm(uv, vec2(4.), 6) * 0.5 + 0.5;
  float b = fbm(uv + 0.3, vec2(9.), 5) * 0.5 + 0.5;
  float c = fbm(uv + 0.7, vec2(25.), 4) * 0.5 + 0.5;
  float d = fbm(uv + 0.11, vec2(61.), 3) * 0.5 + 0.5;
  return vec4(a, b, c, d);
}`, Ec = `
struct RoadF { float paint; float crack; float patchm; float agg; float track; float edge; float n; };
RoadF roadF(vec2 uv){
  RoadF r;
  float x = (uv.x - 0.5) * 9.2; float y = uv.y * 16.;
  float ax = abs(x);
  vec3 v = voronoi(uv, vec2(368., 640.));
  r.agg = smoothstep(0.38, 0.08, v.x) * (0.35 + 0.65 * v.z);
  // sparse, irregular cracks: warped voronoi edges gated by a patchy mask
  vec2 wq = uv + vec2(fbm(uv, vec2(5., 9.), 4), fbm(uv + 0.5, vec2(5., 9.), 4)) * vec2(0.035, 0.02);
  vec3 cv = voronoi(wq, vec2(5., 9.));
  float ed = cv.y - cv.x;
  float cm = smoothstep(0.62, 0.8, fbm(uv + 0.4, vec2(2., 4.), 4) * 0.5 + 0.5);
  float cw = 0.012 + 0.01 * (fbm(uv, vec2(20., 40.), 2) * 0.5 + 0.5);
  r.crack = (1. - smoothstep(0.0, cw, ed)) * cm;
  // fine alligator cracking only in worn patches
  vec3 cv2 = voronoi(wq * 1.0 + 0.3, vec2(18., 32.));
  float am = smoothstep(0.7, 0.85, fbm(uv + 0.77, vec2(2., 3.), 3) * 0.5 + 0.5);
  r.crack = max(r.crack, (1. - smoothstep(0.0, 0.03, cv2.y - cv2.x)) * am * 0.8);
  float lcx = x - 0.95 - fbm(uv, vec2(2., 16.), 4) * 0.4;
  r.crack = max(r.crack, (1. - smoothstep(0.0, 0.018, abs(lcx))) * smoothstep(0.3, 0.55, fbm(uv + 0.9, vec2(1., 8.), 3) * 0.5 + 0.5));
  float pm = 0.;
  vec2 pc = vec2(uv.x * 3., uv.y * 4.);
  vec2 cell = floor(pc);
  if (hash12(cell + 9.1) > 0.86) {
    vec2 f = fract(pc); vec2 hs = hash22(cell + 2.3) * vec2(0.25, 0.3) + vec2(0.12, 0.1);
    vec2 d = abs(f - 0.5 + (hash22(cell + 7.7) - 0.5) * 0.2) - hs;
    pm = 1. - smoothstep(0., 0.025, max(d.x, d.y) + fbm(uv, vec2(30., 60.), 2) * 0.02);
  }
  r.patchm = pm;
  float ta = (ax - 1.0) / 0.38, tb = (ax - 2.95) / 0.38;
  r.track = exp(-ta * ta) + exp(-tb * tb);
  float edgeL = 1. - smoothstep(0.055, 0.068, abs(ax - 3.95));
  float cen = 1. - smoothstep(0.045, 0.057, abs(ax - 0.13));
  float fy = fract(y / 4.);
  float dash = smoothstep(0.0, 0.004, fy) * (1. - smoothstep(0.645, 0.65, fy));
  float paint = max(edgeL, cen * dash);
  float wn = fbm(uv, vec2(40., 70.), 4) * 0.5 + 0.5;
  paint *= smoothstep(0.26, 0.42, wn + 0.1 - r.track * 0.1);
  paint *= 1. - r.crack;
  paint *= 1. - r.patchm * 0.92;
  r.paint = paint;
  float e = ax + fbm(uv, vec2(4., 48.), 4) * 0.22 + (hash12(floor(uv * uRes)) - 0.5) * 0.04;
  r.edge = 1. - smoothstep(4.24, 4.3, e);
  r.n = fbm(uv, vec2(12., 20.), 5);
  return r;
}`, BN = Ec + `
vec4 texMain(vec2 uv){
  RoadF r = roadF(uv);
  vec3 c = toLin(vec3(0.255, 0.245, 0.235));
  c *= 0.84 + 0.26 * r.n;
  c = mix(c, toLin(vec3(0.44, 0.42, 0.40)), r.agg * 0.5);
  c *= 1. + r.track * 0.1;
  c = mix(c, c * 0.72, r.patchm);
  c = mix(c, toLin(vec3(0.07, 0.07, 0.07)), r.crack * 0.9);
  c = mix(c, toLin(vec3(0.88, 0.67, 0.17)) * (0.85 + 0.2 * r.n), r.paint);
  float ax = abs((uv.x - 0.5) * 9.2);
  float dust = smoothstep(3.3, 4.3, ax) * (0.35 + 0.65 * (fbm(uv, vec2(6., 24.), 4) * 0.5 + 0.5));
  c = mix(c, toLin(vec3(0.74, 0.60, 0.44)), dust * 0.5);
  return vec4(c, r.edge);
}`, QN = Ec + `
vec4 texMain(vec2 uv){
  RoadF r = roadF(uv);
  float h = 0.5 + r.agg * 0.3 - r.crack * 0.7 + r.paint * 0.12 - r.patchm * 0.06 + r.n * 0.05;
  return vec4(h, 0., 0., 1.);
}`, iN = Ec + `
vec4 texMain(vec2 uv){
  RoadF r = roadF(uv);
  float rough = 0.93 - r.track * 0.07;
  rough = mix(rough, 0.72, r.paint);
  rough = mix(rough, 0.8, r.patchm);
  return vec4(1. - r.crack * 0.5, rough, 0., 1.);
}`, tc = `
struct PF { float gap; float grain; float knot; float nail; float seam; float r; float fx; };
PF planks(vec2 uv){
  PF p;
  float N = 10.;
  float px = uv.x * N; float id = floor(px); float fx = fract(px);
  float s1 = hash12(vec2(id, 3.) + uSeed * 1.7) * 0.5; float s2 = s1 + 0.3 + hash12(vec2(id, 5.) + uSeed) * 0.2;
  float seg = (uv.y > s1 && uv.y < s2) ? 1. : 0.;
  float r = hash12(vec2(id, seg * 9. + 1.) + uSeed);
  p.r = r; p.fx = fx;
  float warp = fbm(uv + vec2(0., r), vec2(N, 3.), 4) * 1.6;
  float lines = sin((fx * 5. + warp * 2. + r * 20.) * 6.2831853) * 0.5 + 0.5;
  lines = pow(max(lines, 0.), 2.5);
  float fine = gnoise(vec2(uv.x * N * 24., uv.y * 5.), vec2(N * 24., 5.)) * 0.5 + 0.5;
  p.grain = lines * 0.55 + fine * 0.45;
  p.gap = smoothstep(0.0, 0.03, fx) * (1. - smoothstep(0.97, 1.0, fx));
  p.seam = max(1. - smoothstep(0.0, 0.003, abs(uv.y - s1)), 1. - smoothstep(0.0, 0.003, abs(uv.y - s2)));
  // knot
  vec2 kp = vec2(0.25 + 0.5 * hash12(vec2(id, seg + 11.)), mix(s1, s2, hash12(vec2(id, seg + 13.))));
  if (seg < 0.5) kp.y = fract(s2 + (1. - (s2 - s1)) * hash12(vec2(id, 17.)));
  vec2 kd = vec2((fx - kp.x) * 0.2 / N * N, uv.y - kp.y);
  kd.x = (fx - kp.x) / N;
  float kr = length(kd * vec2(1.0, 0.45));
  p.knot = (1. - smoothstep(0.004, 0.012, kr)) * step(0.55, hash12(vec2(id, seg + 19.)));
  // nails near seams
  float ny = min(abs(uv.y - s1 - 0.012), abs(uv.y - s2 - 0.012));
  p.nail = 1. - smoothstep(0.0025, 0.004, length(vec2((fx - 0.5) / N, ny)));
  return p;
}`, Ew = tc + `
uniform vec3 uDark; uniform vec3 uMid; uniform vec3 uGrey; uniform float uWeather;
vec4 texMain(vec2 uv){
  PF p = planks(uv);
  vec3 c = mix(toLin(uDark), toLin(uMid), p.grain * 0.65 + p.r * 0.35);
  float wz = fbm(uv, vec2(3., 4.), 4) * 0.5 + 0.5;
  c = mix(c, toLin(uGrey) * (0.8 + 0.3 * p.grain), uWeather * smoothstep(0.2, 0.8, wz + p.r * 0.3));
  c = mix(c, toLin(uDark) * 0.5, p.knot * 0.8);
  c *= mix(0.18, 1., p.gap);
  c *= 1. - p.seam * 0.7;
  c = mix(c, toLin(vec3(0.12, 0.08, 0.06)), p.nail);
  return vec4(c, 1.);
}`, EN = tc + `
vec4 texMain(vec2 uv){
  PF p = planks(uv);
  float cup = 1. - pow(abs(p.fx - 0.5) * 2., 4.) * 0.15;
  float h = p.gap * cup - p.grain * 0.06 - p.seam * 0.5 + p.knot * 0.03 + p.nail * 0.05;
  return vec4(h, 0., 0., 1.);
}`, tN = tc + `
vec4 texMain(vec2 uv){
  PF p = planks(uv);
  float r = 0.82 + p.grain * 0.12 - p.nail * 0.4;
  return vec4(1., r, p.nail * 0.8, 1.);
}`, oN = `
vec4 texMain(vec2 uv){
  float s = sin(uv.x * 12. * 6.2831853);
  float h = 0.5 + 0.5 * s + fbm(uv, vec2(8.), 3) * 0.03;
  return vec4(h, 0., 0., 1.);
}`, ew = `
uniform float uRust;
float rustMask(vec2 uv){
  float streak = fbm(vec2(uv.x, uv.y), vec2(36., 3.), 4) * 0.5 + 0.5;
  float blot = fbm(uv, vec2(4.), 6) * 0.5 + 0.5;
  float bottom = smoothstep(0.35, 0.0, uv.y) * 0.25;
  return smoothstep(0.62 - uRust * 0.55, 0.78 - uRust * 0.5, blot * 0.75 + streak * 0.35 + bottom);
}`, tw = ew + `
vec4 texMain(vec2 uv){
  float m = rustMask(uv);
  float n = fbm(uv, vec2(6.), 5);
  vec3 metal = toLin(vec3(0.58, 0.59, 0.58)) * (0.82 + 0.25 * n);
  metal *= 1. - (fbm(vec2(uv.x, uv.y), vec2(50., 2.), 3) * 0.5 + 0.5) * 0.15;
  vec3 rust = mix(toLin(vec3(0.32, 0.14, 0.06)), toLin(vec3(0.60, 0.30, 0.12)), fbm(uv + 0.5, vec2(20.), 4) * 0.5 + 0.5);
  vec3 c = mix(metal, rust, m);
  // bake rib shading into the albedo so the profile still reads under flat lighting
  float rib = sin(uv.x * 12. * 6.2831853);
  c *= 0.8 + 0.2 * (rib * 0.5 + 0.5);
  c *= 1. - 0.25 * pow(max(-rib, 0.), 6.);
  // dark run-off streaks under each fold
  c *= 1. - smoothstep(0.55, 0.95, fbm(uv, vec2(96., 1.), 4) * 0.5 + 0.5) * 0.3 * m;
  return vec4(c, 1.);
}`, ow = ew + `
vec4 texMain(vec2 uv){
  float m = rustMask(uv);
  return vec4(1., mix(0.45, 0.92, m), mix(0.75, 0.05, m), 1.);
}`, sw = `
float concH(vec2 uv){
  float h = fbm(uv, vec2(6.), 6) * 0.3 + 0.5;
  vec3 v = voronoi(uv, vec2(90.));
  h -= (1. - smoothstep(0.0, 0.12, v.x)) * 0.25 * step(0.6, v.z);
  vec3 cv = voronoi(uv + fbm(uv, vec2(4.), 3) * 0.02, vec2(3.));
  h -= (1. - smoothstep(0.0, 0.015, cv.y - cv.x)) * 0.6 * step(0.5, fbm(uv + 0.2, vec2(2.), 3) * 0.5 + 0.5);
  return h;
}`, eN = sw + `
vec4 texMain(vec2 uv){
  float h = concH(uv);
  vec3 c = toLin(vec3(0.62, 0.60, 0.56));
  float st = fbm(uv + 0.4, vec2(3.), 6) * 0.5 + 0.5;
  c *= 0.78 + 0.3 * st;
  c = mix(c, toLin(vec3(0.55, 0.48, 0.40)), smoothstep(0.6, 0.9, fbm(uv + 0.8, vec2(2.), 4) * 0.5 + 0.5) * 0.5);
  c *= 0.75 + 0.5 * clamp(h, 0., 1.) * 0.5 + 0.25;
  return vec4(c, 1.);
}`, sN = sw + "vec4 texMain(vec2 uv){ return vec4(concH(uv), 0., 0., 1.); }", aN = `
vec4 texMain(vec2 uv){
  float a = fbm(uv, vec2(5.), 7) * 0.5 + 0.5;
  float b = fbm(uv + 0.3, vec2(24.), 4) * 0.5 + 0.5;
  vec3 v = voronoi(uv, vec2(40.));
  vec3 c = mix(toLin(vec3(0.22, 0.10, 0.05)), toLin(vec3(0.58, 0.29, 0.12)), smoothstep(0.2, 0.8, a));
  c = mix(c, toLin(vec3(0.70, 0.42, 0.20)), smoothstep(0.65, 0.9, b) * 0.6);
  c *= 1. - (1. - smoothstep(0.0, 0.2, v.x)) * 0.5 * step(0.7, v.z);
  return vec4(c, 1.);
}`, nN = `
vec4 texMain(vec2 uv){
  float h = fbm(uv, vec2(5.), 7) * 0.4 + fbm(uv, vec2(40.), 3) * 0.2;
  vec3 v = voronoi(uv, vec2(40.));
  h -= (1. - smoothstep(0.0, 0.2, v.x)) * 0.3 * step(0.7, v.z);
  return vec4(h, 0., 0., 1.);
}`, rN = `
vec4 texMain(vec2 uv){
  float blot = fbm(uv, vec2(3.), 7) * 0.5 + 0.5;
  blot = blot * 0.8 + (fbm(uv + 0.5, vec2(16.), 4) * 0.5 + 0.5) * 0.2;
  float sc = 0.;
  for (int k = 0; k < 3; k++){
    float fk = float(k);
    vec2 q = k == 0 ? vec2(uv.x, uv.y) : (k == 1 ? vec2(uv.y, uv.x) : vec2(uv.x + uv.y, uv.x - uv.y));
    float n = gnoise(q * vec2(3., 60.) + fk * 13., vec2(3., 60.));
    float mask = smoothstep(0.55, 0.8, fbm(uv + fk * 0.37, vec2(4.), 3) * 0.5 + 0.5);
    sc = max(sc, (1. - smoothstep(0.0, 0.035, abs(n))) * mask);
  }
  float dirt = fbm(uv + 0.77, vec2(6.), 5) * 0.5 + 0.5;
  float speck = hash12(floor(uv * uRes) + 3.3);
  return vec4(blot, sc, dirt, speck);
}`, hN = `
float rockH(vec2 uv){
  float h = fbm(uv, vec2(4.), 7) * 0.5;
  float lay = sin((uv.y * 22. + fbm(uv, vec2(3., 2.), 4) * 2.) * 6.2831853);
  h += lay * 0.08 + (fbm(vec2(uv.x, uv.y), vec2(3., 40.), 4)) * 0.12;
  vec3 cv = voronoi(uv + fbm(uv, vec2(5.), 3) * 0.03, vec2(6.));
  h -= (1. - smoothstep(0.0, 0.03, cv.y - cv.x)) * 0.35;
  return h;
}
vec4 texMain(vec2 uv){ return vec4(rockH(uv), 0., 0., 1.); }`, DN = `
uniform sampler2D uH;
vec4 texMain(vec2 uv){
  float h = texture2D(uH, uv).r;
  float n = fbm(uv + 0.5, vec2(9.), 5) * 0.5 + 0.5;
  float v = 0.78 + 0.34 * n + h * 0.25;
  vec3 c = vec3(v) * mix(vec3(1.0), vec3(1.06, 0.97, 0.9), fbm(uv + 0.2, vec2(3.), 4) * 0.5 + 0.5);
  float sp = hash12(floor(uv * uRes * 0.5) + 2.2);
  if (sp > 0.97) c *= 0.75;
  return vec4(c, 1.);
}`, cN = `
uniform float uMode;
vec4 texMain(vec2 uv){
  float N = 64.;
  float wx = sin(uv.x * N * 6.2831853), wy = sin(uv.y * N * 6.2831853);
  float check = step(0., sin(uv.x * N * 3.14159265) * sin(uv.y * N * 3.14159265));
  float thread = mix(abs(wx), abs(wy), check);
  float n = fbm(uv, vec2(16.), 4) * 0.5 + 0.5;
  float v = 0.75 + 0.2 * thread + 0.1 * n;
  float hs = hash12(floor(uv * uRes));
  v *= 0.94 + 0.06 * hs;
  return vec4(vec3(v), thread * 0.6 + n * 0.3);
}`, lN = `
vec4 texMain(vec2 uv){
  vec3 v = voronoi(uv, vec2(150.));
  float h = smoothstep(0.0, 0.45, v.x) * 0.35 + fbm(uv, vec2(8.), 3) * 0.12;
  return vec4(h, 0., 0., 1.);
}`, SN = `
vec4 texMain(vec2 uv){
  float n = fbm(uv, vec2(64.), 3) * 0.5 + 0.5;
  float h = hash12(floor(uv * uRes) + 1.);
  float v = 0.7 + 0.25 * n + 0.12 * h;
  return vec4(vec3(v), 1.);
}`, aw = `
// v across the tyre profile (see wheelGeometry): 0..0.3 inner sidewall, 0.3..0.7 tread, 0.7..1 outer sidewall
float inTread(float v){ return step(0.3, v) * step(v, 0.7); }
float treadH(vec2 uv){
  // u: around circumference (8 blocks per tile)
  float v = (uv.y - 0.3) / 0.4;
  float groove = 0.;
  for (int i = 1; i <= 3; i++){ float gc = float(i) * 0.25; groove = max(groove, 1. - smoothstep(0.018, 0.03, abs(v - gc))); }
  float lat = fract(uv.x * 8. + (v > 0.5 ? 0.5 : 0.) + abs(v - 0.5) * 0.8);
  float sipe = 1. - smoothstep(0.03, 0.06, abs(lat - 0.5));
  sipe *= step(0.04, v) * step(v, 0.96);
  float tread = 0.25 + 0.75 * (1. - max(groove, sipe * 0.9));
  // sidewall: smooth rubber, a raised rim-protector ring and fine ribs near the bead
  float s = uv.y < 0.5 ? uv.y / 0.3 : (1. - uv.y) / 0.3;
  float ring = 1. - smoothstep(0.0, 0.05, abs(s - 0.3));
  float ribs = (sin(uv.x * 6.2831853 * 96.) * 0.5 + 0.5) * (1. - smoothstep(0.06, 0.16, s));
  float side = 0.5 + ring * 0.1 + ribs * 0.04;
  return mix(side, tread, inTread(uv.y)) + fbm(uv, vec2(8., 2.), 3) * 0.02;
}`, wN = aw + `
vec4 texMain(vec2 uv){
  float h = treadH(uv);
  float t = inTread(uv.y);
  vec3 rubber = toLin(vec3(0.078, 0.076, 0.073)) * (0.88 + 0.24 * (fbm(uv, vec2(16., 4.), 3) * 0.5 + 0.5));
  // scuffed block tops, desert dust packed into the grooves and a light film on the sidewalls
  vec3 c = mix(rubber, toLin(vec3(0.125, 0.12, 0.115)), t * smoothstep(0.8, 1.0, h) * 0.5);
  float dust = t * (1. - smoothstep(0.3, 0.55, h)) * 0.6 + (1. - t) * 0.12 * (fbm(uv + 0.3, vec2(8., 2.), 3) * 0.5 + 0.5);
  c = mix(c, toLin(vec3(0.50, 0.42, 0.32)), dust);
  return vec4(c, 1.);
}`, yN = aw + "vec4 texMain(vec2 uv){ return vec4(treadH(uv), 0., 0., 1.); }", nw = `
float cactH(vec2 uv){
  float r = 1. - abs(fract(uv.x * 14.) - 0.5) * 2.;
  float h = pow(r, 0.8);
  float ar = fract(uv.y * 40.);
  vec2 d = vec2((fract(uv.x * 14.) - 0.5) * 0.9, ar - 0.5);
  float spot = 1. - smoothstep(0.05, 0.14, length(d));
  return h + spot * 0.15;
}`, kN = nw + `
vec4 texMain(vec2 uv){
  float r = 1. - abs(fract(uv.x * 14.) - 0.5) * 2.;
  vec3 c = mix(toLin(vec3(0.20, 0.30, 0.14)), toLin(vec3(0.36, 0.48, 0.24)), smoothstep(0.1, 0.9, r));
  c *= 0.88 + 0.2 * (fbm(uv, vec2(3., 6.), 4) * 0.5 + 0.5);
  float ar = fract(uv.y * 40.);
  vec2 d = vec2((fract(uv.x * 14.) - 0.5) * 0.9, ar - 0.5);
  float spot = 1. - smoothstep(0.04, 0.09, length(d));
  c = mix(c, toLin(vec3(0.78, 0.72, 0.58)), spot * 0.9);
  float scar = smoothstep(0.7, 0.85, fbm(uv + 0.4, vec2(4., 8.), 4) * 0.5 + 0.5);
  c = mix(c, toLin(vec3(0.45, 0.40, 0.28)), scar * 0.5);
  return vec4(c, 1.);
}`, MN = nw + "vec4 texMain(vec2 uv){ return vec4(cactH(uv), 0., 0., 1.); }", UN = `
vec4 texMain(vec2 uv){
  vec2 p = uv * 2. - 1.;
  float r = length(p);
  float n = fbm(uv, vec2(4.), 5) * 0.5 + 0.5;
  float a = smoothstep(1.0, 0.2, r + (n - 0.5) * 0.5);
  a *= 0.6 + 0.4 * n;
  return vec4(vec3(0.85 + 0.15 * n), a);
}`, KN = `
vec4 texMain(vec2 uv){
  float d = fbm(uv, vec2(4.), 6) * 0.5 + 0.5;
  vec3 v = voronoi(uv, vec2(60.));
  float spots = (1. - smoothstep(0.05, 0.25, v.x)) * step(0.75, v.z);
  float streak = fbm(vec2(uv.x, uv.y), vec2(40., 3.), 4) * 0.5 + 0.5;
  float a = smoothstep(0.35, 0.85, d) * 0.55 + spots * 0.35 + smoothstep(0.6, 0.9, streak) * 0.2;
  return vec4(toLin(vec3(0.78, 0.66, 0.5)), clamp(a, 0., 1.));
}`, GN = `
vec4 texMain(vec2 uv){
  float s = gnoise(vec2(uv.x * 160., uv.y * 12.), vec2(160., 12.)) * 0.5 + 0.5;
  float s2 = gnoise(vec2(uv.x * 320. + 3., uv.y * 20.), vec2(320., 20.)) * 0.5 + 0.5;
  return vec4(s * 0.6 + s2 * 0.4, 0., 0., 1.);
}`, FN = `
uniform sampler2D uH;
vec4 texMain(vec2 uv){
  float h = texture2D(uH, uv).r;
  float patchv = fbm(uv, vec2(3.), 4) * 0.5 + 0.5;
  vec3 c = mix(toLin(vec3(0.30, 0.25, 0.20)), toLin(vec3(0.58, 0.50, 0.42)), h * 0.7 + patchv * 0.3);
  return vec4(c, 1.);
}`, pN = `
vec4 texMain(vec2 uv){
  float s = fbm(vec2(uv.x, uv.y), vec2(12., 1.), 6);
  float cr = 1. - smoothstep(0.0, 0.06, abs(gnoise(vec2(uv.x * 10., uv.y * 1.5), vec2(10., 1.5)) ));
  return vec4(0.5 + s * 0.4 - cr * 0.4, 0., 0., 1.);
}`, JN = `
uniform sampler2D uH;
vec4 texMain(vec2 uv){
  float h = texture2D(uH, uv).r;
  vec3 c = mix(toLin(vec3(0.16, 0.12, 0.09)), toLin(vec3(0.42, 0.36, 0.30)), clamp(h, 0., 1.));
  c = mix(c, toLin(vec3(0.5, 0.48, 0.44)), smoothstep(0.55, 0.8, fbm(uv + 0.3, vec2(2., 3.), 4) * 0.5 + 0.5) * 0.4);
  return vec4(c, 1.);
}`, NN = `
vec4 texMain(vec2 uv){
  float n = fbm(uv, vec2(8.), 5) * 0.3 + fbm(uv, vec2(64.), 3) * 0.15;
  vec3 v = voronoi(uv, vec2(30.));
  n -= (1. - smoothstep(0.0, 0.15, v.x)) * 0.15 * step(0.8, v.z);
  return vec4(0.5 + n, 0., 0., 1.);
}`, dN = `
uniform sampler2D uH;
vec4 texMain(vec2 uv){
  float h = texture2D(uH, uv).r;
  float g = fbm(uv + 0.1, vec2(5.), 5) * 0.5 + 0.5;
  vec3 c = vec3(0.7 + 0.3 * g) * (0.85 + 0.3 * (h - 0.5));
  return vec4(c, 1.);
}`, RN = `
vec4 texMain(vec2 uv){
  // vertical grass blades on a transparent card
  float a = 0.;
  vec3 col = vec3(0.);
  for (int i = 0; i < 44; i++){
    float fi = float(i);
    float x0 = 0.12 + 0.76 * hash12(vec2(fi, 1.) + uSeed);
    float hgt = 0.4 + 0.6 * hash12(vec2(fi, 2.) + uSeed);
    float bend = (hash12(vec2(fi, 3.) + uSeed) - 0.5) * 0.7 + (x0 - 0.5) * 0.5;
    float t = uv.y / hgt;
    if (t > 1.) continue;
    float x = x0 + bend * t * t;
    float w = 0.022 * (1. - t * 0.85) + 0.003;
    float d = abs(uv.x - x);
    float m = 1. - smoothstep(w * 0.6, w, d);
    if (m > a) {
      a = m;
      vec3 base = mix(toLin(vec3(0.55, 0.42, 0.22)), toLin(vec3(0.86, 0.72, 0.42)), hash12(vec2(fi, 4.) + uSeed));
      col = base * (0.5 + 0.65 * t);
    }
  }
  return vec4(col, a);
}`, uN = `
vec4 texMain(vec2 uv){
  float n = fbm(uv, vec2(6.), 5) * 0.5 + 0.5;
  float fl = sin(uv.y * 180.) * 0.5 + 0.5;
  vec3 c = toLin(vec3(0.62, 0.47, 0.30)) * (0.85 + 0.2 * n) * (0.97 + 0.03 * fl);
  float stain = smoothstep(0.62, 0.8, fbm(uv + 0.6, vec2(3.), 4) * 0.5 + 0.5);
  c *= 1. - stain * 0.25;
  return vec4(c, 1.);
}`, fN = `
vec4 texMain(vec2 uv){
  return vec4(fbm(uv, vec2(4.), 6) * 0.5 + 0.5, fbm(uv + 0.3, vec2(16.), 5) * 0.5 + 0.5, vnoise(uv * 64., vec2(64.)), hash12(floor(uv * uRes)));
}`;
function rw(B, A) {
  let I = new Kn(B), g = A >= 2 ? 1024 : 512, C = A >= 2 ? 512 : 256, Q = (F) => new nA(F).getRGB({ r: 0, g: 0, b: 0 }, mg), i = (F) => new y(F.r, F.g, F.b), E = I.run(IN, { width: g, float: true, seed: 3 }), t = I.normalFrom(E, 9, g), o = I.run(gN, { width: g, srgb: true, uniforms: { uH: { value: E } }, seed: 4 }), e = I.run(CN, { width: 512, seed: 5 }), s = I.run(BN, { width: C, height: g, srgb: true, seed: 6 }), a = I.run(QN, { width: C, height: g, float: true, seed: 6 }), n = I.normalFrom(a, 3.5, C, g, 6), r = I.run(iN, { width: C, height: g, seed: 6 }), c = (F, Z, z, iA) => ({ uDark: { value: i(Q(F)) }, uMid: { value: i(Q(Z)) }, uGrey: { value: i(Q(z)) }, uWeather: { value: iA } }), h = I.run(Ew, { width: g, srgb: true, seed: 8, uniforms: c("#44301f", "#7e5d3c", "#8a7c6a", 0.45) }), D = I.run(Ew, { width: g, srgb: true, seed: 8, uniforms: c("#7a5a38", "#b58a58", "#a89478", 0.15) }), l = I.run(EN, { width: g, float: true, seed: 8 }), U = I.normalFrom(l, 6, g), S = I.run(tN, { width: C, seed: 8 }), k = I.run(oN, { width: C, float: true, seed: 9 }), K = I.normalFrom(k, 3, C), G = I.run(tw, { width: C, srgb: true, seed: 9, uniforms: { uRust: { value: 0.25 } } }), M = I.run(tw, { width: C, srgb: true, seed: 10, uniforms: { uRust: { value: 0.85 } } }), p = I.run(ow, { width: C, seed: 9, uniforms: { uRust: { value: 0.25 } } }), d = I.run(ow, { width: C, seed: 10, uniforms: { uRust: { value: 0.85 } } }), R = I.run(eN, { width: g, srgb: true, seed: 11 }), u = I.run(sN, { width: g, float: true, seed: 11 }), q = I.normalFrom(u, 4, g), L = I.run(aN, { width: C, srgb: true, seed: 12 }), b = I.run(nN, { width: C, float: true, seed: 12 }), W = I.normalFrom(b, 5, C), j = I.run(rN, { width: g, seed: 13 }), oA = I.run(hN, { width: g, float: true, seed: 14 }), H = I.normalFrom(oA, 5, g), O = I.run(DN, { width: g, uniforms: { uH: { value: oA } }, seed: 14 }), IA = I.run(cN, { width: 256, seed: 15, uniforms: { uMode: { value: 0 } } }), _ = I.run("uniform sampler2D uF; vec4 texMain(vec2 uv){ return vec4(texture2D(uF, uv).a, 0., 0., 1.); }", { width: 256, float: true, uniforms: { uF: { value: IA } } }), gA = I.normalFrom(_, 2.5, 256), DA = I.run(lN, { width: 512, float: true, seed: 16 }), dA = I.normalFrom(DA, 2, 512), zA = I.run(SN, { width: 256, seed: 17 }), X = I.run(wN, { width: 512, height: 256, srgb: true, seed: 18 }), BA = I.run(yN, { width: 512, height: 256, float: true, seed: 18 }), tA = I.normalFrom(BA, 6, 512, 256), MA = I.run(kN, { width: 256, height: 512, srgb: true, seed: 19 }), KA = I.run(MN, { width: 256, height: 512, float: true, seed: 19 }), LA = I.normalFrom(KA, 5, 256, 512), hI = I.run(UN, { width: 128, seed: 20, wrap: false }), sA = I.run(KN, { width: 512, seed: 21 }), lA = I.run(GN, { width: 256, float: true, seed: 22 }), SA = I.normalFrom(lA, 3, 256), wA = I.run(FN, { width: 256, srgb: true, uniforms: { uH: { value: lA } }, seed: 22 }), JA = I.run(pN, { width: 256, height: 512, float: true, seed: 23 }), GA = I.normalFrom(JA, 4, 256, 512), pA = I.run(JN, { width: 256, height: 512, srgb: true, uniforms: { uH: { value: JA } }, seed: 23 }), vA = I.run(NN, { width: 256, float: true, seed: 24 }), II = I.normalFrom(vA, 2, 256), T = I.run(dN, { width: 256, uniforms: { uH: { value: vA } }, seed: 24 }), RI = I.run(RN, { width: 256, srgb: true, seed: 25, wrap: false }), UI = I.run(uN, { width: 256, srgb: true, seed: 26 }), f = I.run(fN, { width: 256, seed: 27 });
  return { sandAlbedo: o, sandNormal: t, sandMacro: e, asphaltAlbedo: s, asphaltNormal: n, asphaltORM: r, planksDark: h, planksLight: D, planksNormal: U, planksRough: S, corrugated: G, corrugatedRust: M, corrugatedNormal: K, corrugatedORM: p, corrugatedRustORM: d, concrete: R, concreteNormal: q, rust: L, rustNormal: W, wear: j, rockDetail: O, rockNormal: H, fabric: IA, fabricNormal: gA, vinylNormal: dA, carpet: zA, tread: X, treadNormal: tA, cactus: MA, cactusNormal: LA, puff: hI, glassDirt: sA, fur: wA, furNormal: SA, bark: pA, barkNormal: GA, metalDark: T, metalNormal: II, grass: RI, cardboard: UI, noise: f };
}
var hw = 64, Dw = 6, YN = hw * (1 << Dw - 1), $C = 32, LN = 1.75, kB = { uOriginMod: { value: new eA() }, uWindDir: { value: new eA(0.94, 0.34) }, uTime: { value: 0 } }, mN = `
uniform sampler2D uSandA;
uniform sampler2D uSandN;
uniform sampler2D uSandMacro;
uniform vec2 uWindDir;
varying vec3 vTPos;
varying vec3 vTNrm;
vec3 sandAlbedo(vec2 wp, float dist, vec3 nW){
  vec4 mac = texture2D(uSandMacro, wp / 1024.0);
  vec4 mac2 = texture2D(uSandMacro, wp / 173.0 + vec2(0.37, 0.61));
  vec3 d1 = texture2D(uSandA, wp / 5.0).rgb;
  vec3 d2 = texture2D(uSandA, wp / 29.0 + 0.5).rgb;
  float farT = smoothstep(12.0, 140.0, dist);
  vec3 c = mix(d1, (d1 + d2) * 0.5, 0.3 + 0.45 * farT);
  c *= mix(vec3(1.0), vec3(1.07, 0.92, 0.82), smoothstep(0.35, 0.75, mac.r) * 0.85);
  c *= mix(vec3(1.0), vec3(1.03, 1.02, 0.99), smoothstep(0.5, 0.8, mac.g) * 0.7);
  c *= mix(vec3(1.0), vec3(0.84, 0.78, 0.72), smoothstep(0.58, 0.86, mac2.b) * 0.45);
  c *= 0.93 + 0.14 * mac2.a;
  float slope = 1.0 - nW.y;
  c *= 1.0 - smoothstep(0.08, 0.45, slope) * 0.1;
  return c;
}
vec3 sandNormalW(vec2 wp, float dist, vec3 nW){
  float fade = 1.0 - smoothstep(20.0, 120.0, dist);
  vec2 a = uWindDir;
  vec2 b = vec2(a.x * 0.95 - a.y * 0.31, a.x * 0.31 + a.y * 0.95);
  vec4 mac = texture2D(uSandMacro, wp / 1024.0 + vec2(0.13, 0.71));
  vec2 uv1 = vec2(dot(wp, a), dot(wp, vec2(-a.y, a.x))) / 3.4;
  vec2 uv2 = vec2(dot(wp, b), dot(wp, vec2(-b.y, b.x))) / 10.5;
  vec3 n1 = texture2D(uSandN, uv1).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uSandN, uv2).xyz * 2.0 - 1.0;
  float ripAmt = 0.35 + 0.65 * smoothstep(0.3, 0.7, mac.b);
  vec3 Tu1 = vec3(a.x, 0.0, a.y), Tv1 = vec3(-a.y, 0.0, a.x);
  vec3 Tu2 = vec3(b.x, 0.0, b.y), Tv2 = vec3(-b.y, 0.0, b.x);
  vec3 p = (Tu1 * n1.x + Tv1 * n1.y) * fade * ripAmt + (Tu2 * n2.x + Tv2 * n2.y) * (0.35 + 0.4 * fade);
  p -= nW * dot(p, nW);
  return normalize(nW + p * 0.9);
}
`;
function cw(B) {
  let A = new oI({ color: 16777215, roughness: 0.96, metalness: 0 });
  return A.onBeforeCompile = (I) => {
    I.uniforms.uSandA = { value: B.sandAlbedo }, I.uniforms.uSandN = { value: B.sandNormal }, I.uniforms.uSandMacro = { value: B.sandMacro }, I.uniforms.uOriginMod = kB.uOriginMod, I.uniforms.uWindDir = kB.uWindDir, I.vertexShader = I.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vTPos;
varying vec3 vTNrm;
uniform vec2 uOriginMod;`).replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
 vec4 tWorld = modelMatrix * vec4(transformed, 1.0);
 vTPos = tWorld.xyz + vec3(uOriginMod.x, 0.0, uOriginMod.y);
 vTNrm = normalize(mat3(modelMatrix) * objectNormal);`), I.fragmentShader = I.fragmentShader.replace("#include <common>", `#include <common>
` + mN).replace("#include <map_fragment>", `float tDist = length(vViewPosition);
 vec3 tNW = normalize(vTNrm);
 diffuseColor.rgb *= sandAlbedo(vTPos.xz, tDist, tNW);`).replace("#include <normal_fragment_maps>", `vec3 tN = sandNormalW(vTPos.xz, tDist, tNW);
 normal = normalize((viewMatrix * vec4(tN, 0.0)).xyz);`);
  }, A;
}
var Gn = null;
function qN() {
  if (Gn) return Gn;
  let B = $C + 1, A = [];
  for (let C = 0; C < $C; C++) for (let Q = 0; Q < $C; Q++) {
    let i = C * B + Q, E = i + 1, t = i + B, o = t + 1;
    A.push(i, t, E, E, t, o);
  }
  let I = B * B, g = (C, Q) => I + Q * B + C;
  for (let C = 0; C < $C; C++) {
    let Q = C, i = C + 1;
    A.push(Q, i, g(C, 0), i, g(C + 1, 0), g(C, 0));
    let E = $C * B + C, t = E + 1;
    A.push(E, g(C, 1), t, t, g(C, 1), g(C + 1, 1));
    let o = C * B, e = (C + 1) * B;
    A.push(o, g(C, 2), e, e, g(C, 2), g(C + 1, 2));
    let s = C * B + $C, a = (C + 1) * B + $C;
    A.push(s, a, g(C, 3), a, g(C + 1, 3), g(C, 3));
  }
  return Gn = new GI(new Uint16Array(A), 1), Gn;
}
function HN(B, A, I, g) {
  let C = $C + 1, Q = $C + 3, i = g / $C, E = new Float32Array(Q * Q);
  for (let D = 0; D < Q; D++) for (let l = 0; l < Q; l++) E[D * Q + l] = B.height(A + (l - 1) * i, I + (D - 1) * i);
  let t = C * C + 4 * C, o = new Float32Array(t * 3), e = new Float32Array(t * 3), s = 1 / 0, a = -1 / 0;
  for (let D = 0; D < C; D++) for (let l = 0; l < C; l++) {
    let U = E[(D + 1) * Q + (l + 1)], S = (D * C + l) * 3;
    o[S] = l * i, o[S + 1] = U, o[S + 2] = D * i;
    let k = E[(D + 1) * Q + l + 2] - E[(D + 1) * Q + l], K = E[(D + 2) * Q + l + 1] - E[D * Q + l + 1], G = -k, M = 2 * i, p = -K, d = Math.hypot(G, M, p);
    e[S] = G / d, e[S + 1] = M / d, e[S + 2] = p / d, U < s && (s = U), U > a && (a = U);
  }
  let n = i * 1.5 + 1.5, r = C * C, c = (D, l) => D === 0 ? l : D === 1 ? $C * C + l : D === 2 ? l * C : l * C + $C;
  for (let D = 0; D < 4; D++) for (let l = 0; l < C; l++) {
    let U = c(D, l) * 3, S = (r + D * C + l) * 3;
    o[S] = o[U], o[S + 1] = o[U + 1] - n, o[S + 2] = o[U + 2], e[S] = e[U], e[S + 1] = e[U + 1], e[S + 2] = e[U + 2];
  }
  let h = new SI();
  return h.setAttribute("position", new GI(o, 3)), h.setAttribute("normal", new GI(e, 3)), h.setIndex(qN()), h.boundingBox = new Jg(new y(0, s - n, 0), new y(g, a, g)), h.boundingSphere = h.boundingBox.getBoundingSphere(new FC()), { geo: h, minY: s, maxY: a };
}
var Fn = class {
  constructor(A, I) {
    this.fn = A;
    this.material = I;
    this.group.name = "terrain";
  }
  fn;
  material;
  group = new WA();
  cache = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  frame = 0;
  visibleKeys = /* @__PURE__ */ new Set();
  viewRadius = 4200;
  maxCache = 700;
  originX = 0;
  originZ = 0;
  key(A, I, g) {
    return A + ":" + I + ":" + g;
  }
  sizeOf(A) {
    return hw * (1 << A);
  }
  build(A, I, g) {
    let C = this.sizeOf(A), Q = I * C, i = g * C, { geo: E, minY: t, maxY: o } = HN(this.fn, Q, i, C), e = new cA(E, this.material);
    e.receiveShadow = true, e.castShadow = false, e.matrixAutoUpdate = false, e.position.set(Q - this.originX, 0, i - this.originZ), e.updateMatrix(), e.visible = false, this.group.add(e);
    let s = { mesh: e, x0: Q, z0: i, size: C, lastUsed: this.frame, minY: t, maxY: o };
    return this.cache.set(this.key(A, I, g), s), s;
  }
  setOrigin(A, I) {
    this.originX = A, this.originZ = I;
    for (let g of this.cache.values()) g.mesh.position.set(g.x0 - A, 0, g.z0 - I), g.mesh.updateMatrix();
  }
  request(A, I, g, C) {
    let Q = this.key(A, I, g);
    if (this.cache.has(Q)) return;
    let i = this.pending.get(Q);
    i ? i.prio = Math.min(i.prio, C) : this.pending.set(Q, { level: A, ix: I, iz: g, prio: C });
  }
  update(A, I, g, C, Q = false) {
    this.frame++;
    let i = /* @__PURE__ */ new Set(), E = Dw - 1, t = YN, o = this.viewRadius, e = Math.floor((A - o) / t), s = Math.floor((A + o) / t), a = Math.floor((g - o) / t), n = Math.floor((g + o) / t), r = (c, h, D) => {
      let l = this.sizeOf(c), U = h * l, S = D * l, k = Math.max(U - A, 0, A - (U + l)), K = Math.max(S - g, 0, g - (S + l)), G = this.cache.get(this.key(c, h, D)), M = G ? Math.max(0, I - G.maxY - 20) : 0, p = Math.hypot(k, K, M);
      if (c === E && p > o) return;
      if (c > 0 && p < l * LN) {
        let R = c - 1, u = true;
        for (let q = 0; q < 4; q++) {
          let L = h * 2 + (q & 1), b = D * 2 + (q >> 1);
          this.cache.has(this.key(R, L, b)) || (u = false, this.request(R, L, b, p / l + c));
        }
        if ((u || !G) && u) {
          for (let q = 0; q < 4; q++) r(R, h * 2 + (q & 1), D * 2 + (q >> 1));
          return;
        }
      }
      G ? (i.add(this.key(c, h, D)), G.lastUsed = this.frame) : this.request(c, h, D, -10 + p / l);
    };
    for (let c = a; c <= n; c++) for (let h = e; h <= s; h++) r(E, h, c);
    if (this.pending.size) {
      let c = [...this.pending.values()].sort((D, l) => D.prio - l.prio), h = performance.now();
      for (let D of c) {
        if (!Q && performance.now() - h > C) break;
        this.pending.delete(this.key(D.level, D.ix, D.iz)), this.build(D.level, D.ix, D.iz);
      }
      if (Q && this.pending.size) return this.update(A, I, g, C, true);
    }
    for (let c of this.visibleKeys) if (!i.has(c)) {
      let h = this.cache.get(c);
      h && (h.mesh.visible = false);
    }
    for (let c of i) {
      let h = this.cache.get(c);
      h && (h.mesh.visible = true);
    }
    if (this.visibleKeys = i, this.cache.size > this.maxCache) {
      let c = [...this.cache.entries()].filter(([D]) => !i.has(D)).sort((D, l) => D[1].lastUsed - l[1].lastUsed), h = this.cache.size - this.maxCache;
      for (let D = 0; D < h && D < c.length; D++) {
        let [l, U] = c[D];
        this.group.remove(U.mesh), U.mesh.geometry.dispose(), this.cache.delete(l);
      }
    }
  }
  get pendingCount() {
    return this.pending.size;
  }
};
var TN = `varying vec3 vWPos;
uniform vec2 uOriginMod;`, bN = `
  vec4 wpX = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    wpX = instanceMatrix * wpX;
  #endif
  wpX = modelMatrix * wpX;
  vWPos = wpX.xyz + vec3(uOriginMod.x, 0.0, uOriginMod.y);`, pn = { uWind: { value: new y(3, 0, 1) }, uTime: kB.uTime };
function xN(B, A) {
  return { tex: B, scale: A };
}
var Jn = class {
  cache = /* @__PURE__ */ new Map();
  tex;
  cactus;
  grass;
  bush;
  rock;
  pole;
  wire;
  woodDark;
  woodLight;
  woodRaw;
  corrugated;
  corrugatedRust;
  concrete;
  dirt;
  rust;
  chrome;
  rubber;
  tire;
  glass;
  glassDirty;
  plasticBlack;
  metalDark;
  metalBare;
  carpet;
  deadWood;
  ceramic;
  black;
  cardboard;
  constructor(A) {
    this.tex = A;
    let I = (g) => new oI(g);
    this.cactus = I({ map: A.cactus, normalMap: A.cactusNormal, roughness: 0.75, color: 16777215 }), this.cactus.normalScale.set(1.2, 1.2), this.grass = I({ map: A.grass, alphaTest: 0.32, alphaToCoverage: true, side: OI, roughness: 0.9 }), this.addWind(this.grass, 0.18), this.bush = I({ vertexColors: true, roughness: 0.95, map: A.bark, color: 16777215 }), this.addWind(this.bush, 0.05), this.rock = I({ vertexColors: true, roughness: 0.92, color: 16777215 }), this.addTriplanar(this.rock, xN(A.rockDetail, 8), A.rockNormal, 1), this.pole = I({ map: A.bark, normalMap: A.barkNormal, roughness: 0.9, color: 10127478 }), this.wire = I({ color: 1710618, roughness: 0.6, metalness: 0.4 }), this.woodDark = I({ map: A.planksDark, normalMap: A.planksNormal, roughnessMap: A.planksRough, roughness: 1 }), this.woodLight = I({ map: A.planksLight, normalMap: A.planksNormal, roughnessMap: A.planksRough, roughness: 1 }), this.woodRaw = I({ map: A.planksLight, normalMap: A.planksNormal, roughness: 0.85, color: 14205088 }), this.corrugated = I({ map: A.corrugated, normalMap: A.corrugatedNormal, roughnessMap: A.corrugatedORM, metalnessMap: A.corrugatedORM, roughness: 1, metalness: 1 }), this.corrugatedRust = I({ map: A.corrugatedRust, normalMap: A.corrugatedNormal, roughnessMap: A.corrugatedRustORM, metalnessMap: A.corrugatedRustORM, roughness: 1, metalness: 1 }), this.concrete = I({ map: A.concrete, normalMap: A.concreteNormal, roughness: 0.93 }), this.dirt = I({ map: A.sandAlbedo, normalMap: A.sandNormal, color: 13218707, roughness: 1 }), this.dirt.normalScale.set(0.7, 0.7), this.rust = I({ map: A.rust, normalMap: A.rustNormal, roughness: 0.9, metalness: 0.25 }), this.chrome = I({ color: 15263976, roughness: 0.12, metalness: 1 }), this.rubber = I({ color: 1381653, roughness: 0.85 }), this.tire = I({ map: A.tread, normalMap: A.treadNormal, roughness: 0.88 }), this.glass = new rQ({ color: 12110018, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.3, depthWrite: false, envMapIntensity: 1.4, side: OI }), this.glass.onBeforeCompile = (g) => {
      g.fragmentShader = g.fragmentShader.replace("#include <opaque_fragment>", `{ float ndv = abs(dot(normal, normalize(-vViewPosition)));
           diffuseColor.a = mix(diffuseColor.a, 0.62, pow(1.0 - ndv, 3.0)); }
        #include <opaque_fragment>`);
    }, this.glass.customProgramCacheKey = () => "glassFresnel", this.glassDirty = I({ color: 16777215, map: A.glassDirt, transparent: true, roughness: 0.6, depthWrite: false, side: OI, opacity: 0.9 }), this.plasticBlack = I({ color: 1776412, roughness: 0.55, normalMap: A.vinylNormal, normalScale: new eA(0.4, 0.4) }), this.metalDark = I({ map: A.metalDark, normalMap: A.metalNormal, color: 5593180, roughness: 0.55, metalness: 0.7 }), this.metalBare = I({ map: A.metalDark, normalMap: A.metalNormal, color: 10132898, roughness: 0.4, metalness: 0.85 }), this.carpet = I({ map: A.carpet, color: 3814448, roughness: 1 }), this.deadWood = I({ map: A.bark, normalMap: A.barkNormal, color: 12103070, roughness: 0.95 }), this.ceramic = I({ color: 8034950, roughness: 0.25, metalness: 0 }), this.black = I({ color: 328965, roughness: 0.9 }), this.cardboard = I({ map: A.cardboard, roughness: 0.95 });
  }
  painted(A, I = 0.3, g = 0.5, C = false) {
    let Q = `painted:${A}:${I.toFixed(2)}:${g}${C ? ":2s" : ""}`, i = this.cache.get(Q);
    return i || (i = new oI({ color: new nA(A), roughness: g, metalness: 0.15, side: C ? OI : WB }), this.addRust(i, I), this.cache.set(Q, i), i);
  }
  flat(A, I = 0.8, g = 0) {
    let C = `flat:${A}:${I}:${g}`, Q = this.cache.get(C);
    return Q || (Q = new oI({ color: new nA(A), roughness: I, metalness: g }), this.cache.set(C, Q)), Q;
  }
  fabric(A) {
    let I = `fabric:${A}`, g = this.cache.get(I);
    return g || (g = new oI({ color: new nA(A), map: this.tex.fabric, normalMap: this.tex.fabricNormal, roughness: 0.95 }), this.cache.set(I, g)), g;
  }
  vinyl(A, I = 0.55) {
    let g = `vinyl:${A}:${I}`, C = this.cache.get(g);
    return C || (C = new oI({ color: new nA(A), normalMap: this.tex.vinylNormal, roughness: I }), C.normalScale.set(0.5, 0.5), this.cache.set(g, C)), C;
  }
  emissive(A, I = 2) {
    let g = `emi:${A}:${I}`, C = this.cache.get(g);
    return C || (C = new oI({ color: 1118481, emissive: new nA(A), emissiveIntensity: I, roughness: 0.4 }), this.cache.set(g, C)), C;
  }
  textured(A, I = 0.7, g, C = {}) {
    let Q = g ? "tex:" + g : null;
    if (Q && this.cache.has(Q)) return this.cache.get(Q);
    let i = new oI({ map: A, roughness: I, ...C });
    return Q && this.cache.set(Q, i), i;
  }
  addRust(A, I, g = 0.35) {
    let C = this.tex;
    A.userData.rust = { value: I }, A.userData.dust = { value: g }, A.onBeforeCompile = (Q) => {
      Q.uniforms.uWear = { value: C.wear }, Q.uniforms.uRustTex = { value: C.rust }, Q.uniforms.uRustAmt = A.userData.rust, Q.uniforms.uDustAmt = A.userData.dust, Q.vertexShader = Q.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vOPos;
varying vec3 vONrm;`).replace("#include <begin_vertex>", `#include <begin_vertex>
 vOPos = position;
 vONrm = normal;`), Q.fragmentShader = Q.fragmentShader.replace("#include <common>", `#include <common>
          varying vec3 vOPos; varying vec3 vONrm;
          uniform sampler2D uWear; uniform sampler2D uRustTex; uniform float uRustAmt; uniform float uDustAmt;
          float rustK = 0.0;
          vec4 triS(sampler2D t, vec3 p, vec3 n, float s){
            vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x + w.y + w.z + 1e-4);
            return texture2D(t, p.zy * s) * w.x + texture2D(t, p.xz * s) * w.y + texture2D(t, p.xy * s) * w.z;
          }`).replace("#include <map_fragment>", `#include <map_fragment>
          {
            vec4 wr = triS(uWear, vOPos, vONrm, 0.7);
            vec4 wr2 = triS(uWear, vOPos + 3.1, vONrm, 2.3);
            float low = 1.0 - smoothstep(0.1, 0.7, vOPos.y + 0.8);
            float m = wr.r * 0.75 + wr2.r * 0.25 + low * 0.18;
            rustK = smoothstep(1.0 - uRustAmt * 0.85, 1.08 - uRustAmt * 0.8, m);
            rustK = max(rustK, wr2.g * uRustAmt * 0.9);
            vec3 rc = triS(uRustTex, vOPos, vONrm, 1.6).rgb;
            diffuseColor.rgb = mix(diffuseColor.rgb, rc, rustK);
            float dustK = uDustAmt * (0.35 + 0.65 * wr.b) * (0.5 + 0.5 * low);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.50, 0.37), clamp(dustK * 0.55, 0.0, 0.8));
          }`).replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
 roughnessFactor = mix(roughnessFactor, 0.92, max(rustK, uDustAmt * 0.3));`).replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>
 metalnessFactor *= 1.0 - rustK;`);
    }, A.customProgramCacheKey = () => "rust";
  }
  addWind(A, I) {
    A.onBeforeCompile = (g) => {
      g.uniforms.uWind = pn.uWind, g.uniforms.uTime = pn.uTime, g.vertexShader = g.vertexShader.replace("#include <common>", `#include <common>
uniform vec3 uWind;
uniform float uTime;`).replace("#include <begin_vertex>", `#include <begin_vertex>
          {
            vec3 ip = vec3(0.0);
            #ifdef USE_INSTANCING
              ip = instanceMatrix[3].xyz;
            #endif
            float hgt = max(position.y, 0.0);
            float ph = uTime * (1.3 + length(uWind) * 0.12) + ip.x * 0.37 + ip.z * 0.23;
            float sway = (sin(ph) * 0.6 + sin(ph * 2.3 + 1.7) * 0.25 + 0.4) * ${I.toFixed(3)} * (0.25 + length(uWind) * 0.12);
            vec2 wd = normalize(uWind.xz + 1e-4);
            transformed.xz += wd * sway * hgt * hgt;
          }`);
    }, A.customProgramCacheKey = () => "wind" + I;
  }
  addTriplanar(A, I, g, C) {
    A.onBeforeCompile = (Q) => {
      Q.uniforms.uTA = { value: I.tex }, Q.uniforms.uTN = { value: g }, Q.uniforms.uOriginMod = kB.uOriginMod, Q.vertexShader = Q.vertexShader.replace("#include <common>", `#include <common>
` + TN).replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
` + bN), Q.fragmentShader = Q.fragmentShader.replace("#include <common>", `#include <common>
          varying vec3 vWPos; uniform sampler2D uTA; uniform sampler2D uTN;
          vec3 triW;`).replace("#include <map_fragment>", `#include <map_fragment>
          vec3 nWg = normalize((vec4(vNormal, 0.0) * viewMatrix).xyz);
          triW = pow(abs(nWg), vec3(4.0)); triW /= (triW.x + triW.y + triW.z);
          float sc = 1.0 / ${I.scale.toFixed(2)};
          vec3 ta = texture2D(uTA, vWPos.zy * sc).rgb * triW.x + texture2D(uTA, vWPos.xz * sc).rgb * triW.y + texture2D(uTA, vWPos.xy * sc).rgb * triW.z;
          vec3 ta2 = texture2D(uTA, vWPos.zy * sc * 0.23).rgb * triW.x + texture2D(uTA, vWPos.xz * sc * 0.23).rgb * triW.y + texture2D(uTA, vWPos.xy * sc * 0.23).rgb * triW.z;
          diffuseColor.rgb *= ta * 0.65 + ta2 * 0.45;`).replace("#include <normal_fragment_maps>", `{
            float sc2 = 1.0 / ${I.scale.toFixed(2)};
            vec3 nx = texture2D(uTN, vWPos.zy * sc2).xyz * 2.0 - 1.0;
            vec3 ny = texture2D(uTN, vWPos.xz * sc2).xyz * 2.0 - 1.0;
            vec3 nz = texture2D(uTN, vWPos.xy * sc2).xyz * 2.0 - 1.0;
            // whiteout blend in world space
            vec3 tX = vec3(0.0, nx.y, nx.x) * ${C.toFixed(2)};
            vec3 tY = vec3(ny.x, 0.0, ny.y) * ${C.toFixed(2)};
            vec3 tZ = vec3(nz.x, nz.y, 0.0) * ${C.toFixed(2)};
            vec3 nW2 = normalize(nWg + tX * triW.x + tY * triW.y + tZ * triW.z);
            normal = normalize((viewMatrix * vec4(nW2, 0.0)).xyz);
          }`);
    }, A.customProgramCacheKey = () => "tri" + I.scale;
  }
};
var ON = `
varying vec3 vDir;
void main(){
  vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`, vN = `
precision highp float;
varying vec3 vDir;
uniform vec3 uSunDir, uMoonDir;
uniform vec3 uZenith, uHorizon, uHorizonSun, uSunColor, uGround, uFogColor, uFogSun;
uniform float uSunVis, uMoonVis, uStars, uCloud, uCloudDark, uTime, uEnv, uHaze, uStorm, uMoonPhase, uFogAmt;
uniform vec2 uCloudOffset;
uniform vec3 uCloudLit, uCloudShade;

float h13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
vec3 h33(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(h12(i), h12(i+vec2(1,0)), u.x), mix(h12(i+vec2(0,1)), h12(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = 0.5; for (int i = 0; i < 6; i++){ s += a * vn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
float fbm3(vec2 p){ float s = 0., a = 0.5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.07 + vec2(3.1, 1.3); a *= 0.5; } return s; }

vec3 atmosphere(vec3 d){
  float y = d.y;
  vec2 dh = normalize(d.xz + 1e-5);
  vec2 sh = normalize(uSunDir.xz + 1e-5);
  float towardSun = clamp(dot(dh, sh) * 0.5 + 0.5, 0.0, 1.0);
  vec3 hor = mix(uHorizon, uHorizonSun, pow(towardSun, 3.0));
  float t = pow(clamp(y, 0.0, 1.0), 0.42);
  vec3 col = mix(hor, uZenith, t);
  // horizon haze band
  col = mix(col, mix(uFogColor, uFogSun, pow(towardSun, 6.0)), exp(-max(y, 0.0) * (7.0 - uHaze * 4.0)) * (0.55 + 0.45 * uHaze));
  float cs = dot(d, uSunDir);
  // Mie-like glow around the sun
  col += uSunColor * (pow(max(cs, 0.0), 6.0) * 0.18 + pow(max(cs, 0.0), 48.0) * 0.45 + pow(max(cs, 0.0), 600.0) * 1.2) * uSunVis;
  if (y < 0.0) {
    vec3 g = mix(mix(uFogColor, uFogSun, pow(towardSun, 6.0)), uGround, smoothstep(0.0, -0.25, y));
    col = mix(col, g, smoothstep(0.0, -0.03, y));
  }
  return col;
}

vec4 clouds(vec3 d){
  if (d.y < 0.005 || uCloud < 0.01) return vec4(0.);
  vec2 p = d.xz / (d.y + 0.12) * 1.4 + uCloudOffset;
  float cover = uCloud;
  float n = fbm(p * 0.9);
  float dens = smoothstep(1.02 - cover * 0.75, 1.25 - cover * 0.6, n + 0.28);
  // cirrus streaks
  vec2 q = d.xz / (d.y + 0.2) * 0.5 + uCloudOffset * 0.3;
  float ci = fbm3(vec2(q.x * 0.6, q.y * 3.0)) ;
  float cir = smoothstep(0.55, 0.85, ci) * 0.35 * (0.4 + cover);
  vec2 sdir = normalize(uSunDir.xz + 1e-4);
  float n2 = fbm(p * 0.9 + sdir * 0.09);
  float shade = exp(-max(n2 - n + 0.05, 0.0) * 5.0) * 0.75 + 0.25 * (1.0 - dens);
  float cs = max(dot(d, uSunDir), 0.0);
  vec3 lit = uCloudLit * (0.75 + 0.5 * shade) + uSunColor * pow(cs, 12.0) * 0.6 * uSunVis;
  vec3 col = mix(uCloudShade, lit, shade);
  col = mix(col, uCloudShade, uCloudDark * 0.7);
  float a = clamp(dens + cir * (1.0 - dens), 0.0, 1.0);
  a *= smoothstep(0.0, 0.18, d.y);
  return vec4(col, a);
}

void main(){
  vec3 d = normalize(vDir);
  vec3 col = atmosphere(d);
  if (uEnv < 0.5) {
    // stars + milky way
    if (uStars > 0.001 && d.y > -0.05) {
      vec3 sd = d * 300.0;
      vec3 cell = floor(sd);
      float h = h13(cell);
      if (h > 0.9935) {
        vec3 pos = h33(cell + 7.0) * 0.6 + 0.2;
        float dd = length(fract(sd) - pos);
        float b = pow(fract(h * 157.3), 3.0) * 2.5 + 0.2;
        float tw = 0.75 + 0.25 * sin(uTime * (2.0 + h * 5.0) + h * 100.0);
        col += vec3(0.8 + 0.2 * fract(h * 31.), 0.85, 1.0) * smoothstep(0.32, 0.0, dd) * b * tw * uStars;
      }
      vec3 mwN = normalize(vec3(0.3, 0.55, 0.78));
      float bd = dot(d, mwN) / 0.2;
      float band = exp(-bd * bd);
      float mw = fbm(vec2(atan(d.z, d.x) * 6.0, d.y * 8.0)) * band;
      col += vec3(0.5, 0.55, 0.7) * mw * 0.06 * uStars;
    }
    // sun disc
    float cs = dot(d, uSunDir);
    float disc = smoothstep(0.99985, 0.99992, cs);
    col += uSunColor * disc * 40.0 * uSunVis * (1.0 - uStorm * 0.9);
    // moon
    float cm = dot(d, uMoonDir);
    if (cm > 0.9995 && uMoonVis > 0.001) {
      vec3 right = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(right, uMoonDir);
      vec2 md = vec2(dot(d - uMoonDir, right), dot(d - uMoonDir, up)) / 0.0316;
      float r = length(md);
      if (r < 1.0) {
        vec3 nrm = vec3(md, sqrt(1.0 - r * r));
        vec3 L = normalize(vec3(cos(uMoonPhase), 0.0, sin(uMoonPhase)));
        float lit = smoothstep(-0.05, 0.12, dot(nrm, L));
        float mare = fbm(md * 3.0 + 4.0);
        vec3 mc = vec3(0.95, 0.93, 0.86) * (0.65 + 0.35 * smoothstep(0.35, 0.65, mare));
        col = mix(col, mc * (0.04 + lit * 1.6), smoothstep(1.0, 0.94, r) * uMoonVis);
      }
    }
    col += vec3(0.6, 0.65, 0.8) * pow(max(cm, 0.0), 800.0) * 0.25 * uMoonVis;
  }
  vec4 cl = clouds(d);
  col = mix(col, cl.rgb, cl.a);
  // global fog / storm veil
  float veil = uFogAmt * (1.0 - smoothstep(0.0, 0.5 + uStorm * 0.8, d.y) * (1.0 - uStorm * 0.85));
  col = mix(col, mix(uFogColor, uFogSun, pow(max(dot(d, uSunDir), 0.0), 6.0)), clamp(veil, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}`, Nn = class {
  constructor(A) {
    this.renderer = A;
    let I = (C) => ({ value: C });
    this.uniforms = { uSunDir: I(new y(0, 1, 0)), uMoonDir: I(new y(0, -1, 0)), uZenith: I(new nA()), uHorizon: I(new nA()), uHorizonSun: I(new nA()), uSunColor: I(new nA()), uGround: I(new nA()), uFogColor: I(new nA()), uFogSun: I(new nA()), uSunVis: I(1), uMoonVis: I(0), uStars: I(0), uCloud: I(0.3), uCloudDark: I(0), uTime: I(0), uEnv: I(0), uHaze: I(0.5), uStorm: I(0), uMoonPhase: I(1.2), uFogAmt: I(0), uCloudOffset: I(new eA()), uCloudLit: I(new nA(1, 1, 1)), uCloudShade: I(new nA(0.6, 0.65, 0.75)) }, this.material = new xI({ vertexShader: ON, fragmentShader: vN, uniforms: this.uniforms, side: iC, depthWrite: false, depthTest: false, fog: false });
    let g = new ug(1e3, 48, 24);
    this.mesh = new cA(g, this.material), this.mesh.frustumCulled = false, this.mesh.renderOrder = -1e3, this.envMesh = new cA(g, this.material), this.envScene.add(this.envMesh), this.cubeRT = new _E(128, { type: wg, generateMipmaps: false }), this.cubeCam = new TE(1, 5e3, this.cubeRT), this.envScene.add(this.cubeCam), this.pmrem = new ZE(A);
  }
  renderer;
  mesh;
  material;
  envScene = new mC();
  envMesh;
  cubeRT;
  cubeCam;
  pmrem;
  envRT = null;
  uniforms;
  follow(A) {
    this.mesh.position.copy(A.position), this.mesh.updateMatrixWorld();
  }
  updateEnv() {
    this.uniforms.uEnv.value = 1, this.cubeCam.update(this.renderer, this.envScene), this.uniforms.uEnv.value = 0;
    let A = this.pmrem.fromCubemap(this.cubeRT.texture, this.envRT ?? void 0);
    return this.envRT = A, A.texture;
  }
};
var VN = { uniforms: { tDiffuse: { value: null }, tMask: { value: null }, uTexel: { value: new eA(1 / 960, 1 / 540) }, uColor: { value: new nA(1.5, 1.42, 1.25) }, uOn: { value: 0 }, uFill: { value: 0.035 } }, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: `
    uniform sampler2D tDiffuse, tMask;
    uniform vec2 uTexel;
    uniform vec3 uColor;
    uniform float uOn, uFill;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      if (uOn > 0.5) {
        float m = texture2D(tMask, vUv).r;
        float d = 0.0;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 0.5235988;
          d = max(d, texture2D(tMask, vUv + vec2(cos(a), sin(a)) * uTexel * 1.6).r);
        }
        float edge = clamp(d - m, 0.0, 1.0);
        c.rgb = mix(c.rgb, uColor, edge * 0.85) + uColor * m * uFill;
      }
      gl_FragColor = c;
    }` }, mn = class {
  pass = new Ii(VN);
  mask;
  scene = new mC();
  white = new pC({ color: 16777215 });
  pool = [];
  selection = [];
  constructor(A, I) {
    this.mask = new zI(Math.max(1, A >> 1), Math.max(1, I >> 1), { depthBuffer: false }), this.pass.uniforms.tMask.value = this.mask.texture, this.scene.matrixWorldAutoUpdate = false;
  }
  setSize(A, I) {
    this.mask.setSize(Math.max(1, A >> 1), Math.max(1, I >> 1)), this.pass.uniforms.uTexel.value.set(2 / A, 2 / I);
  }
  update(A, I) {
    let g = 0;
    for (let E of this.selection) E.traverseVisible((t) => {
      let o = t;
      if (!o.isMesh || o.isSkinnedMesh || o.material?.visible === false) return;
      let e = this.pool[g];
      e || (e = this.pool[g] = new cA(o.geometry, this.white), e.matrixAutoUpdate = false, e.matrixWorldAutoUpdate = false, this.scene.add(e)), e.geometry = o.geometry, e.matrixWorld.copy(o.matrixWorld), e.visible = true, g++;
    });
    for (let E = g; E < this.pool.length; E++) this.pool[E].visible = false;
    if (this.pass.uniforms.uOn.value = g ? 1 : 0, !g) return;
    let C = A.getRenderTarget(), Q = A.getClearColor(new nA()), i = A.getClearAlpha();
    A.setRenderTarget(this.mask), A.setClearColor(0, 1), A.clear(true, false, false), A.render(this.scene, I), A.setRenderTarget(C), A.setClearColor(Q, i);
  }
};
var ac = 1;
function MB(B) {
  return B.layers.enable(ac), B;
}
function ee(B, A) {
  B.traverse((I) => I.layers.set(A ? ac : 0));
}
var sc = class extends oC {
  constructor(I, g) {
    super();
    this.scene = I;
    this.camera = g;
    this.needsSwap = false, this.clear = false;
  }
  scene;
  camera;
  render(I, g, C) {
    let Q = this.camera.layers.mask, i = I.shadowMap.autoUpdate, E = I.autoClear;
    I.shadowMap.autoUpdate = false, I.autoClear = false, this.camera.layers.set(ac), I.setRenderTarget(this.renderToScreen ? null : C), I.clearDepth(), I.render(this.scene, this.camera), this.camera.layers.mask = Q, I.shadowMap.autoUpdate = i, I.autoClear = E;
  }
}, jN = { uniforms: { tDiffuse: { value: null }, uSat: { value: 1 }, uContrast: { value: 1.04 }, uWarm: { value: 0.25 }, uVignette: { value: 0.55 }, uGrain: { value: 0.018 }, uTime: { value: 0 }, uDamage: { value: 0 }, uFade: { value: 0 }, uLift: { value: new y(4e-3, 35e-4, 3e-3) }, uGain: { value: new y(1, 1, 1) }, uRes: { value: new eA(1920, 1080) }, uBlur: { value: 0 }, uGrey: { value: 0 } }, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uSat, uContrast, uWarm, uVignette, uGrain, uTime, uDamage, uFade, uBlur, uGrey;
    uniform vec3 uLift, uGain;
    uniform vec2 uRes;
    varying vec2 vUv;
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      if (uBlur > 0.001) {
        vec2 px = uBlur * 3.0 / uRes;
        c = c * 0.4 + (texture2D(tDiffuse, vUv + vec2(px.x, 0.)).rgb + texture2D(tDiffuse, vUv - vec2(px.x, 0.)).rgb + texture2D(tDiffuse, vUv + vec2(0., px.y)).rgb + texture2D(tDiffuse, vUv - vec2(0., px.y)).rgb) * 0.15;
      }
      c *= mix(vec3(1.0), vec3(1.06, 1.0, 0.9), uWarm);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, uSat * (1.0 - uGrey));
      c = pow(max(c, 0.0) / 0.2, vec3(uContrast)) * 0.2;
      c = c * uGain + uLift;
      vec2 d = vUv - 0.5;
      d.x *= uRes.x / uRes.y * 0.75;
      float r2 = dot(d, d);
      c *= 1.0 - r2 * uVignette;
      float dm = uDamage * smoothstep(0.05, 0.55, sqrt(r2) * 1.3);
      c = mix(c, c * vec3(1.1, 0.25, 0.2) + vec3(0.05, 0.0, 0.0), dm);
      float n = fract(sin(dot(floor(vUv * uRes) + fract(uTime * 7.13) * 97.0, vec2(12.9898, 78.233))) * 43758.5453);
      c += (n - 0.5) * uGrain * (0.15 + sqrt(max(l, 0.0)));
      c *= 1.0 - uFade;
      gl_FragColor = vec4(max(c, 0.0), 1.0);
    }` }, qn = class {
  constructor(A, I, g, C, Q, i) {
    this.renderer = A;
    this.scene = I, this.camera = g;
    let E = new zI(C, Q, { type: wg, samples: i });
    this.composer = new Rn(A, E), this.renderPass = new un(I, g), this.composer.addPass(this.renderPass), this.composer.addPass(new sc(I, g)), this.bloom = new VE(new eA(C / 2, Q / 2), 0.32, 0.55, 2.6);
    let t = this.bloom.materialHighPassFilter;
    t.fragmentShader = t.fragmentShader.replace("vec4 texel = texture2D( tDiffuse, vUv );", "vec4 texel = texture2D( tDiffuse, vUv ); if (any(isnan(texel)) || any(isinf(texel))) texel = vec4(0.0); texel.rgb = min(texel.rgb, vec3(48.0));"), t.needsUpdate = true, this.composer.addPass(this.bloom), this.grade = new Ii(jN), this.composer.addPass(this.grade), this.outline = new mn(C, Q), this.outline.setSize(C, Q), this.composer.addPass(this.outline.pass), this.output = new fn(), this.composer.addPass(this.output);
  }
  renderer;
  composer;
  renderPass;
  bloom;
  grade;
  gtao = null;
  output;
  outline;
  scene;
  camera;
  setAO(A) {
    if (A && !this.gtao) {
      let I = new eA();
      this.renderer.getDrawingBufferSize(I), this.gtao = new jE(this.scene, this.camera, I.x, I.y), this.gtao.output = jE.OUTPUT.Default, this.gtao.blendIntensity = 0.85, this.gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.4, thickness: 1.2, scale: 1, samples: 12, distanceFallOff: 1 }), this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 }), this.composer.insertPass(this.gtao, 1);
    } else !A && this.gtao && (this.composer.removePass(this.gtao), this.gtao.dispose(), this.gtao = null);
  }
  setSize(A, I) {
    this.composer.setSize(A, I), this.grade.uniforms.uRes.value.set(A, I), this.outline.setSize(A, I);
  }
  render(A) {
    this.grade.uniforms.uTime.value += A, this.outline.update(this.renderer, this.camera), this.composer.render(A);
  }
};
var yI = (B, A, I) => B < A ? A : B > I ? I : B, ZI = (B) => B < 0 ? 0 : B > 1 ? 1 : B, Ag = (B, A, I) => B + (A - B) * I;
var Fg = (B, A, I) => {
  let g = ZI((I - B) / (A - B));
  return g * g * (3 - 2 * g);
}, KI = (B, A, I, g) => Ag(B, A, 1 - Math.exp(-I * g)), XN = (B) => (B = (B + Math.PI) % (Math.PI * 2), B < 0 && (B += Math.PI * 2), B - Math.PI), ww = (B, A, I, g) => B + XN(A - B) * (1 - Math.exp(-I * g)), Hn = (B) => B < 0 ? -1 : 1, Tn = Math.PI / 180;
var nc = (B, A) => (B % A + A) % A, vI = class {
  s;
  constructor(A) {
    this.s = A >>> 0 || 2654435769;
  }
  next() {
    let A = this.s = this.s + 1831565813 >>> 0;
    return A = Math.imul(A ^ A >>> 15, A | 1), A ^= A + Math.imul(A ^ A >>> 7, A | 61), ((A ^ A >>> 14) >>> 0) / 4294967296;
  }
  range(A, I) {
    return A + (I - A) * this.next();
  }
  int(A, I) {
    return Math.floor(A + (I - A + 1) * this.next());
  }
  chance(A) {
    return this.next() < A;
  }
  pick(A) {
    return A[Math.floor(this.next() * A.length) % A.length];
  }
  sign() {
    return this.next() < 0.5 ? -1 : 1;
  }
  weighted(A) {
    let I = 0;
    for (let C of A) I += C[1];
    let g = this.next() * I;
    for (let C of A) if (g -= C[1], g <= 0) return C[0];
    return A[A.length - 1][0];
  }
  gauss() {
    let A = Math.max(1e-9, this.next());
    return Math.sqrt(-2 * Math.log(A)) * Math.cos(2 * Math.PI * this.next());
  }
};
function bn(B, A, I = 0) {
  let g = Math.imul((B | 0) ^ 668265261, 374761393) ^ Math.imul((A | 0) + 1640531527, 668265263) ^ Math.imul(I | 0, 2246822507);
  return g = Math.imul(g ^ g >>> 15, 739982445), g = Math.imul(g ^ g >>> 12, 695872825), g ^= g >>> 15, (g >>> 0) / 4294967296;
}
function gi(...B) {
  let A = 2166136261;
  for (let I of B) A ^= I | 0, A = Math.imul(A, 16777619), A ^= I * 1000003 >>> 0, A = Math.imul(A, 16777619);
  return A >>> 0;
}
var xn = { clear: { cloud: 0.18, cloudDark: 0, fog: 1, sun: 1, sand: 0, rain: 0, wind: 3, haze: 0.5 }, cloudy: { cloud: 0.55, cloudDark: 0.1, fog: 1.2, sun: 0.85, sand: 0, rain: 0, wind: 5, haze: 0.55 }, overcast: { cloud: 0.95, cloudDark: 0.45, fog: 1.7, sun: 0.28, sand: 0, rain: 0, wind: 6, haze: 0.8 }, sandstorm: { cloud: 0.7, cloudDark: 0.3, fog: 30, sun: 0.35, sand: 1, rain: 0, wind: 17, haze: 1 }, rain: { cloud: 1, cloudDark: 0.7, fog: 5, sun: 0.18, sand: 0, rain: 1, wind: 8, haze: 0.9 } }, On = [{ el: -20, zen: "#020409", hor: "#070b14", horSun: "#080c16", sun: "#000000", sunI: 0, amb: 0.06, fog: "#070b13", fogSun: "#080c15", ground: "#07080a", cloudLit: "#0d1119", cloudShade: "#07090e" }, { el: -10, zen: "#060c1c", hor: "#161b2c", horSun: "#2a2230", sun: "#000000", sunI: 0, amb: 0.1, fog: "#141926", fogSun: "#241e2a", ground: "#0e0d10", cloudLit: "#1c1e2a", cloudShade: "#0e1018" }, { el: -4, zen: "#15254a", hor: "#56506a", horSun: "#b8705a", sun: "#ff7040", sunI: 0, amb: 0.22, fog: "#4c4a5e", fogSun: "#a0644e", ground: "#2a211e", cloudLit: "#b07060", cloudShade: "#383448" }, { el: 1, zen: "#2c4a80", hor: "#b08878", horSun: "#f2944e", sun: "#ff8a48", sunI: 0.9, amb: 0.36, fog: "#a88478", fogSun: "#ee9458", ground: "#6a4a36", cloudLit: "#ffa878", cloudShade: "#6a5a6a" }, { el: 6, zen: "#3f67a4", hor: "#d0aa8c", horSun: "#ffc088", sun: "#ffb070", sunI: 2.1, amb: 0.55, fog: "#d2b096", fogSun: "#ffc690", ground: "#9a7456", cloudLit: "#ffd8b0", cloudShade: "#8a8090" }, { el: 14, zen: "#4f80c4", hor: "#d8c8b4", horSun: "#f4dcb8", sun: "#ffdcae", sunI: 3, amb: 0.72, fog: "#d9ccbb", fogSun: "#f2dcbc", ground: "#b89272", cloudLit: "#fff0dc", cloudShade: "#9a9eac" }, { el: 30, zen: "#5a8ed2", hor: "#d2dae0", horSun: "#ebe6dc", sun: "#fff1de", sunI: 3.5, amb: 0.85, fog: "#d8d9d6", fogSun: "#efe7da", ground: "#c09a78", cloudLit: "#ffffff", cloudShade: "#a8b0c0" }, { el: 70, zen: "#5f96da", hor: "#d6dee6", horSun: "#eeebe4", sun: "#fff8ee", sunI: 3.8, amb: 0.95, fog: "#dadcdc", fogSun: "#f0ebe2", ground: "#c6a07c", cloudLit: "#ffffff", cloudShade: "#b0b8c6" }], yw = new nA(), kw = new nA();
function DQ(B, A, I, g) {
  return yw.set(B), kw.set(A), g.copy(yw).lerp(kw, I);
}
var vn = class {
  constructor(A, I, g) {
    this.scene = A;
    this.sky = I;
    this.rng = new vI(g ^ 24301), this.sunLight = MB(new VQ(16777215, 3)), this.sunLight.castShadow = true, this.sunLight.shadow.bias = -4e-4, this.sunLight.shadow.normalBias = 0.035, A.add(this.sunLight, this.sunLight.target), this.hemi = MB(new pi(12571903, 12622456, 0.3)), A.add(this.hemi), A.fog = new co(13687008, 3e-4);
  }
  scene;
  sky;
  time = 9.5;
  day = 1;
  secondsPerHour = 60;
  weather = "clear";
  wFrom = { ...xn.clear };
  wTo = { ...xn.clear };
  wT = 1;
  wDuration = 1;
  cur = { ...xn.clear };
  weatherTimer = 400;
  rng;
  frozenWeather = false;
  sunDir = new y(0, 1, 0);
  moonDir = new y(0, -1, 0);
  lightDir = new y(0, 1, 0);
  sunColor = new nA();
  sunIntensity = 3;
  ambient = 1;
  fogColor = new nA();
  fogSun = new nA();
  sunElevation = 0;
  night = 0;
  indoor = 0;
  wind = new y(3, 0, 1);
  windSpeed = 3;
  windPhase = 0;
  lightning = 0;
  lightningTimer = 5;
  onThunder = null;
  temperature = 30;
  cloudOffset = new eA();
  envTimer = 0;
  lastEnvSun = new y();
  totalTime = 0;
  sunLight;
  hemi;
  setWeather(A, I = 60) {
    this.weather = A, this.wFrom = { ...this.cur }, this.wTo = { ...xn[A] }, this.wT = 0, this.wDuration = Math.max(0.01, I), this.weatherTimer = 300 + this.rng.next() * 600;
  }
  pickWeather() {
    return this.rng.weighted([["clear", 50], ["cloudy", 24], ["overcast", 10], ["sandstorm", 10], ["rain", 6]]);
  }
  get isNight() {
    return this.night > 0.5;
  }
  update(A, I) {
    if (this.totalTime += I, this.time += A / this.secondsPerHour, this.time >= 24 && (this.time -= 24, this.day++), this.frozenWeather || (this.weatherTimer -= I, this.weatherTimer <= 0 && this.setWeather(this.pickWeather(), 90)), this.wT < 1) {
      this.wT = Math.min(1, this.wT + I / this.wDuration);
      let Q = Fg(0, 1, this.wT);
      for (let i of Object.keys(this.cur)) i === "fog" ? this.cur.fog = Math.exp(Ag(Math.log(this.wFrom.fog), Math.log(this.wTo.fog), Q)) : this.cur[i] = Ag(this.wFrom[i], this.wTo[i], Q);
    }
    this.windPhase += I;
    let g = 0.6 + Math.sin(this.windPhase * 0.013) * 0.8, C = 1 + 0.35 * Math.sin(this.windPhase * 0.7) * Math.sin(this.windPhase * 0.23 + 1.3);
    this.windSpeed = this.cur.wind * C, this.wind.set(Math.sin(g), 0, Math.cos(g)).multiplyScalar(this.windSpeed), this.cloudOffset.x += this.wind.x * I * 6e-4, this.cloudOffset.y += this.wind.z * I * 6e-4, this.computeSun(), this.computeColors(), this.updateLightning(I), this.applyToScene();
  }
  computeSun() {
    let A = 33 * Tn, I = (16 + Math.sin(this.day * 0.05) * 4) * Tn, g = (this.time - 12) / 24 * Math.PI * 2, C = -Math.cos(I) * Math.sin(g), Q = Math.sin(I) * Math.cos(A) - Math.cos(I) * Math.cos(g) * Math.sin(A), i = Math.sin(I) * Math.sin(A) + Math.cos(I) * Math.cos(g) * Math.cos(A);
    this.sunDir.set(-C, i, Q).normalize();
    let E = g + Math.PI + 0.35 + Math.sin(this.day * 0.21) * 0.3, t = -I * 0.6, o = -Math.cos(t) * Math.sin(E), e = Math.sin(t) * Math.cos(A) - Math.cos(t) * Math.cos(E) * Math.sin(A), s = Math.sin(t) * Math.sin(A) + Math.cos(t) * Math.cos(E) * Math.cos(A);
    this.moonDir.set(-o, s, e).normalize(), this.sunElevation = Math.asin(yI(this.sunDir.y, -1, 1)) / Tn;
  }
  zen = new nA();
  hor = new nA();
  horSun = new nA();
  ground = new nA();
  cloudLit = new nA();
  cloudShade = new nA();
  computeColors() {
    let A = this.sunElevation, I = 0;
    for (; I < On.length - 2 && A > On[I + 1].el; ) I++;
    let g = On[I], C = On[I + 1], Q = ZI((A - g.el) / (C.el - g.el));
    DQ(g.zen, C.zen, Q, this.zen), DQ(g.hor, C.hor, Q, this.hor), DQ(g.horSun, C.horSun, Q, this.horSun), DQ(g.sun, C.sun, Q, this.sunColor), DQ(g.fog, C.fog, Q, this.fogColor), DQ(g.fogSun, C.fogSun, Q, this.fogSun), DQ(g.ground, C.ground, Q, this.ground), DQ(g.cloudLit, C.cloudLit, Q, this.cloudLit), DQ(g.cloudShade, C.cloudShade, Q, this.cloudShade);
    let i = this.cur;
    this.sunIntensity = Ag(g.sunI, C.sunI, Q) * i.sun, this.ambient = Ag(g.amb, C.amb, Q) * Ag(1, 0.75, i.cloudDark), this.night = 1 - Fg(-9, 2, A);
    let E = (e, s) => {
      let a = e.r * 0.3 + e.g * 0.59 + e.b * 0.11;
      e.r = Ag(e.r, a, s), e.g = Ag(e.g, a, s), e.b = Ag(e.b, a, s);
    }, t = ZI(i.cloudDark * 1.2);
    for (let e of [this.zen, this.hor, this.horSun, this.fogColor, this.fogSun, this.cloudLit]) E(e, t * 0.75);
    if (t > 0) {
      let e = 1 - t * 0.45;
      this.zen.multiplyScalar(e), this.hor.multiplyScalar(e), this.horSun.multiplyScalar(e), this.fogColor.multiplyScalar(e), this.fogSun.multiplyScalar(e);
    }
    if (i.sand > 1e-3) {
      let e = ZI((A + 6) / 20), s = new nA("#b07a45").multiplyScalar(0.25 + 0.75 * e), a = new nA("#d09a5c").multiplyScalar(0.25 + 0.75 * e);
      this.fogColor.lerp(s, i.sand), this.fogSun.lerp(a, i.sand), this.hor.lerp(s, i.sand), this.horSun.lerp(a, i.sand), this.zen.lerp(s.clone().multiplyScalar(0.8), i.sand * 0.85), this.sunColor.lerp(new nA("#ffb070"), i.sand * 0.6);
    }
    let o = Fg(-5, 50, A);
    this.temperature = Ag(4, 46, o) - i.cloudDark * 8 - i.rain * 10;
  }
  updateLightning(A) {
    if (this.lightning = Math.max(0, this.lightning - A * 6), this.cur.rain > 0.6 && (this.lightningTimer -= A, this.lightningTimer <= 0)) {
      this.lightningTimer = 6 + this.rng.next() * 18, this.lightning = 1;
      let I = 0.5 + this.rng.next() * 4;
      this.onThunder?.(I, 1 / I);
    }
  }
  applyToScene() {
    let A = this.cur, I = this.sky.uniforms, g = this.sunDir.y > -0.04, C = ZI(this.moonDir.y * 4) * 0.34 * (1 - A.cloudDark * 0.8), Q = Fg(-0.04, 0.03, this.sunDir.y);
    g && Q > 0.02 ? (this.lightDir.copy(this.sunDir), this.sunLight.color.copy(this.sunColor), this.sunLight.intensity = this.sunIntensity * Q) : (this.lightDir.copy(this.moonDir.y > 0.02 ? this.moonDir : new y(0.3, 1, 0.2).normalize()), this.sunLight.color.set("#9fb6e6"), this.sunLight.intensity = C), this.lightning > 0 && (this.sunLight.intensity += this.lightning * 6, this.sunLight.color.lerp(new nA("#dfe6ff"), this.lightning)), this.hemi.color.copy(this.zen).lerp(this.hor, 0.5), this.hemi.groundColor.copy(this.ground);
    let i = 1 - this.indoor * 0.68;
    this.hemi.intensity = (0.25 * this.ambient + this.lightning * 1.5) * i, this.scene.environmentIntensity = (this.ambient * 0.9 + this.lightning) * i;
    let E = this.scene.fog;
    E.color.copy(this.fogColor), E.density = 28e-5 * A.fog * Ag(1, 1.6, this.night), tC.sunColor[0] = this.fogSun.r, tC.sunColor[1] = this.fogSun.g, tC.sunColor[2] = this.fogSun.b, tC.sunDir[0] = this.sunDir.x, tC.sunDir[1] = this.sunDir.y, tC.sunDir[2] = this.sunDir.z, tC.params[0] = A.sand > 0.3 ? 12e-4 : 35e-4, tC.params[1] = 0, tC.params[2] = 7, tC.params[3] = A.sand > 0.2 ? 1 : 0.985, I.uSunDir.value.copy(this.sunDir), I.uMoonDir.value.copy(this.moonDir), I.uZenith.value.copy(this.zen), I.uHorizon.value.copy(this.hor), I.uHorizonSun.value.copy(this.horSun), I.uSunColor.value.copy(this.sunColor), I.uGround.value.copy(this.ground), I.uFogColor.value.copy(this.fogColor), I.uFogSun.value.copy(this.fogSun), I.uSunVis.value = Fg(-0.06, 0.02, this.sunDir.y) * (1 - A.cloudDark * 0.9), I.uMoonVis.value = Fg(-0.05, 0.1, this.moonDir.y) * (1 - A.cloudDark) * (1 - A.sand), I.uStars.value = this.night * (1 - A.cloud * 0.8) * (1 - A.sand), I.uCloud.value = A.cloud, I.uCloudDark.value = A.cloudDark, I.uCloudLit.value.copy(this.cloudLit), I.uCloudShade.value.copy(this.cloudShade), I.uHaze.value = A.haze, I.uStorm.value = A.sand, I.uFogAmt.value = ZI((A.fog - 1) / 12) + A.rain * 0.3, I.uTime.value = this.totalTime, I.uCloudOffset.value.copy(this.cloudOffset), I.uMoonPhase.value = 1 + this.day * 0.21, this.lightning > 0 && (I.uZenith.value.lerp(new nA("#8890b8"), this.lightning * 0.6), I.uHorizon.value.lerp(new nA("#a0a8c8"), this.lightning * 0.6));
  }
  maybeUpdateEnv(A, I = false) {
    this.envTimer -= A;
    let g = this.lastEnvSun.distanceToSquared(this.sunDir) > 4e-4 || this.wT < 1;
    (I || this.envTimer <= 0 && g) && (this.envTimer = 1.5, this.lastEnvSun.copy(this.sunDir), this.scene.environment = this.sky.updateEnv());
  }
  updateShadow(A, I, g) {
    let C = this.sunLight, Q = C.shadow.camera;
    Q.right !== I && (Q.left = -I, Q.right = I, Q.top = I, Q.bottom = -I, Q.near = 1, Q.far = 700, Q.updateProjectionMatrix()), C.shadow.mapSize.x !== g && (C.shadow.mapSize.set(g, g), C.shadow.map?.dispose(), C.shadow.map = null);
    let i = this.lightDir, E = Math.abs(i.y) > 0.99 ? new y(1, 0, 0) : new y(0, 1, 0), t = new y().crossVectors(E, i).normalize(), o = new y().crossVectors(i, t).normalize(), e = I * 2 / g, s = A.dot(t), a = A.dot(o), n = Math.round(s / e) * e - s, r = Math.round(a / e) * e - a, c = A.clone().addScaledVector(t, n).addScaledVector(o, r);
    C.target.position.copy(c), C.position.copy(c).addScaledVector(i, 300), C.target.updateMatrixWorld(), C.updateMatrixWorld();
  }
  timeString() {
    let A = Math.floor(this.time), I = Math.floor((this.time - A) * 60);
    return `${String(A).padStart(2, "0")}:${String(I).padStart(2, "0")}`;
  }
};
var zN = 0.5 * (Math.sqrt(3) - 1), se = (3 - Math.sqrt(3)) / 6, XE = new Float32Array([1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 0, 1, 0, -1, 0.7071, 0.7071, -0.7071, 0.7071, 0.7071, -0.7071, -0.7071, -0.7071]), mi = class {
  perm = new Uint16Array(512);
  gi = new Uint8Array(512);
  constructor(A) {
    let I = new vI(A), g = new Uint16Array(256);
    for (let C = 0; C < 256; C++) g[C] = C;
    for (let C = 255; C > 0; C--) {
      let Q = Math.floor(I.next() * (C + 1)), i = g[C];
      g[C] = g[Q], g[Q] = i;
    }
    for (let C = 0; C < 512; C++) this.perm[C] = g[C & 255], this.gi[C] = this.perm[C] % 12;
  }
  noise(A, I) {
    let g = this.perm, C = this.gi, Q = (A + I) * zN, i = Math.floor(A + Q), E = Math.floor(I + Q), t = (i + E) * se, o = A - (i - t), e = I - (E - t), s, a;
    o > e ? (s = 1, a = 0) : (s = 0, a = 1);
    let n = o - s + se, r = e - a + se, c = o - 1 + 2 * se, h = e - 1 + 2 * se, D = i & 255, l = E & 255, U = 0, S = 0.5 - o * o - e * e;
    if (S > 0) {
      let G = C[D + g[l]] * 2;
      S *= S, U += S * S * (XE[G] * o + XE[G + 1] * e);
    }
    let k = 0.5 - n * n - r * r;
    if (k > 0) {
      let G = C[D + s + g[l + a]] * 2;
      k *= k, U += k * k * (XE[G] * n + XE[G + 1] * r);
    }
    let K = 0.5 - c * c - h * h;
    if (K > 0) {
      let G = C[D + 1 + g[l + 1]] * 2;
      K *= K, U += K * K * (XE[G] * c + XE[G + 1] * h);
    }
    return 70 * U;
  }
  fbm(A, I, g, C = 2, Q = 0.5) {
    let i = 1, E = 1, t = 0, o = 0;
    for (let e = 0; e < g; e++) t += i * this.noise(A * E + e * 19.19, I * E - e * 7.73), o += i, i *= Q, E *= C;
    return t / o;
  }
  ridged(A, I, g) {
    let C = 0.5, Q = 1, i = 0, E = 1;
    for (let t = 0; t < g; t++) {
      let o = 1 - Math.abs(this.noise(A * Q + t * 3.1, I * Q + t * 1.7));
      o *= o, i += o * C * E, E = o, Q *= 2, C *= 0.5;
    }
    return i;
  }
};
var UB = 4.3, JC = -40, Pn = class {
  seed;
  nT;
  nD;
  nR;
  nS;
  roadYCache = /* @__PURE__ */ new Map();
  pads = /* @__PURE__ */ new Map();
  padProvider = null;
  windAngle;
  cw;
  sw;
  constructor(A) {
    this.seed = A, this.nT = new mi(A * 7 + 1), this.nD = new mi(A * 13 + 5), this.nR = new mi(A * 31 + 11), this.nS = new mi(A * 3 + 17), this.windAngle = 0.35 + bn(A, 3) * 0.5, this.cw = Math.cos(this.windAngle), this.sw = Math.sin(this.windAngle);
  }
  roadX(A) {
    let I = this.nR, g = Fg(150, 900, A), C = I.noise(A / 5200, 1.7) * 520 + I.noise(A / 2100, 4.1) * 150, Q = I.noise(A / 950, 8.3) * 48 * (0.6 + 0.4 * I.noise(A / 4e3, 2.2)), i = I.noise(A / 360, 12.9) * 5, E = I.noise(0 / 5200, 1.7) * 520 + I.noise(0 / 2100, 4.1) * 150;
    return (C + Q + i - E) * g;
  }
  roadDX(A) {
    return this.roadX(A + 0.5) - this.roadX(A - 0.5);
  }
  roadHeading(A) {
    return Math.atan2(this.roadDX(A), 1);
  }
  roadDist(A, I) {
    let g = this.roadDX(I);
    return -(A - this.roadX(I)) / Math.sqrt(1 + g * g);
  }
  onRoad(A, I, g = 0) {
    return I > JC && Math.abs(this.roadDist(A, I)) < UB + g;
  }
  roadY(A) {
    let I = A / 4, g = Math.floor(I), C = I - g, Q = this.roadYAt(g - 1), i = this.roadYAt(g), E = this.roadYAt(g + 1), t = this.roadYAt(g + 2), o = C * C, e = o * C;
    return 0.5 * (2 * i + (-Q + E) * C + (2 * Q - 5 * i + 4 * E - t) * o + (-Q + 3 * i - 3 * E + t) * e);
  }
  roadYAt(A) {
    let I = this.roadYCache.get(A);
    if (I !== void 0) return I;
    let g = A * 4, C = 0, Q = 0;
    for (let i = -8; i <= 8; i++) {
      let E = g + i * 12, t = 1 - Math.abs(i) / 9;
      C += this.baseHeight(this.roadX(E), E) * t, Q += t;
    }
    return I = C / Q, this.roadYCache.size > 2e5 && this.roadYCache.clear(), this.roadYCache.set(A, I), I;
  }
  baseHeight(A, I) {
    let g = this.nT, C = this.nD, Q = g.fbm(A / 3400, I / 3400, 3) * 34, i = Fg(-0.2, 0.6, g.noise(A / 5200 + 11.3, I / 5200 - 4.1));
    Q += g.fbm(A / 780 + 21.7, I / 780 - 5.3, 3) * 9 * (0.35 + i);
    let E = Fg(0.05, 0.55, C.noise(A / 2600 - 7.7, I / 2600 + 3.3));
    if (E > 1e-3) {
      let t = A * this.cw - I * this.sw, o = A * this.sw + I * this.cw, e = C.noise(t / 400, o / 400) * 40, s = 1 - Math.abs(C.noise((t + e) / 190, o / 560));
      s = s * s * (3 - 2 * s), Q += (s * 11 + C.noise(t / 70, o / 90) * 1.4) * E;
    }
    return Q += g.noise(A / 52, I / 52) * 0.55 + g.noise(A / 17, I / 17) * 0.12, Q;
  }
  height(A, I) {
    let g = this.baseHeight(A, I);
    if (I > JC - 30) {
      let C = Math.abs(this.roadDist(A, I));
      if (C < 26) {
        let Q = this.roadY(I), i = Fg(JC - 30, JC, I), E = Fg(UB + 0.6, UB + 22, C), t = Fg(UB, UB + 1.5, C) * (1 - Fg(UB + 1.5, UB + 6, C)) * 0.12, o = Ag(Q - t, g, E);
        g = Ag(g, o, i);
      }
    }
    if (this.padProvider) {
      let C = Math.floor(I / qi);
      for (let Q = C - 1; Q <= C + 1; Q++) {
        let i = this.getPads(Q);
        for (let E = 0; E < i.length; E++) g = $N(i[E], A, I, g);
      }
    }
    return g;
  }
  getPads(A) {
    let I = this.pads.get(A);
    return I || (I = this.padProvider ? this.padProvider(A) : [], this.pads.set(A, I)), I;
  }
  normal(A, I, g = 0.5) {
    let C = this.height(A + g, I) - this.height(A - g, I), Q = this.height(A, I + g) - this.height(A, I - g), i = -C, E = 2 * g, t = -Q, o = Math.hypot(i, E, t);
    return [i / o, E / o, t / o];
  }
  vegetation(A, I) {
    return yI(0.55 + this.nS.noise(A / 900, I / 900) * 0.6 + this.nS.noise(A / 160, I / 160) * 0.25, 0, 1);
  }
  duneMask(A, I) {
    return Fg(0.05, 0.55, this.nD.noise(A / 2600 - 7.7, I / 2600 + 3.3));
  }
  noise2(A, I) {
    return this.nS.noise(A, I);
  }
};
function $N(B, A, I, g) {
  let C = A - B.x, Q = I - B.z, i = Math.cos(B.rot), E = Math.sin(B.rot), t = Math.abs(C * i - Q * E) - B.hw, o = Math.abs(C * E + Q * i) - B.hd, e = Math.hypot(Math.max(t, 0), Math.max(o, 0));
  if (e >= B.blend) return g;
  let s = Fg(0, B.blend, e);
  return Ag(B.y, g, s);
}
var Hi = 64, Mw = [-4.62, -4.36, -4, -2.2, 0, 2.2, 4, 4.36, 4.62];
function Uw(B) {
  let A = new oI({ map: B.asphaltAlbedo, normalMap: B.asphaltNormal, roughnessMap: B.asphaltORM, roughness: 1, metalness: 0, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
  return A.normalScale.set(0.8, 0.8), A.onBeforeCompile = (I) => {
    I.uniforms.uSandMacro = { value: B.sandMacro }, I.uniforms.uSandA = { value: B.sandAlbedo }, I.uniforms.uOriginMod = kB.uOriginMod, I.uniforms.uSandCover = Ti.uSandCover, I.uniforms.uWet = Ti.uWet, I.vertexShader = I.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vRPos;
varying vec2 vRUv;
uniform vec2 uOriginMod;`).replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
 vRPos = (modelMatrix * vec4(transformed, 1.0)).xyz + vec3(uOriginMod.x, 0.0, uOriginMod.y);
 vRUv = uv;`), I.fragmentShader = I.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vRPos;
varying vec2 vRUv;
uniform sampler2D uSandMacro;
uniform sampler2D uSandA;
uniform float uSandCover;
uniform float uWet;
float rSand = 0.0;`).replace("#include <map_fragment>", `#include <map_fragment>
        {
          float ed = abs(vRUv.x - 0.5) * 9.2;
          vec4 mac = texture2D(uSandMacro, vRPos.xz / 57.0);
          vec4 mac2 = texture2D(uSandMacro, vRPos.xz / 13.0 + 0.3);
          float dn = mac.g * 0.75 + mac2.b * 0.35 + (mac2.a - 0.5) * 0.25;
          float drift = smoothstep(0.78 - uSandCover * 0.35, 0.86 - uSandCover * 0.35, dn) * smoothstep(1.5, 4.0, ed + mac.r * 2.0);
          float edge = smoothstep(3.75, 4.3, ed + (mac2.a - 0.5) * 0.9);
          rSand = clamp(max(drift, edge * 0.95), 0.0, 1.0);
          vec3 sandC = texture2D(uSandA, vRPos.xz / 5.0).rgb;
          diffuseColor.rgb = mix(diffuseColor.rgb, sandC, rSand);
          diffuseColor.rgb *= 1.0 - uWet * 0.45 * (1.0 - rSand);
        }`).replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
 roughnessFactor = mix(roughnessFactor, 0.97, rSand);
 roughnessFactor = mix(roughnessFactor, 0.25, uWet * (1.0 - rSand));`);
  }, A;
}
var Ti = { uSandCover: { value: 0 }, uWet: { value: 0 } }, Zn = class {
  constructor(A, I) {
    this.fn = A;
    this.material = I;
    this.group.name = "road";
  }
  fn;
  material;
  group = new WA();
  segs = /* @__PURE__ */ new Map();
  originX = 0;
  originZ = 0;
  ahead = 3400;
  buildGeometry(A, I) {
    let g = this.fn, C = Math.round(Hi / I) + 1, Q = Mw.length, i = new Float32Array(C * Q * 3), E = new Float32Array(C * Q * 3), t = new Float32Array(C * Q * 2), o = Math.floor(A / 1024) * 1024, e = g.roadX(A);
    for (let n = 0; n < C; n++) {
      let r = A + n * I, c = g.roadX(r), h = g.roadY(r), D = g.roadDX(r), l = g.roadY(r + 0.5) - g.roadY(r - 0.5), U = D, S = l, k = 1, K = Math.hypot(U, S, k);
      U /= K, S /= K, k /= K;
      let G = -k, M = U, p = Math.hypot(G, M);
      G /= p, M /= p;
      let d = -M * S, R = M * U - G * k, u = G * S, q = Math.hypot(d, R, u);
      d /= q, R /= q, u /= q;
      for (let L = 0; L < Q; L++) {
        let b = Mw[L], W = c + G * b, j = r + M * b, oA = h + 0.035;
        Math.abs(b) > 4.5 && (oA = Math.min(h, g.height(W, j)) - 0.08);
        let H = n * Q + L;
        i[H * 3] = W - e, i[H * 3 + 1] = oA, i[H * 3 + 2] = j - A, E[H * 3] = d, E[H * 3 + 1] = R, E[H * 3 + 2] = u, t[H * 2] = (b + 4.6) / 9.2, t[H * 2 + 1] = (r - o) / 16;
      }
    }
    let s = [];
    for (let n = 0; n < C - 1; n++) for (let r = 0; r < Q - 1; r++) {
      let c = n * Q + r, h = c + 1, D = c + Q, l = D + 1;
      s.push(c, h, D, h, l, D);
    }
    let a = new SI();
    return a.setAttribute("position", new GI(i, 3)), a.setAttribute("normal", new GI(E, 3)), a.setAttribute("uv", new GI(t, 2)), a.setIndex(s), a.computeBoundingSphere(), a.computeBoundingBox(), a;
  }
  setOrigin(A, I) {
    this.originX = A, this.originZ = I;
    for (let g of this.segs.values()) g.mesh.position.set(g.x0 - A, 0, g.z0 - I), g.mesh.updateMatrix();
  }
  update(A, I, g = 6) {
    let C = Math.floor(Math.max(JC, I - this.ahead) / Hi), Q = Math.floor((I + this.ahead) / Hi), i = 0, E = /* @__PURE__ */ new Set(), t = [];
    for (let e = C; e <= Q; e++) t.push(e);
    let o = Math.floor(I / Hi);
    t.sort((e, s) => Math.abs(e - o) - Math.abs(s - o));
    for (let e of t) {
      let s = e * Hi;
      if (s + Hi < JC) continue;
      E.add(e);
      let n = Math.abs(s + Hi / 2 - I) + Math.abs(this.fn.roadX(s) - A) * 0.5 < 500 ? 0 : 1, r = this.segs.get(e);
      if (r && r.lod === n || i >= g && r) continue;
      let c = Math.max(s, JC), h = this.buildGeometry(c, n === 0 ? 2 : 8);
      if (i++, r) r.mesh.geometry.dispose(), r.mesh.geometry = h, r.lod = n;
      else {
        let D = new cA(h, this.material);
        D.receiveShadow = true, D.matrixAutoUpdate = false;
        let l = this.fn.roadX(c);
        D.position.set(l - this.originX, 0, c - this.originZ), D.updateMatrix(), this.group.add(D), this.segs.set(e, { mesh: D, z0: c, lod: n, x0: l });
      }
    }
    for (let [e, s] of this.segs) E.has(e) || (this.group.remove(s.mesh), s.mesh.geometry.dispose(), this.segs.delete(e));
  }
};
var Kw = new TA(), Gw = new nI(), Fw = new $I(), pw = new y(), Jw = new y(), ae = class {
  constructor(A, I, g, C = 128, Q = 1) {
    this.fn = A;
    this.kinds = I;
    this.rules = g;
    this.cellSize = C;
    this.seed = Q;
    this.radius = Math.max(...I.map((i) => i.lods[i.lods.length - 1].maxDist)), I.forEach((i, E) => {
      this.kindIdx.set(i.id, E), this.meshes[E] = i.lods.map((t) => {
        let o = new WC(t.geo, i.material, t.capacity);
        return o.castShadow = t.castShadow, o.receiveShadow = true, o.count = 0, o.frustumCulled = false, o.name = i.id, this.group.add(o), o;
      });
    });
  }
  fn;
  kinds;
  rules;
  cellSize;
  seed;
  group = new WA();
  meshes = [];
  cells = /* @__PURE__ */ new Map();
  lastKey = "";
  originX = 0;
  originZ = 0;
  kindIdx = /* @__PURE__ */ new Map();
  radius;
  kindIndex = (A) => this.kindIdx.get(A) ?? -1;
  okFn = (A, I, g) => {
    let C = this.fn;
    if (I > JC - 30 && Math.abs(C.roadDist(A, I)) < UB + g) return false;
    let Q = Math.floor(I / qi);
    for (let i = Q - 1; i <= Q + 1; i++) {
      let E = C.getPads(i);
      for (let t of E) if (Ad(t, A, I, 3 + g)) return false;
    }
    return true;
  };
  cell(A, I) {
    let g = A + "," + I, C = this.cells.get(g);
    if (C) return C;
    C = [];
    let Q = new vI(gi(A, I, this.seed, 77));
    for (let i of this.rules) i(this.fn, Q, A * this.cellSize, I * this.cellSize, this.cellSize, C, this.kindIndex, this.okFn);
    if (this.cells.set(g, C), this.cells.size > 4e3) {
      for (let i of this.cells.keys()) if (this.cells.delete(i), this.cells.size < 2500) break;
    }
    return C;
  }
  setOrigin(A, I) {
    this.originX = A, this.originZ = I, this.lastKey = "";
  }
  invalidate() {
    this.cells.clear(), this.lastKey = "";
  }
  lastX = 1e9;
  lastZ = 1e9;
  step = 24;
  update(A, I) {
    let g = this.cellSize, C = Math.floor(A / g), Q = Math.floor(I / g);
    if (this.lastKey !== "" && Math.hypot(A - this.lastX, I - this.lastZ) < this.step) return;
    this.lastKey = C + "," + Q, this.lastX = A, this.lastZ = I;
    let i = Math.ceil(this.radius / g), E = this.meshes.map((t) => t.map(() => 0));
    for (let t = -i; t <= i; t++) for (let o = -i; o <= i; o++) {
      let e = C + o, s = Q + t, a = (e + 0.5) * g, n = (s + 0.5) * g;
      if (Math.max(0, Math.hypot(a - A, n - I) - g * 0.5) > this.radius) continue;
      let c = this.cell(e, s);
      for (let h of c) {
        let D = this.kinds[h.kind], l = Math.hypot(h.x - A, h.z - I), U = -1;
        for (let K = 0; K < D.lods.length; K++) if (l <= D.lods[K].maxDist) {
          U = K;
          break;
        }
        if (U < 0) continue;
        let S = this.meshes[h.kind][U], k = E[h.kind][U];
        k >= D.lods[U].capacity || (Fw.set(h.tilt * Math.cos(h.rot * 3), h.rot, h.tilt * Math.sin(h.rot * 3), "YXZ"), Gw.setFromEuler(Fw), pw.set(h.s, h.s * h.sy, h.s), Jw.set(h.x - this.originX, h.y, h.z - this.originZ), Kw.compose(Jw, Gw, pw), S.setMatrixAt(k, Kw), E[h.kind][U] = k + 1);
      }
    }
    this.meshes.forEach((t, o) => t.forEach((e, s) => {
      e.count = E[o][s], e.instanceMatrix.needsUpdate = true;
    }));
  }
  collidersNear(A, I, g, C = []) {
    let Q = this.cellSize, i = Math.floor((A - g) / Q), E = Math.floor((A + g) / Q), t = Math.floor((I - g) / Q), o = Math.floor((I + g) / Q);
    for (let e = t; e <= o; e++) for (let s = i; s <= E; s++) for (let a of this.cell(s, e)) {
      let n = this.kinds[a.kind];
      n.collider && (a.x - A) ** 2 + (a.z - I) ** 2 < g * g && C.push({ inst: a, kind: n });
    }
    return C;
  }
};
function Ad(B, A, I, g) {
  let C = A - B.x, Q = I - B.z, i = Math.cos(B.rot), E = Math.sin(B.rot);
  return Math.abs(C * i - Q * E) < B.hw + g && Math.abs(C * E + Q * i) < B.hd + g;
}
function Nw() {
  let B = (A, I, g, C, Q, i, E, t, o) => {
    for (let e = 0; e < i; e++) {
      let s = g + I.next() * Q, a = C + I.next() * Q;
      o(s, a, E) && t(s, A.height(s, a), a);
    }
  };
  return [(A, I, g, C, Q, i, E, t) => {
    let o = A.vegetation(g + Q / 2, C + Q / 2), e = A.duneMask(g + Q / 2, C + Q / 2), s = ["saguaro0", "saguaro1", "saguaro2", "saguaro3", "saguaro4", "saguaro5"].map(E), a = Math.round(o * 9 * (1 - e * 0.7) + I.next() * 2);
    B(A, I, g, C, Q, a, 4, (U, S, k) => i.push({ kind: I.pick(s), x: U, y: S - 0.05, z: k, rot: I.next() * 6.28, s: I.range(0.85, 1.35), sy: I.range(0.9, 1.1), tilt: I.range(0, 0.06) }), t);
    let n = E("barrel");
    B(A, I, g, C, Q, Math.round(o * 2.5 * (1 - e * 0.6)), 3, (U, S, k) => i.push({ kind: n, x: U, y: S - 0.03, z: k, rot: I.next() * 6.28, s: I.range(0.7, 1.3), sy: 1, tilt: 0.05 }), t);
    let r = [E("bush0"), E("bush1"), E("bush2")];
    B(A, I, g, C, Q, Math.round(4 + o * 12), 2.5, (U, S, k) => i.push({ kind: I.pick(r), x: U, y: S - 0.02, z: k, rot: I.next() * 6.28, s: I.range(0.6, 1.4), sy: I.range(0.7, 1.1), tilt: 0 }), t);
    let c = E("grass"), h = Math.round(30 + o * 70 * (1 - e * 0.5));
    for (let U = 0; U < 5; U++) {
      let S = g + I.next() * Q, k = C + I.next() * Q, K = Math.round(h / 5);
      for (let G = 0; G < K; G++) {
        let M = S + I.gauss() * 9, p = k + I.gauss() * 9;
        t(M, p, 1.2) && i.push({ kind: c, x: M, y: A.height(M, p) - 0.02, z: p, rot: I.next() * 6.28, s: I.range(0.55, 1.2), sy: I.range(0.7, 1.25), tilt: 0 });
      }
    }
    let D = [E("rock0"), E("rock1"), E("rock2"), E("rock3")];
    B(A, I, g, C, Q, 5 + I.int(0, 5), 2, (U, S, k) => i.push({ kind: I.pick(D), x: U, y: S - 0.05, z: k, rot: I.next() * 6.28, s: I.range(0.12, 0.45), sy: 1, tilt: 0.2 }), t), I.chance(0.55) && B(A, I, g, C, Q, 1 + I.int(0, 1), 4, (U, S, k) => i.push({ kind: I.pick(D), x: U, y: S - 0.15, z: k, rot: I.next() * 6.28, s: I.range(0.6, 1.6), sy: 1, tilt: 0.15 }), t), I.chance(0.06) && B(A, I, g, C, Q, 1, 6, (U, S, k) => i.push({ kind: I.pick(D), x: U, y: S - 0.5, z: k, rot: I.next() * 6.28, s: I.range(2.2, 4.5), sy: 1, tilt: 0.1 }), t);
    let l = [E("tree0"), E("tree1"), E("tree2")];
    I.chance(0.14 + o * 0.1) && B(A, I, g, C, Q, 1, 5, (U, S, k) => i.push({ kind: I.pick(l), x: U, y: S - 0.1, z: k, rot: I.next() * 6.28, s: I.range(0.8, 1.2), sy: 1, tilt: I.range(0, 0.12) }), t);
  }];
}
function dw() {
  return [(B, A, I, g, C, Q, i, E) => {
    let t = A.chance(0.55) ? A.chance(0.4) ? 2 : 1 : 0;
    for (let o = 0; o < t; o++) {
      let e = I + A.range(0.15, 0.85) * C, s = g + A.range(0.15, 0.85) * C, a = i("mesa" + A.int(0, 11)), n = A.range(35, 150) * (A.chance(0.15) ? 1.8 : 1), r = yI(n * A.range(0.55, 1.2), 30, 190);
      E(e, s, n * 2.4 + 40) && (s < JC + 400 && Math.abs(e) < 800 || Q.push({ kind: a, x: e, y: B.height(e, s) - r * 0.02, z: s, rot: A.next() * 6.28, s: n, sy: r / n, tilt: 0 }));
    }
  }];
}
function Wg(B, A = false) {
  let I = B.filter(Boolean).map((o) => (o.index, o));
  if (!I.length) return new SI();
  let g = new Set(Object.keys(I[0].attributes));
  for (let o of I) for (let e of [...g]) o.attributes[e] || g.delete(e);
  let C = I.map((o) => {
    let e = o;
    for (let s of Object.keys(e.attributes)) g.has(s) || e.deleteAttribute(s);
    return e.index || (e = e), e;
  }), Q = C.some((o) => o.index), i = C.every((o) => o.index), E = Q && !i ? C.map((o) => o.index ? o.toNonIndexed() : o) : C, t = uw(E, A);
  if (!t) throw new Error("merge failed");
  return t;
}
function cQ(B, A, I, g = 1) {
  let C = new uI(B, A, I), Q = C.attributes.uv, i = C.attributes.normal, E = C.attributes.position;
  for (let t = 0; t < Q.count; t++) {
    let o = Math.abs(i.getX(t)), e = Math.abs(i.getY(t)), s = E.getX(t), a = E.getY(t), n = E.getZ(t), r, c;
    e > 0.5 ? (r = s, c = n) : o > 0.5 ? (r = n, c = a) : (r = s, c = a), Q.setXY(t, r / g, c / g);
  }
  return C;
}
function rc(B, A, I, g, C = 0, Q = 0, i = 0, E = 1, t = 1, o = 1) {
  let e = new TA().compose(new y(A, I, g), new nI().setFromEuler(new $I(C, Q, i, "YXZ")), new y(E, t, o));
  return B.applyMatrix4(e), B;
}
function fw(B, A) {
  let I = A instanceof nA ? A : new nA(A), g = B.attributes.position.count, C = new Float32Array(g * 3);
  for (let Q = 0; Q < g; Q++) C[Q * 3] = I.r, C[Q * 3 + 1] = I.g, C[Q * 3 + 2] = I.b;
  return B.setAttribute("color", new GI(C, 3)), B;
}
function Vg(B, A, I = 12, g = {}) {
  let C = B.length, Q = [];
  for (let S = 0; S < C; S++) {
    let k = B[Math.max(0, S - 1)], K = B[Math.min(C - 1, S + 1)];
    Q.push(K.clone().sub(k).normalize());
  }
  let i = [], E = [], t = Math.abs(Q[0].y) < 0.9 ? new y(0, 1, 0) : new y(1, 0, 0), o = new y().crossVectors(Q[0], t).normalize();
  for (let S = 0; S < C; S++) {
    if (S > 0) {
      let k = new y().crossVectors(Q[S - 1], Q[S]), K = k.length();
      if (K > 1e-6) {
        k.divideScalar(K);
        let G = Math.acos(Ai.clamp(Q[S - 1].dot(Q[S]), -1, 1));
        o = o.clone().applyAxisAngle(k, G);
      }
    }
    i.push(o.clone()), E.push(new y().crossVectors(Q[S], o).normalize());
  }
  let e = [], s = [], a = [], n = 0, r = g.vTile ?? 1, c = (S, k, K, G, M) => {
    let p = G ? B[S].clone().add(G) : B[S];
    for (let d = 0; d <= I; d++) {
      let R = d / I * Math.PI * 2, u = A(k, R) * K, q = i[S].clone().multiplyScalar(Math.cos(R)).addScaledVector(E[S], Math.sin(R));
      e.push(p.x + q.x * u, p.y + q.y * u, p.z + q.z * u), s.push(d / I, M / r);
    }
  }, h = 0, D = g.capRings ?? 4;
  if (g.capStart) for (let S = D; S >= 1; S--) {
    let k = S / D * Math.PI * 0.5, K = A(0, 0);
    c(0, 0, Math.cos(k) + 1e-3, Q[0].clone().multiplyScalar(-Math.sin(k) * K), -Math.sin(k) * K), h++;
  }
  for (let S = 0; S < C; S++) S > 0 && (n += B[S].distanceTo(B[S - 1])), c(S, S / (C - 1), 1, null, n), h++;
  if (g.capEnd) {
    let S = A(1, 0);
    for (let k = 1; k <= D; k++) {
      let K = k / D * Math.PI * 0.5;
      c(C - 1, 1, Math.cos(K) + 1e-3, Q[C - 1].clone().multiplyScalar(Math.sin(K) * S), n + Math.sin(K) * S), h++;
    }
  }
  let l = I + 1;
  for (let S = 0; S < h - 1; S++) for (let k = 0; k < I; k++) {
    let K = S * l + k, G = K + 1, M = K + l, p = M + 1;
    a.push(K, G, M, G, p, M);
  }
  let U = new SI();
  return U.setAttribute("position", new XA(e, 3)), U.setAttribute("uv", new XA(s, 2)), U.setIndex(a), U.computeVertexNormals(), U;
}
function hc(B, A) {
  return new DC(B, false, "centripetal").getPoints(A);
}
function AB(B, A = 24, I = 0, g = Math.PI * 2) {
  let C = B.map(([i, E]) => new eA(Math.max(i, 1e-4), E));
  return new sQ(C, A, I, g);
}
function Yw(B, A, I = 0, g = 2, C = 12) {
  let Q = new lB(B, { depth: A, bevelEnabled: I > 0, bevelThickness: I, bevelSize: I, bevelSegments: g, curveSegments: C });
  return Q.translate(0, 0, -A / 2), Q;
}
function jg(B, A) {
  let I = document.createElement("canvas");
  return I.width = B, I.height = A, [I, I.getContext("2d")];
}
function Tg(B, A = true, I = false) {
  let g = new Mo(B);
  return A && (g.colorSpace = mg), g.anisotropy = 8, I && (g.wrapS = g.wrapT = kC), g.needsUpdate = true, g;
}
function ne(B, A, I, g = 0.5, C = 1) {
  let Q = C * 9301 + 49297, i = () => (Q = (Q * 9301 + 49297) % 233280) / 233280;
  B.save();
  for (let t = 0; t < 260 * g; t++) {
    let o = i() * A, e = i() * I, s = i() * (A / 40) + 1;
    B.fillStyle = `rgba(${90 + i() * 60},${60 + i() * 40},${30 + i() * 20},${0.08 + i() * 0.25 * g})`, B.beginPath(), B.ellipse(o, e, s, s * (0.4 + i()), i() * 3, 0, Math.PI * 2), B.fill();
  }
  let E = B.createLinearGradient(0, 0, 0, I);
  E.addColorStop(0, `rgba(255,240,210,${0.08 * g})`), E.addColorStop(1, `rgba(90,60,30,${0.22 * g})`), B.fillStyle = E, B.fillRect(0, 0, A, I);
  for (let t = 0; t < 40 * g; t++) {
    B.strokeStyle = `rgba(255,255,255,${0.05 + i() * 0.1})`, B.lineWidth = i() * 1.5, B.beginPath();
    let o = i() * A, e = i() * I;
    B.moveTo(o, e), B.lineTo(o + (i() - 0.5) * A * 0.3, e + (i() - 0.5) * I * 0.1), B.stroke();
  }
  B.restore();
}
var NC = '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', KB = '"Arial Narrow", "Roboto Condensed", "Segoe UI", Arial, sans-serif', Lw = /* @__PURE__ */ new Map();
function _n(B, A) {
  let I = Lw.get(B);
  return I || (I = A(), Lw.set(B, I)), I;
}
function mw(B, A = {}) {
  let I = A.w ?? 512, g = A.h ?? 256, [C, Q] = jg(I, g);
  if (Q.fillStyle = A.bg ?? "#1f5a3a", Q.fillRect(0, 0, I, g), A.border !== false) {
    Q.strokeStyle = A.fg ?? "#f2f2ec", Q.lineWidth = g * 0.035;
    let t = g * 0.06;
    Q.beginPath(), Q.roundRect(t, t, I - 2 * t, g - 2 * t, g * 0.07), Q.stroke();
  }
  Q.fillStyle = A.fg ?? "#f2f2ec", Q.textAlign = "center", Q.textBaseline = "middle";
  let i = B.length, E = Math.min(g * (i === 1 ? 0.55 : 0.34), I * 1.6 / Math.max(...B.map((t) => t.length), 3));
  return Q.font = `700 ${E}px ${A.font ?? KB}`, B.forEach((t, o) => Q.fillText(t, I / 2, g / 2 + (o - (i - 1) / 2) * E * 1.12)), ne(Q, I, g, 0.55, A.seed ?? B.join("").length), Tg(C);
}
var Tw = 48, re = Tw * 10, qw = 9.6, bw = [-1.02, -0.38, 0.38, 1.02], he = 7.85;
function Hw(B) {
  let A = [], I = new VA(0.105, 0.15, 8.6, B ? 10 : 6, 1), g = I.attributes.uv;
  for (let Q = 0; Q < g.count; Q++) g.setY(Q, g.getY(Q) * 4.3);
  I.translate(0, 4.3 - 0.35, 0), A.push(I);
  let C = new uI(2.5, 0.11, 0.12);
  if (C.translate(0, he, 0.13), A.push(C), B) {
    for (let i of [-1, 1]) {
      let E = new uI(0.05, 0.9, 0.05);
      E.rotateZ(i * 0.75), E.translate(i * 0.33, he - 0.33, 0.13), A.push(E);
    }
    let Q = new VA(0.1, 0.105, 0.06, 8);
    Q.translate(0, 8.25 - 0.35 + 0.03, 0), A.push(Q);
  }
  return Wg(A.map((Q) => Q.index ? Q.toNonIndexed() : Q));
}
function Id() {
  let B = [];
  for (let A of bw) {
    let I = new VA(0.012, 0.012, 0.1, 5);
    I.translate(A, he + 0.1, 0.13);
    let g = new sQ([[1e-3, 0], [0.045, 0], [0.05, 0.03], [0.036, 0.05], [0.042, 0.075], [0.03, 0.1], [0.022, 0.13], [1e-3, 0.135]].map(([C, Q]) => new eA(C, Q)), 8);
    g.translate(A, he + 0.12, 0.13), B.push(I.toNonIndexed(), g.toNonIndexed());
  }
  return Wg(B);
}
var Wn = class {
  constructor(A, I, g) {
    this.fn = A;
    this.mats = I;
    this.seed = g;
    this.poleMesh = new WC(Hw(true), I.pole, 200), this.poleMesh.castShadow = true, this.poleLow = new WC(Hw(false), I.pole, 400), this.insMesh = new WC(Id(), I.ceramic, 200);
    for (let C of [this.poleMesh, this.poleLow, this.insMesh]) C.count = 0, C.frustumCulled = false, C.receiveShadow = true, this.group.add(C);
  }
  fn;
  mats;
  seed;
  group = new WA();
  poleMesh;
  poleLow;
  insMesh;
  chunks = /* @__PURE__ */ new Map();
  originX = 0;
  originZ = 0;
  range = 2600;
  lastKey = "";
  signMats = /* @__PURE__ */ new Map();
  poleFrame(A) {
    let I = this.fn, g = I.roadDX(A), C = Math.hypot(g, 1), Q = g / C, i = 1 / C, E = -i, t = Q, e = I.roadX(A) + E * qw, s = A + t * qw, a = I.height(e, s);
    return { x: e, y: a, z: s, yaw: Math.atan2(Q, i) };
  }
  buildChunk(A) {
    let I = new vI(gi(A, this.seed, 31)), g = [], C = [], Q = [], i = A * re;
    for (let a = 0; a <= 10; a++) {
      let n = i + a * Tw;
      if (n < JC + 10) {
        Q.push([]);
        continue;
      }
      let r = this.poleFrame(n), c = new $I(I.range(-0.04, 0.04), r.yaw + I.range(-0.05, 0.05), I.range(-0.035, 0.035), "YXZ"), h = new TA().compose(new y(r.x, r.y, r.z), new nI().setFromEuler(c), new y(1, 1, 1));
      a < 10 && (g.push(h), C.push({ x: r.x, y: r.y, z: r.z })), Q.push(bw.map((D) => new y(D, he + 0.24, 0.13).applyMatrix4(h)));
    }
    let E = [], t = this.fn.roadX(i), o = i;
    for (let a = 0; a < 10; a++) {
      let n = Q[a], r = Q[a + 1];
      if (!(!n.length || !r.length)) for (let c = 0; c < n.length; c++) {
        let h = [], D = 0.55 + (a * 7 + c * 3) % 5 * 0.06;
        for (let l = 0; l <= 12; l++) {
          let U = l / 12, S = n[c].clone().lerp(r[c], U);
          S.y -= D * 4 * U * (1 - U), S.x -= t, S.z -= o, h.push(S);
        }
        E.push(Vg(h, () => 0.011, 3));
      }
    }
    let e = null;
    E.length && (e = new cA(Wg(E), this.mats.wire), e.userData.base = [t, o], e.position.set(t - this.originX, 0, o - this.originZ), e.matrixAutoUpdate = false, e.updateMatrix(), this.group.add(e));
    let s = [];
    for (let a = Math.ceil(i / 1e3) * 1e3; a < i + re; a += 1e3) a <= 0 || s.push(this.makeKmPost(a));
    return { poles: g, wires: e, signs: s, worldPoles: C };
  }
  signMat(A) {
    let I = this.signMats.get(A);
    return I || (I = new oI({ map: mw([A], { w: 256, h: 160 }), roughness: 0.6, metalness: 0.2 }), this.signMats.set(A, I)), I;
  }
  makeKmPost(A) {
    let I = this.fn, g = I.roadDX(A), C = Math.hypot(g, 1), Q = g / C, i = 1 / C, E = -i, t = Q, o = I.roadX(A) + E * 5.6, e = A + t * 5.6, s = new WA(), a = new cA(rc(new uI(0.08, 1.6, 0.06), 0, 0.8, 0), this.mats.painted("#d8d8d0", 0.4)), n = new cA(new PI(0.62, 0.39), this.signMat(String(A / 1e3)));
    n.position.set(0, 1.45, -0.035), n.rotation.y = Math.PI;
    let r = new cA(new uI(0.64, 0.41, 0.02), this.mats.metalDark);
    return r.position.set(0, 1.45, -0.02), a.castShadow = true, s.add(a, r, n), s.position.set(o - this.originX, I.height(o, e), e - this.originZ), s.userData.world = [o, e], s.rotation.y = Math.atan2(Q, i), this.group.add(s), s;
  }
  setOrigin(A, I) {
    this.originX = A, this.originZ = I;
    for (let g of this.chunks.values()) {
      if (g.wires) {
        let [C, Q] = g.wires.userData.base;
        g.wires.position.set(C - A, 0, Q - I), g.wires.updateMatrix();
      }
      for (let C of g.signs) {
        let [Q, i] = C.userData.world;
        C.position.x = Q - A, C.position.z = i - I;
      }
    }
    this.lastKey = "";
  }
  polesNear(A, I, g) {
    let C = [];
    for (let Q of this.chunks.values()) for (let i of Q.worldPoles) (i.x - A) ** 2 + (i.z - I) ** 2 < g * g && C.push(i);
    return C;
  }
  update(A, I) {
    let g = Math.floor((I - this.range) / re), C = Math.floor((I + this.range) / re), Q = g + ":" + Math.floor(I / 60);
    if (Q === this.lastKey) return;
    this.lastKey = Q;
    for (let o = g; o <= C; o++) !this.chunks.has(o) && (o + 1) * re > JC && this.chunks.set(o, this.buildChunk(o));
    for (let [o, e] of this.chunks) if (o < g - 1 || o > C + 1) {
      e.wires && (this.group.remove(e.wires), e.wires.geometry.dispose());
      for (let s of e.signs) this.group.remove(s);
      this.chunks.delete(o);
    }
    let i = 0, E = 0, t = new TA();
    for (let o of this.chunks.values()) for (let e of o.poles) t.copy(e), t.elements[12] -= this.originX, t.elements[14] -= this.originZ, Math.abs(e.elements[14] - I) < 450 && i < 200 ? (this.poleMesh.setMatrixAt(i, t), this.insMesh.setMatrixAt(i, t), i++) : E < 400 && this.poleLow.setMatrixAt(E++, t);
    this.poleMesh.count = i, this.insMesh.count = i, this.poleLow.count = E, this.poleMesh.instanceMatrix.needsUpdate = true, this.insMesh.instanceMatrix.needsUpdate = true, this.poleLow.instanceMatrix.needsUpdate = true;
  }
};
var Vn = class {
  p = new Uint8Array(512);
  constructor(A) {
    let I = new vI(A), g = new Uint8Array(256);
    for (let C = 0; C < 256; C++) g[C] = C;
    for (let C = 255; C > 0; C--) {
      let Q = Math.floor(I.next() * (C + 1)), i = g[C];
      g[C] = g[Q], g[Q] = i;
    }
    for (let C = 0; C < 512; C++) this.p[C] = g[C & 255];
  }
  h(A, I, g) {
    let C = this.p;
    return C[C[C[A & 255] + I & 255] + g & 255] / 255;
  }
  noise(A, I, g) {
    let C = Math.floor(A), Q = Math.floor(I), i = Math.floor(g), E = A - C, t = I - Q, o = g - i, e = E * E * (3 - 2 * E), s = t * t * (3 - 2 * t), a = o * o * (3 - 2 * o), n = (r, c, h) => r + (c - r) * h;
    return n(n(n(this.h(C, Q, i), this.h(C + 1, Q, i), e), n(this.h(C, Q + 1, i), this.h(C + 1, Q + 1, i), e), s), n(n(this.h(C, Q, i + 1), this.h(C + 1, Q, i + 1), e), n(this.h(C, Q + 1, i + 1), this.h(C + 1, Q + 1, i + 1), e), s), a) * 2 - 1;
  }
  fbm(A, I, g, C = 4) {
    let Q = 0, i = 0.5, E = 1, t = 0;
    for (let o = 0; o < C; o++) Q += i * this.noise(A * E, I * E, g * E), t += i, i *= 0.5, E *= 2.03;
    return Q / t;
  }
};
function jn(B, A = 28, I = 12, g = 14) {
  let C = new vI(B), Q = C.range(2.4, 5.6), i = C.range(0.16, 0.26) * (0.8 + Q / 12), E = 14, t = (D) => 1 - 0.075 * Math.cos(D * E), o = new y(C.range(-0.15, 0.15), 0, C.range(-0.15, 0.15)), e = [], s = I, a = A < 8;
  for (let D = 0; D <= s; D++) {
    let l = D / s;
    e.push(new y(o.x * l * l, -0.3 + l * (Q + 0.3), o.z * l * l));
  }
  let n = a ? (D) => 1 : t, r = [Vg(e, (D, l) => i * n(l) * (1 - 0.1 * D), A, { capEnd: true, capRings: a ? 1 : 5 })], c = C.weighted([[0, 2], [1, 4], [2, 5], [3, 3], [4, 1]]), h = C.next() * Math.PI * 2;
  for (let D = 0; D < c; D++) {
    let l = h + D / Math.max(c, 1) * Math.PI * 2 + C.range(-0.4, 0.4), U = new y(Math.cos(l), 0, Math.sin(l)), S = Q * C.range(0.3, 0.65), k = C.range(0.28, 0.55), K = C.range(0.7, Math.min(1.9, Q - S + 0.4)), G = i * C.range(0.62, 0.8), M = new y(o.x * (S / Q) ** 2, S, o.z * (S / Q) ** 2), p = [M.clone(), M.clone().addScaledVector(U, i * 0.9 + k * 0.45).add(new y(0, -0.04, 0)), M.clone().addScaledVector(U, i + k).add(new y(0, 0.22, 0)), M.clone().addScaledVector(U, i + k * 1.05).add(new y(0, K * 0.6, 0)), M.clone().addScaledVector(U, i + k * 1.02).add(new y(0, K, 0))], d = hc(p, g);
    r.push(Vg(d, (R, u) => G * n(u) * (R < 0.15 ? Ag(0.9, 1, R / 0.15) : 1), a ? A : Math.max(Math.min(10, A), Math.round(A * 0.75)), { capEnd: true, capRings: a ? 1 : 4 }));
  }
  return Wg(r);
}
function Dc(B, A = 28) {
  let I = new vI(B), g = I.range(0.35, 0.8), C = I.range(0.2, 0.32), Q = [], i = A < 16 ? 4 : 8;
  for (let E = 0; E <= i; E++) Q.push(new y(0, -0.05 + E / i * g, 0));
  return Vg(Q, (E, t) => C * Math.sin(Math.PI * (0.25 + 0.6 * E)) * (A < 16 ? 1 : 1 - 0.09 * Math.cos(t * 14)), A, { capEnd: true, capRings: A < 16 ? 1 : 4 });
}
function xw() {
  let B = [];
  for (let g = 0; g < 3; g++) {
    let C = new PI(1.1, 0.85, 1, 2);
    C.translate(0, 0.42, 0), C.rotateY(g / 3 * Math.PI), B.push(C);
  }
  let A = Wg(B), I = A.attributes.normal;
  for (let g = 0; g < I.count; g++) I.setXYZ(g, I.getX(g) * 0.3, 0.9, I.getZ(g) * 0.3);
  return A;
}
function cc(B, A = 0) {
  let I = new vI(B), g = A ? 3 : 4, C = A ? 1 : 2, Q = [], i = I.range(0.5, 1.1), E = I.int(9, 15), t = new nA("#5a4a3a"), o = new nA("#8a7a64"), e = (s, a, n, r, c) => {
    let h = s.clone().addScaledVector(a, n), D = s.clone().lerp(h, 0.5).add(new y(I.range(-0.05, 0.05), I.range(0, 0.04), I.range(-0.05, 0.05)).multiplyScalar(n)), l = Vg(A ? [s, h] : [s, D, h], (U) => r * (A ? 1.6 : 1) * (1 - 0.7 * U), g);
    if (fw(l, t.clone().lerp(o, I.next())), Q.push(l), c > 2 - C) {
      let U = I.int(1, 3);
      for (let S = 0; S < U; S++) {
        let k = a.clone().add(new y(I.range(-0.7, 0.7), I.range(-0.1, 0.5), I.range(-0.7, 0.7))).normalize();
        e(s.clone().lerp(h, I.range(0.4, 0.9)), k, n * I.range(0.4, 0.65), r * 0.6, c - 1);
      }
    }
  };
  for (let s = 0; s < E; s++) {
    let a = I.next() * Math.PI * 2, n = I.range(0.45, 1.2), r = new y(Math.cos(a), n, Math.sin(a)).normalize();
    e(new y(I.range(-0.05, 0.05), -0.05, I.range(-0.05, 0.05)), r, i * I.range(0.55, 1), 0.014, 2);
  }
  return Wg(Q);
}
var gd = ["#b07a58", "#a86e4e", "#c49474", "#9a6448", "#b88a6a", "#8e5e46"];
function Xn(B, A = 3) {
  let I = new vI(B), g = new Vn(B), C = new fo(1, A);
  C.deleteAttribute("uv"), C.deleteAttribute("normal"), C = bi(C), C.computeVertexNormals();
  let Q = C.attributes.position, i = I.range(0.8, 1.4), E = I.range(0.45, 0.85), t = I.range(0.8, 1.3), o = I.range(0.2, 0.6), e = new y();
  for (let n = 0; n < Q.count; n++) {
    e.fromBufferAttribute(Q, n);
    let r = 1 + g.fbm(e.x * 1.3 + 5, e.y * 1.3, e.z * 1.3, 4) * 0.45 + g.noise(e.x * 4, e.y * 4, e.z * 4) * 0.06;
    e.multiplyScalar(r), e.y > o && (e.y = o + (e.y - o) * 0.35), e.y < -0.35 && (e.y = -0.35 + (e.y + 0.35) * 0.3), Q.setXYZ(n, e.x * i, e.y * E, e.z * t);
  }
  C.computeVertexNormals();
  let s = new nA(I.pick(gd)), a = new Float32Array(Q.count * 3);
  for (let n = 0; n < Q.count; n++) {
    e.fromBufferAttribute(Q, n);
    let r = 0.9 + 0.2 * Math.sin(e.y * 9 + g.noise(e.x * 2, e.y * 2, e.z * 2) * 2), c = yI(0.55 + (e.y / E + 0.35) * 0.55, 0.5, 1.05);
    a[n * 3] = s.r * r * c, a[n * 3 + 1] = s.g * r * c, a[n * 3 + 2] = s.b * r * c;
  }
  return C.setAttribute("color", new GI(a, 3)), C;
}
function lc(B) {
  let A = new vI(B), I = [], g = A.range(2.2, 4.2), C = A.range(0.1, 0.18), Q = (i, E, t, o, e) => {
    let s = [i.clone()], a = i.clone(), n = E.clone();
    for (let c = 1; c <= 3; c++) n = n.clone().add(new y(A.range(-0.35, 0.35), A.range(-0.1, 0.25), A.range(-0.35, 0.35))).normalize(), a = a.clone().addScaledVector(n, t / 3), s.push(a);
    let r = hc(s, 8);
    if (I.push(Vg(r, (c) => o * (1 - 0.8 * c) + 4e-3, e > 1 ? 7 : 5, { capEnd: true, capRings: 2, vTile: 1.5 })), e > 0) {
      let c = A.int(2, 3);
      for (let h = 0; h < c; h++) {
        let D = A.range(0.35, 0.9), l = Math.floor(D * (r.length - 1)), U = n.clone().add(new y(A.range(-1, 1), A.range(0.1, 0.9), A.range(-1, 1))).normalize();
        Q(r[l], U, t * A.range(0.4, 0.65), o * (1 - 0.8 * D) * 0.75, e - 1);
      }
    }
  };
  return Q(new y(0, -0.2, 0), new y(A.range(-0.2, 0.2), 1, A.range(-0.2, 0.2)).normalize(), g, C, 3), Wg(I);
}
var zE = ["#9a4a30", "#b8653e", "#c98a62", "#a8563a", "#d4a47c", "#8c4430", "#bf7650", "#c4906a"];
function Sc(B, A, I = 0) {
  let g = new vI(B), C = new Vn(B * 3 + 1), Q;
  switch (A) {
    case "mesa":
      Q = [[-0.12, 2.3], [0, 2.1], [0.06, 1.8], [0.16, 1.45], [0.26, 1.2], [0.32, 1.08], [0.6, 1.03], [0.88, 1], [0.9, 0.97], [0.91, 0.9], [0.985, 0.88], [1, 0.8]];
      break;
    case "stack":
      Q = [[-0.1, 2], [0, 1.85], [0.07, 1.6], [0.14, 1.42], [0.16, 1.4], [0.17, 1.18], [0.4, 1.12], [0.42, 1.1], [0.43, 0.9], [0.66, 0.86], [0.68, 0.85], [0.69, 0.66], [0.9, 0.62], [0.92, 0.6], [0.93, 0.48], [0.99, 0.46], [1, 0.36]];
      break;
    case "spire":
      Q = [[-0.1, 1.6], [0, 1.45], [0.1, 1.05], [0.2, 0.75], [0.3, 0.6], [0.6, 0.52], [0.8, 0.46], [0.82, 0.5], [0.95, 0.45], [1, 0.3]];
      break;
    case "hoodoo":
      Q = [[-0.1, 1.5], [0, 1.35], [0.12, 0.95], [0.25, 0.6], [0.55, 0.45], [0.72, 0.42], [0.75, 0.75], [0.78, 0.82], [0.92, 0.8], [1, 0.55]];
      break;
    default:
      Q = [[-0.12, 2], [0, 1.85], [0.08, 1.5], [0.2, 1.15], [0.28, 1], [0.55, 0.95], [0.82, 0.92], [0.84, 0.9], [0.85, 0.8], [0.97, 0.76], [1, 0.62]];
  }
  let i = [], E = 0;
  for (let G = 0; G < Q.length - 1; G++) {
    let [M, p] = Q[G], [d, R] = Q[G + 1], u = Math.abs(d - M) < 0.015;
    u && E++;
    let q = u ? 1 : Math.max(I ? 1 : 2, Math.ceil((d - M) / (I ? 0.08 : 0.035)));
    for (let L = 0; L < q; L++) {
      let b = L / q;
      i.push([Ag(M, d, b), Ag(p, R, b), E]);
    }
  }
  i.push([Q[Q.length - 1][0], Q[Q.length - 1][1], E]);
  let t = I ? 36 : 80, o = g.next() * 100, e = (G, M) => {
    let p = Math.cos(G), d = Math.sin(G);
    return 1 + C.fbm(p * 1.2 + o, d * 1.2, M * 0.35, 4) * 0.42 + C.noise(p * 3.2, d * 3.2 + o, M) * 0.07;
  }, s = [], a = [], n = new nA("#c9a07a"), r = new nA(), c = (G, M, p, d) => {
    let R = G * 11 + C.noise(M * 2, G * 3, p * 2) * 0.8, u = Math.floor(R), q = Math.sin(u * 127.1 + B) * 43758.5453 % 1, L = new nA(zE[Math.floor(Math.abs(q) * zE.length) % zE.length]), b = R - u, W = new nA(zE[Math.floor(Math.abs(Math.sin((u + 1) * 127.1 + B) * 43758.5453 % 1) * zE.length) % zE.length]);
    L.lerp(W, Fg(0.85, 1, b) * 0.6);
    let j = 0.9 + 0.12 * C.noise(M * 6, G * 0.5, p * 6);
    return L.multiplyScalar(j), r.copy(L).lerp(n, d), r;
  };
  for (let G = 0; G < i.length; G++) {
    let [M, p, d] = i[G];
    for (let R = 0; R <= t; R++) {
      let u = R / t * Math.PI * 2, q = e(u, d * 0.9 + (M > 0.3 ? 0.4 : 0)), L = 1 + C.noise(Math.cos(u) * 9, M * 6, Math.sin(u) * 9) * 0.05 * Fg(0.15, 0.4, M), b = p * q * L, W = Math.cos(u) * b, j = Math.sin(u) * b;
      s.push(W, M, j);
      let oA = yI((0.22 - M) / 0.18, 0, 1) * (0.55 + 0.35 * C.noise(W * 3, 0, j * 3)), H = c(M, W, j, oA), O = 0.72 + 0.28 * Fg(-0.05, 0.4, M);
      a.push(H.r * O, H.g * O, H.b * O);
    }
  }
  let h = i[i.length - 1][0], D = s.length / 3;
  s.push(0, h + 4e-3, 0);
  let l = c(h, 0, 0, 0.35);
  a.push(l.r, l.g, l.b);
  let U = [], S = t + 1;
  for (let G = 0; G < i.length - 1; G++) for (let M = 0; M < t; M++) {
    let p = G * S + M, d = p + 1, R = p + S, u = R + 1;
    U.push(p, R, d, d, R, u);
  }
  let k = (i.length - 1) * S;
  for (let G = 0; G < t; G++) U.push(k + G, D, k + G + 1);
  let K = new SI();
  return K.setAttribute("position", new XA(s, 3)), K.setAttribute("color", new XA(a, 3)), K.setIndex(U), K.computeVertexNormals(), K;
}
var zn = class {
  constructor(A, I, g) {
    this.mats = I;
    this.fn = new Pn(A), this.terrain = new Fn(this.fn, cw(I.tex)), this.terrain.viewRadius = g >= 2 ? 4200 : 3e3, this.road = new Zn(this.fn, Uw(I.tex));
    let C = [], Q = g >= 2;
    for (let t = 0; t < 6; t++) C.push({ id: "saguaro" + t, material: I.cactus, collider: { r: 0.28, h: 4 }, lods: [{ geo: jn(100 + t, 28), maxDist: 95, castShadow: true, capacity: 400 }, { geo: jn(100 + t, 9, 6, 6), maxDist: Q ? 380 : 260, castShadow: false, capacity: 1500 }, { geo: jn(100 + t, 5, 3, 3), maxDist: Q ? 1400 : 900, castShadow: false, capacity: 3e3 }] });
    C.push({ id: "barrel", material: I.cactus, collider: { r: 0.3, h: 0.7 }, lods: [{ geo: Dc(5), maxDist: 90, castShadow: true, capacity: 600 }, { geo: Dc(5, 10), maxDist: 300, castShadow: false, capacity: 2e3 }] });
    for (let t = 0; t < 3; t++) C.push({ id: "bush" + t, material: I.bush, lods: [{ geo: cc(200 + t), maxDist: 70, castShadow: true, capacity: 900 }, { geo: cc(200 + t, 1), maxDist: Q ? 340 : 230, castShadow: false, capacity: 4e3 }] });
    C.push({ id: "grass", material: I.grass, lods: [{ geo: xw(), maxDist: Q ? 190 : 120, castShadow: false, capacity: 12e3 }] });
    for (let t = 0; t < 4; t++) C.push({ id: "rock" + t, material: I.rock, collider: { r: 0.85, h: 0.8 }, lods: [{ geo: Xn(300 + t, 3), maxDist: 95, castShadow: true, capacity: 1200 }, { geo: Xn(300 + t, 2), maxDist: 260, castShadow: false, capacity: 3e3 }, { geo: Xn(300 + t, 1), maxDist: Q ? 800 : 500, castShadow: false, capacity: 4e3 }] });
    for (let t = 0; t < 3; t++) C.push({ id: "tree" + t, material: I.deadWood, collider: { r: 0.18, h: 3 }, lods: [{ geo: lc(400 + t), maxDist: 110, castShadow: true, capacity: 200 }, { geo: lc(400 + t), maxDist: 900, castShadow: false, capacity: 600 }] });
    this.propKinds = C, this.scatter = new ae(this.fn, C, Nw(), 128, A);
    let i = ["butte", "mesa", "stack", "spire", "hoodoo", "stack", "butte", "mesa", "stack", "butte", "hoodoo", "mesa"], E = [];
    for (let t = 0; t < 12; t++) E.push({ id: "mesa" + t, material: I.rock, lods: [{ geo: Sc(500 + t + A * 13, i[t]), maxDist: 1600, castShadow: false, capacity: 20 }, { geo: Sc(500 + t + A * 13, i[t], 1), maxDist: Q ? 7e3 : 5e3, castShadow: false, capacity: 60 }] });
    this.mesas = new ae(this.fn, E, dw(), 1024, A), this.mesas.step = 96, this.roadside = new Wn(this.fn, I, A), this.group.add(this.terrain.group, this.road.group, this.scatter.group, this.mesas.group, this.roadside.group);
  }
  mats;
  group = new WA();
  fn;
  terrain;
  road;
  scatter;
  mesas;
  roadside;
  originX = 0;
  originZ = 0;
  propKinds;
  setOrigin(A, I) {
    this.originX = A, this.originZ = I, this.terrain.setOrigin(A, I), this.road.setOrigin(A, I), this.scatter.setOrigin(A, I), this.mesas.setOrigin(A, I), this.roadside.setOrigin(A, I), kB.uOriginMod.value.set(nc(A, 2048), nc(I, 2048));
  }
  update(A, I, g, C, Q = false) {
    this.terrain.update(A, I, g, C, Q), this.road.update(A, g, Q ? 1e9 : 3), this.scatter.update(A, g), this.mesas.update(A, g), this.roadside.update(A, g);
  }
};
var xi = class {
  constructor(A) {
    this.m = A;
  }
  m;
  geos = /* @__PURE__ */ new Map();
  cols = [];
  doors = [];
  loot = [];
  lights = [];
  interact = [];
  wrecks = [];
  items = [];
  extra = [];
  interior = [];
  baseY = 0;
  add(A, I) {
    let g = this.geos.get(A);
    g || this.geos.set(A, g = []);
    let C = I.index ? I.toNonIndexed() : I;
    C.attributes.uv || C.setAttribute("uv", new XA(new Float32Array(C.attributes.position.count * 2), 2)), C.attributes.normal || C.computeVertexNormals();
    for (let Q of Object.keys(C.attributes)) ["position", "normal", "uv"].includes(Q) || C.deleteAttribute(Q);
    g.push(C);
  }
  col(A, I, g, C, Q, i, E = 0) {
    this.cols.push({ hx: A, hy: I, hz: g, x: C, y: Q, z: i, ry: E });
  }
  box(A, I, g, C, Q, i, E, t = 0, o = true, e = 1) {
    let s = cQ(I, g, C, e);
    s.rotateY(t), s.translate(Q, i, E), this.add(A, s), o && this.col(I / 2, g / 2, C / 2, Q, i, E, t);
  }
  wall(A, I, g, C, Q, i, E, t = [], o = 0, e = 2, s) {
    let a = Math.hypot(C - I, Q - g), n = (C - I) / a, r = (Q - g) / a, c = Math.atan2(-r, n), h = (k) => [I + n * k, g + r * k], D = (k, K, G, M, p = true) => {
      if (K - k < 0.01 || M - G < 0.01) return;
      let [d, R] = h((k + K) / 2);
      this.box(A, K - k, M - G, E, d, o + (G + M) / 2, R, c, p, e);
    }, l = [...t].sort((k, K) => k.at - K.at), U = 0, S = s ?? this.m.woodLight;
    for (let k of l) {
      let K = k.at - k.w / 2, G = k.at + k.w / 2;
      D(U, K, 0, i), k.y0 > 0 && D(K, G, 0, k.y0), k.y1 < i && D(K, G, k.y1, i);
      let M = 0.07, [p, d] = h(k.at), R = (u, q, L, b) => {
        let [W, j] = h(L);
        this.box(S, u, q, E + 0.04, W, o + b, j, c, false, 1);
      };
      if (R(M, k.y1 - k.y0, K + M / 2, (k.y0 + k.y1) / 2), R(M, k.y1 - k.y0, G - M / 2, (k.y0 + k.y1) / 2), R(k.w, M, k.at, k.y1 - M / 2), k.kind === "window") {
        R(k.w + 0.1, M, k.at, k.y0 + M / 2), R(0.035, k.y1 - k.y0, k.at, (k.y0 + k.y1) / 2), R(k.w, 0.035, k.at, (k.y0 + k.y1) / 2);
        let u = new PI(k.w - 0.1, k.y1 - k.y0 - 0.1);
        u.rotateY(c), u.translate(p, o + (k.y0 + k.y1) / 2, d), this.add(this.m.glassDirty, u), this.col(k.w / 2, (k.y1 - k.y0) / 2, E / 2, p, o + (k.y0 + k.y1) / 2, d, c);
      } else if (k.kind === "door" || k.kind === "gate") {
        let u = k.doorMat ?? this.m.woodDark;
        if (k.double) {
          let q = k.w / 2, [L, b] = h(K), [W, j] = h(G);
          this.doors.push({ x: L, y: o + k.y0, z: b, w: q - 0.01, h: k.y1 - k.y0 - 0.02, t: 0.05, ry: c, hinge: "l", mat: u, open: 1.75, kind: k.kind }), this.doors.push({ x: W, y: o + k.y0, z: j, w: q - 0.01, h: k.y1 - k.y0 - 0.02, t: 0.05, ry: c, hinge: "r", mat: u, open: 1.75, kind: k.kind });
        } else {
          let q = k.hinge ?? "l", [L, b] = h(q === "l" ? K + 0.02 : G - 0.02);
          this.doors.push({ x: L, y: o + k.y0, z: b, w: k.w - 0.04, h: k.y1 - k.y0 - 0.02, t: 0.045, ry: c, hinge: q, mat: u, open: 1.6, kind: "door", handle: true });
        }
      }
      U = G;
    }
    D(U, a, 0, i);
  }
  gableRoof(A, I, g, C, Q, i, E, t = 0.4, o, e = 0.14) {
    let s = Q / 2 + t, a = C / 2 + t, n = Math.atan2(E, Q / 2), r = E * s / (Q / 2), c = Math.hypot(s, r), h = 0.06, D = h / 2 / Math.cos(n);
    for (let U of [-1, 1]) {
      let S = cQ(C + t * 2, h, c, 1.2);
      S.rotateX(U * n), S.translate(I, i + E - r / 2 + D, g + U * s / 2), this.add(A, S), this.col(a, 0.05, c / 2, I, i + E - r / 2, g + U * s / 2, 0);
    }
    let l = o ?? this.m.woodDark;
    for (let U of [-1, 1]) {
      let S = new Zg();
      S.moveTo(-Q / 2, 0), S.lineTo(Q / 2, 0), S.lineTo(0, E), S.lineTo(-Q / 2, 0);
      let k = new lB(S, { depth: e, bevelEnabled: false }), K = k.attributes.uv;
      for (let G = 0; G < K.count; G++) K.setXY(G, K.getX(G) / 2, K.getY(G) / 2);
      k.rotateY(Math.PI / 2), k.translate(I + U * (C / 2) - e / 2, i, g), this.add(l, k);
    }
    this.box(this.m.metalDark, C + t * 2, 0.06, 0.18, I, i + E + 2 * D, g, 0, false);
  }
  shedRoof(A, I, g, C, Q, i, E, t = 0.35, o) {
    let s = Math.atan2(E - i, Q), a = (Q + t * 2) / Math.cos(s), n = cQ(C + t * 2, 0.05, a, 1.2);
    n.rotateX(s), n.translate(I, (i + E) / 2 + 0.05 / 2 / Math.cos(s), g), this.add(A, n), this.col((C + t * 2) / 2, 0.05, a / 2, I, (i + E) / 2, g, 0);
    let r = E - i;
    if (o && r > 0.01) {
      this.box(o.mat, C + o.t, r, o.t, I, i + r / 2, g - Q / 2, 0, false);
      for (let c of [-1, 1]) {
        let h = new Zg();
        h.moveTo(-Q / 2, 0), h.lineTo(Q / 2, 0), h.lineTo(Q / 2, r), h.lineTo(-Q / 2, 0);
        let D = new lB(h, { depth: o.t, bevelEnabled: false }), l = D.attributes.uv;
        for (let U = 0; U < l.count; U++) l.setXY(U, l.getX(U) / 2, l.getY(U) / 2);
        D.rotateY(Math.PI / 2), D.translate(I + c * (C / 2) - o.t / 2, i, g), this.add(o.mat, D);
      }
    }
  }
  floor(A, I, g, C, Q, i = 0, E = 0.12, t = 2) {
    this.box(A, C, E, Q, I, i - E / 2, g, 0, true, t);
  }
  shelf(A, I, g, C = 1.6, Q = 4, i = "shelf", E = 0.45) {
    let t = this.m.woodLight, o = Math.cos(g), e = Math.sin(g), s = (n, r) => [A + n * o + r * e, I - n * e + r * o], a = 1.9;
    for (let n of [-C / 2 + 0.03, C / 2 - 0.03]) for (let r of [-E / 2 + 0.03, E / 2 - 0.03]) {
      let [c, h] = s(n, r);
      this.box(t, 0.05, a, 0.05, c, this.baseY + a / 2, h, g, false);
    }
    for (let n = 0; n < Q; n++) {
      let r = this.baseY + 0.12 + n * ((a - 0.2) / (Q - 1)), [c, h] = s(0, 0);
      this.box(t, C, 0.025, E, c, r, h, g, true), n < Q && this.loot.push({ x: c, y: r + 0.05, z: h, table: i, spread: C * 0.35, chance: 0.55 });
    }
  }
  table(A, I, g, C = 1.2, Q = 0.7, i = 0.76, E, t) {
    let o = E ?? this.m.woodLight, e = this.baseY;
    this.box(o, C, 0.04, Q, A, e + i, I, g, true);
    let s = Math.cos(g), a = Math.sin(g);
    for (let n of [-C / 2 + 0.05, C / 2 - 0.05]) for (let r of [-Q / 2 + 0.05, Q / 2 - 0.05]) this.box(o, 0.05, i, 0.05, A + n * s + r * a, e + i / 2, I - n * a + r * s, g, false);
    t && this.loot.push({ x: A, y: e + i + 0.05, z: I, table: t, spread: C * 0.3, chance: 0.6 });
  }
  bed(A, I, g) {
    let C = this.baseY;
    this.box(this.m.metalDark, 0.95, 0.35, 2, A, C + 0.18, I, g, true), this.box(this.m.fabric("#7a6a5a"), 0.9, 0.16, 1.95, A, C + 0.43, I, g, false);
    let Q = Math.cos(g), i = Math.sin(g);
    this.box(this.m.fabric("#d8d0c0"), 0.6, 0.1, 0.35, A + 0.8 * i, C + 0.56, I + 0.8 * Q, g, false), this.interact.push({ kind: "bed", x: A, y: C + 0.5, z: I, r: 1.1 });
  }
  counter(A, I, g, C, Q) {
    let i = this.baseY;
    this.box(this.m.woodDark, C, 0.9, 0.6, A, i + 0.45, I, g, true, 2), this.box(this.m.concrete, C + 0.04, 0.04, 0.64, A, i + 0.92, I, g, false, 2), Q && this.loot.push({ x: A, y: i + 0.97, z: I, table: Q, spread: C * 0.35, chance: 0.7 });
  }
  fridge(A, I, g) {
    let C = this.baseY;
    this.box(this.m.flat("#e6e2d6", 0.4), 0.7, 1.7, 0.65, A, C + 0.85, I, g, true), this.box(this.m.chrome, 0.03, 0.4, 0.03, A + 0.28 * Math.cos(g) + 0.34 * Math.sin(g), C + 1.1, I - 0.28 * Math.sin(g) + 0.34 * Math.cos(g), g, false), this.loot.push({ x: A + Math.sin(g) * 0.55, y: C + 0.05, z: I + Math.cos(g) * 0.55, table: "kitchen", spread: 0.2, chance: 0.5 });
  }
  crates(A, I, g) {
    for (let C = 0; C < g; C++) this.items.push({ id: "crate", x: A + C % 2 * 0.62, y: 0.3 + Math.floor(C / 2) * 0.58, z: I + C % 3 * 0.1, ry: C * 0.2 });
  }
  barrel(A, I, g = "#3a5a8a", C) {
    this.items.push({ id: "barrel", x: A, y: 0.45, z: I, state: { color: g, ...C || {} } });
  }
  lamp(A, I, g, C = 16767392, Q = 18, i = 14) {
    let E = new VA(6e-3, 6e-3, 0.4, 4);
    E.translate(A, I + 0.2, g), this.add(this.m.black, E);
    let t = new PB(0.16, 0.12, 12, 1, true);
    t.translate(A, I + 0.02, g), this.add(this.m.painted("#3a4a3a", 0.4, 0.5), t), this.lights.push({ x: A, y: I - 0.06, z: g, color: C, intensity: Q, dist: i, bulb: true });
  }
};
function Ow(B, A) {
  let I = new WA(), g = new cA(new tg(0.62, 1.55, 0.42, 3, 0.04), B.painted(A, 0.5, 0.5));
  g.position.y = 0.78;
  let C = new cA(new tg(0.66, 0.32, 0.46, 3, 0.05), B.flat("#e8e4d8", 0.5));
  C.position.y = 1.7;
  let Q = new cA(new uI(0.7, 0.1, 0.5), B.metalDark);
  Q.position.y = 0.05;
  let i = new cA(new PI(0.4, 0.22), new oI({ color: 1710612, emissive: 5267504, emissiveIntensity: 0.2, roughness: 0.3 }));
  i.position.set(0, 1.22, 0.212);
  let E = new cA(new uI(0.12, 0.2, 0.08), B.metalDark);
  E.position.set(0.2, 0.9, 0.24);
  let t = new cA(Vg([new y(0.2, 0.98, 0.26), new y(0.2, 0.86, 0.3), new y(0.2, 0.82, 0.36)], () => 0.018, 6), B.metalBare), o = new cA(Vg([new y(0.28, 1.35, 0.2), new y(0.36, 0.9, 0.26), new y(0.33, 0.45, 0.3), new y(0.22, 0.8, 0.28)], () => 0.016, 6), B.rubber);
  return I.add(g, C, Q, i, E, t, o), I.traverse((e) => {
    e.isMesh && (e.castShadow = true, e.receiveShadow = true);
  }), I;
}
function vw(B) {
  let A = new WA(), I = new cA(new uI(0.08, 1.1, 0.08), B.woodDark);
  I.position.y = 0.55;
  let g = new Zg();
  g.moveTo(-0.12, 0), g.lineTo(0.12, 0), g.lineTo(0.12, 0.14), g.absarc(0, 0.14, 0.12, 0, Math.PI, false), g.lineTo(-0.12, 0);
  let C = new cA(new lB(g, { depth: 0.45, bevelEnabled: false }), B.painted("#7a8a90", 0.6, 0.5));
  C.position.set(0, 1.1, -0.22);
  let Q = new cA(new uI(0.02, 0.16, 0.06), B.flat("#b02020", 0.6));
  return Q.position.set(0.13, 1.28, 0.05), A.add(I, C, Q), A;
}
var wc = { station: { hw: 13, hd: 10 }, garage: { hw: 6, hd: 6 }, house: { hw: 7, hd: 6.5 }, trailer: { hw: 6, hd: 4 }, wrecks: { hw: 8, hd: 6 }, busstop: { hw: 3, hd: 2 }, billboard: { hw: 5, hd: 2 }, military: { hw: 11, hd: 9 }, motel: { hw: 14, hd: 7 }, tower: { hw: 6, hd: 6 }, homestead: { hw: 17, hd: 15 }, shack: { hw: 4, hd: 4 } };
function ce(B, A, I, g, C = 512, Q = 256, i = KB) {
  return _n("sign:" + B, () => {
    let [E, t] = jg(C, Q);
    t.fillStyle = I, t.fillRect(0, 0, C, Q), t.fillStyle = g, t.textAlign = "center", t.textBaseline = "middle";
    let o = A.length;
    return A.forEach((e, s) => {
      let a = Q / (o + 0.6) * (s === 0 ? 1 : 0.7);
      t.font = `800 ${a}px ${i}`, t.fillText(e, C / 2, Q / (o + 1) * (s + 1));
    }), ne(t, C, Q, 0.8, B.length * 13), Tg(E);
  });
}
var Cd = [[["МОТЕЛЬ «ОАЗИС»", "ЧЕРЕЗ 40 КМ"], "#e8d8b0", "#8a2a1a"], [["ПЕЙ «БАЙКАЛ»", "ОСВЕЖАЕТ!"], "#2a5a8a", "#f0e8d0"], [["БЕНЗИН · МАСЛО", "ЗАПЧАСТИ"], "#d8b020", "#1a1a1a"], [["ЛЕНИН ЖИЛ", "ЛЕНИН ЖИВ"], "#b02a1a", "#f0e0c0"], [["ТУШЁНКА «ОРЁЛ»", "СИЛА ДЛЯ ДОРОГИ"], "#e8e0c8", "#2a3a2a"], [["БЕРЕГИТЕ", "ВОДУ"], "#3a78b0", "#ffffff"], [["ЗДЕСЬ БЫЛ", "ГОРОД"], "#c8b898", "#3a2a1a"]];
function Zw(B, A, I) {
  let g = A.m;
  switch (B) {
    case "station":
      return Bd(A, g, I);
    case "garage":
      return _w(A, g, I, false);
    case "house":
      return Ww(A, g, I, 0, 0);
    case "trailer":
      return Qd(A, g, I);
    case "wrecks":
      return id(A, I);
    case "busstop":
      return Ed(A, g);
    case "billboard":
      return td(A, g, I);
    case "military":
      return od(A, g, I);
    case "motel":
      return ed(A, g, I);
    case "tower":
      return sd(A, g, I);
    case "homestead":
      return nd(A, g, I);
    case "shack":
      return ad(A, g, I);
  }
}
function Bd(B, A, I) {
  B.floor(A.concrete, 0, 0, 24, 18, 0.02, 0.2, 3);
  let g = I.chance(0.5), C = A.painted(g ? "#3a3a38" : "#6a6a64", 0.6, 0.6);
  for (let a of [-4.6, 4.6]) for (let n of [1.3, 4.7]) B.box(C, 0.28, 4.3, 0.28, a, 2.15, n, 0, true, 1);
  let Q = g ? A.painted("#d8b41c", 0.45, 0.5) : A.corrugatedRust;
  B.box(Q, 11.4, 0.7, 5.6, 0, 4.6, 3, 0, true, 1.2), B.box(A.flat("#b8b4a8", 0.9), 11.2, 0.05, 5.4, 0, 4.24, 3, 0, false), B.box(A.concrete, 5.5, 0.22, 1.2, 0, 0.11, 3, 0, true, 3), B.interact.push({ kind: "pump", x: -1.4, y: 0, z: 3, r: 0.8, data: { color: g ? "#c8281c" : "#2a5a8a", fuel: I.chance(0.25) ? 0 : Math.round(I.range(40, 260)), price: +I.range(0.35, 0.8).toFixed(2), kind: "petrol" } }), B.interact.push({ kind: "pump", x: 1.4, y: 0, z: 3, r: 0.8, data: { color: g ? "#c8281c" : "#2a5a8a", fuel: I.chance(0.35) ? 0 : Math.round(I.range(30, 200)), price: +I.range(0.3, 0.7).toFixed(2), kind: I.chance(0.3) ? "diesel" : "petrol" } });
  let i = 7, E = 5, t = 3, o = -4.5, e = I.chance(0.5) ? A.concrete : A.painted("#d8d0bc", 0.5, 0.8);
  B.floor(A.concrete, 0, o, i, E, 0.22, 0.2, 3), B.wall(e, -i / 2, o + E / 2, i / 2, o + E / 2, t, 0.2, [{ at: 2.2, w: 1, y0: 0, y1: 2.1, kind: "door", hinge: "r", doorMat: A.painted("#5a6a70", 0.5, 0.5) }, { at: 4.8, w: 2.4, y0: 0.9, y1: 2.3, kind: "window" }], 0.2, 3), B.wall(e, i / 2, o - E / 2, -i / 2, o - E / 2, t, 0.2, [], 0.2, 3), B.wall(e, -i / 2, o - E / 2, -i / 2, o + E / 2, t, 0.2, [{ at: 2.5, w: 1.2, y0: 1, y1: 2.1, kind: "window" }], 0.2, 3), B.wall(e, i / 2, o + E / 2, i / 2, o - E / 2, t, 0.2, [], 0.2, 3), B.box(A.concrete, i + 1, 0.25, E + 1, 0, 0.2 + t + 0.12, o, 0, true, 3), B.baseY = 0.22, B.counter(-1.5, o + 0.6, 0, 2.6, "station"), B.shelf(1.8, o - 1.9, 0, 1.8, 4, "station", 0.4), B.shelf(-2.6, o - 1.9, 0, 1.4, 4, "station", 0.4), B.baseY = 0, B.lamp(0, 3, o, 16769200, 16, 10), B.interior.push({ x0: -i / 2, z0: o - E / 2, x1: i / 2, z1: o + E / 2, y1: t }), B.box(A.metalDark, 0.18, 6, 0.18, 9.5, 3, 6.5, 0, true, 1);
  let s = new cA(cQ(2.4, 1.4, 0.12), [A.painted("#3a3a38", 0.5, 0.5), A.painted("#3a3a38", 0.5, 0.5), A.painted("#3a3a38", 0.5, 0.5), A.painted("#3a3a38", 0.5, 0.5), new oI({ map: ce("gas", ["БЕНЗИН", "АИ-76"], "#f0e8d0", "#b02a1a"), roughness: 0.6 }), new oI({ map: ce("gas", ["БЕНЗИН", "АИ-76"], "#f0e8d0", "#b02a1a"), roughness: 0.6 })]);
  s.position.set(9.5, 6.2, 6.5), s.castShadow = true, B.extra.push(s);
  for (let a = 0; a < I.int(2, 4); a++) B.barrel(-6 + a * 0.7, -8.2 + a % 2 * 0.3, I.pick(["#3a5a8a", "#8a2a1a", "#5a6a3a"]), I.chance(0.5) ? { liquid: I.chance(0.7) ? "petrol" : "diesel", amount: Math.round(I.range(5, 60)) } : { liquid: null, amount: 0 });
  I.chance(0.6) && B.items.push({ id: "jerrycan", x: 5.2, y: 0.5, z: -2.5, state: { color: "#b8261c", liquid: I.chance(0.5) ? "petrol" : null, amount: I.chance(0.5) ? Math.round(I.range(2, 12)) : 0 } }), I.chance(0.5) && B.wrecks.push({ x: -9, z: 5, ry: I.range(-0.4, 0.4) }), I.chance(0.4) && B.crates(6, -7, I.int(1, 3));
}
function _w(B, A, I, g) {
  let C = g ? 7.6 : I.pick([7, 8]), Q = g ? 8.4 : I.pick([7, 8]), i = 3.3, E = A.woodDark;
  B.floor(g || I.chance(0.6) ? A.dirt : A.concrete, 0, 0, C + 0.2, Q + 0.2, 0.08, 0.16, 3);
  let t = 3.4, o = I.chance(0.7) || g ? A.corrugatedRust : A.woodDark;
  B.wall(E, -C / 2, Q / 2, C / 2, Q / 2, i, 0.14, [{ at: C / 2, w: t, y0: 0, y1: 2.7, kind: "gate", double: true, doorMat: o }], 0.08, 2), B.wall(E, C / 2, -Q / 2, -C / 2, -Q / 2, i, 0.14, [{ at: C * 0.3, w: 1.4, y0: 1.2, y1: 2.2, kind: "window" }], 0.08, 2), B.wall(E, -C / 2, -Q / 2, -C / 2, Q / 2, i, 0.14, [{ at: Q * 0.35, w: 0.95, y0: 0, y1: 2.05, kind: "door", hinge: "l" }, { at: Q * 0.72, w: 1.3, y0: 1.2, y1: 2.2, kind: "window" }], 0.08, 2), B.wall(E, C / 2, Q / 2, C / 2, -Q / 2, i, 0.14, [{ at: Q * 0.5, w: 1.3, y0: 1.2, y1: 2.2, kind: "window" }], 0.08, 2);
  for (let e = 0; e < 5; e++) {
    let s = -Q / 2 + 0.3 + e * (Q - 0.6) / 4;
    B.box(A.woodLight, C, 0.14, 0.1, 0, i + 0.1, s, 0, false);
  }
  B.gableRoof(A.corrugatedRust, 0, 0, C, Q, i + 0.08, 1.35, 0.4, E, 0.14);
  for (let e of [-C / 2, C / 2]) for (let s of [-Q / 2, Q / 2]) B.box(A.woodLight, 0.18, i, 0.18, e, 0.08 + i / 2, s, 0, false);
  if (B.box(A.metalDark, 0.3, 0.08, 0.16, 0, 2.98, Q / 2 + 0.1, 0, false), B.box(A.emissive("#ffe2b0", 0.4), 0.16, 0.03, 0.08, 0, 2.925, Q / 2 + 0.12, 0, false), B.baseY = 0.08, B.shelf(-C / 2 + 0.35, -Q / 2 + 1.4, Math.PI / 2, 1.8, 4, "garage", 0.45), B.shelf(C / 2 - 0.35, -Q / 2 + 1.4, -Math.PI / 2, 1.8, 4, "garage", 0.45), B.table(0, -Q / 2 + 0.55, 0, 2.2, 0.7, 0.9, A.woodLight, g ? void 0 : "garage"), B.baseY = 0, B.lamp(0, i - 0.1, 0, 16769712, 14, 12), B.interior.push({ x0: -C / 2, z0: -Q / 2, x1: C / 2, z1: Q / 2, y1: i + 1.3 }), !g) {
    if (I.chance(0.35)) B.wrecks.push({ x: 0, z: 0.3, ry: Math.PI, parts: 0.5 });
    else for (let e = 0; e < I.int(1, 3); e++) B.items.push({ id: "part", x: I.range(-2, 2), y: 0.5, z: I.range(-1, 2), state: { partKind: I.pick(["wheel", "wheel", "battery", "radiator", "headlight", "taillight", "door_fl", "door_fr", "hood", "fender_l", "seat_f", "engine"]) } });
    I.chance(0.6) && B.items.push({ id: "jerrycan", x: C / 2 - 0.6, y: 0.4, z: Q / 2 - 1.2, state: { color: I.pick(["#b8261c", "#4a6a2a", "#c8a020"]), liquid: I.chance(0.6) ? "petrol" : null, amount: Math.round(I.range(3, 20)) } });
  }
}
function Ww(B, A, I, g, C, Q = false) {
  let e = I.chance(0.5) ? A.painted(I.pick(["#d8ccb0", "#b8c8c0", "#c8b898", "#e0d8c8"]), 0.4, 0.85) : A.woodDark, s = 0.35;
  B.box(A.concrete, 9 + 0.3, s, 7 + 0.3, g, s / 2, C, 0, true, 3), B.box(A.woodLight, 9, 0.04, 7, g, s + 0.02, C, 0, false, 2);
  let a = g - 9 / 2, n = g + 9 / 2, r = C - 7 / 2, c = C + 7 / 2;
  B.wall(e, a, c, n, c, 2.9, 0.16, [{ at: 2.2, w: 1.4, y0: 0.9, y1: 2.1, kind: "window" }, { at: 4.8, w: 0.95, y0: 0, y1: 2.1, kind: "door", hinge: "l" }, { at: 7.2, w: 1.4, y0: 0.9, y1: 2.1, kind: "window" }], s, 2), B.wall(e, n, r, a, r, 2.9, 0.16, [{ at: 2.5, w: 1.2, y0: 0.9, y1: 2, kind: "window" }, { at: 6.5, w: 1.2, y0: 0.9, y1: 2, kind: "window" }], s, 2), B.wall(e, a, r, a, c, 2.9, 0.16, [{ at: 3.5, w: 1.2, y0: 0.9, y1: 2, kind: "window" }], s, 2), B.wall(e, n, c, n, r, 2.9, 0.16, [{ at: 3.5, w: 0.9, y0: 0, y1: 2.05, kind: "door", hinge: "r" }], s, 2), B.wall(A.woodLight, g + 1.2, r, g + 1.2, c, 2.9, 0.1, [{ at: 2.2, w: 1, y0: 0, y1: 2.05, kind: "gap" }], s, 2), B.box(A.flat("#c8c0b0", 0.95), 9, 0.05, 7, g, s + 2.9 + 0.02, C, 0, false, 2), B.gableRoof(I.chance(0.5) ? A.corrugated : A.corrugatedRust, g, C, 9, 7, s + 2.9, 1.6, 0.5, e, 0.16), B.box(A.painted("#8a4a3a", 0.3, 0.9), 0.55, 2.1, 0.55, g - 2.4, s + 2.9 + 1, C - 0.7, 0, false), B.box(A.concrete, 0.7, 0.08, 0.7, g - 2.4, s + 2.9 + 2.09, C - 0.7, 0, false), B.box(A.woodLight, 4, 0.1, 1.8, g + 0.3, s - 0.05, c + 0.9, 0, true, 2), B.box(A.woodLight, 1.2, s * 0.66, 0.3, g + 0.3, s * 0.33, c + 1.95, 0, true, 2), B.box(A.woodLight, 1.2, s * 0.33, 0.3, g + 0.3, s * 0.165, c + 2.25, 0, true, 2);
  for (let D of [-1.5, 2.1]) B.box(A.woodLight, 0.12, 2.6, 0.12, g + D, s + 1.3, c + 1.65, 0, true);
  B.shedRoof(A.corrugatedRust, g + 0.3, c + 0.95, 4.2, 1.8, s + 2.55, s + 2.85, 0.1);
  let h = s;
  return B.baseY = h, B.counter(g - 3.2, r + 0.45, 0, 2, "kitchen"), B.fridge(g - 1.6, r + 0.45, 0), B.table(g - 2.5, C + 0.8, 0, 1.2, 0.8, 0.76, A.woodLight, Q ? void 0 : "kitchen"), B.bed(g + 3.3, C - 1.8, 0), B.shelf(g + 3.9, C + 1.8, -Math.PI / 2, 1.2, 3, "shelf", 0.35), B.baseY = 0, B.lamp(g - 2, s + 2.9 - 0.05, C, 16768170, 14, 10), B.lamp(g + 3, s + 2.9 - 0.05, C, 16768170, 10, 8), B.interior.push({ x0: a, z0: r, x1: n, z1: c, y1: s + 2.9 + 1.6 }), s;
}
function Qd(B, A, I) {
  let E = I.pick(["#d8d0b8", "#b8c0a8", "#c8b090", "#a8b8c0"]), t = A.painted(E, 0.55, 0.5);
  for (let o of [-3, 0, 3]) B.box(A.concrete, 0.4, 0.55, 0.4, o, 0.55 / 2, 0, 0, true);
  B.box(A.woodLight, 8.5, 0.08, 2.6, 0, 0.55, 0, 0, true, 2), B.wall(t, -8.5 / 2, 2.6 / 2, 8.5 / 2, 2.6 / 2, 2.5, 0.08, [{ at: 2, w: 1.1, y0: 0.9, y1: 1.8, kind: "window" }, { at: 4.6, w: 0.8, y0: 0, y1: 2, kind: "door", hinge: "l", doorMat: t }, { at: 7, w: 1.1, y0: 0.9, y1: 1.8, kind: "window" }], 0.55, 1.2, A.metalDark), B.wall(t, 8.5 / 2, -2.6 / 2, -8.5 / 2, -2.6 / 2, 2.5, 0.08, [{ at: 4, w: 1.4, y0: 0.9, y1: 1.8, kind: "window" }], 0.55, 1.2, A.metalDark), B.wall(t, -8.5 / 2, -2.6 / 2, -8.5 / 2, 2.6 / 2, 2.5, 0.08, [], 0.55, 1.2), B.wall(t, 8.5 / 2, 2.6 / 2, 8.5 / 2, -2.6 / 2, 2.5, 0.08, [], 0.55, 1.2), B.box(A.corrugated, 8.5 + 0.2, 0.08, 2.6 + 0.3, 0, 0.55 + 2.5 + 0.04, 0, 0, true, 1.2), B.baseY = 0.55, B.bed(-3.2, 0, Math.PI / 2), B.counter(3.4, -0.9, 0, 1.4, "kitchen"), B.baseY = 0, B.box(A.woodLight, 0.8, 0.8, 0.2, 2.8 + 0.7, 0.55 + 0.4, 1.1, 0, false), B.interior.push({ x0: -8.5 / 2, z0: -2.6 / 2, x1: 8.5 / 2, z1: 2.6 / 2, y1: 0.55 + 2.5 }), B.lamp(0, 0.55 + 2.5 - 0.05, 0, 16768170, 8, 7), I.chance(0.5) && B.items.push({ id: "canister", x: 4.8, y: 0.2, z: 1.8, state: { liquid: "water", amount: Math.round(I.range(2, 9)), color: "#3a6ab0" } });
}
function id(B, A) {
  let I = A.int(1, 3);
  for (let g = 0; g < I; g++) B.wrecks.push({ x: A.range(-5, 5), z: A.range(-3, 3) + g * 1.5, ry: A.range(-1, 1) + (A.chance(0.3) ? Math.PI : 0), parts: A.range(0.3, 0.8) });
  for (let g = 0; g < A.int(0, 3); g++) B.items.push({ id: "part", x: A.range(-6, 6), y: 0.4, z: A.range(-4, 4), state: { partKind: A.pick(["wheel", "wheel", "door_fl", "door_rr", "hood", "bumper_f", "headlight", "fender_r", "taillight", "windshield"]) } });
  A.chance(0.3) && B.items.push({ id: "jerrycan", x: A.range(-4, 4), y: 0.4, z: A.range(-3, 3), state: { color: "#b8261c", liquid: "petrol", amount: Math.round(A.range(1, 8)) } });
}
function Ed(B, A) {
  B.floor(A.concrete, 0, 0, 4, 2.2, 0.08, 0.16, 3);
  let I = A.painted("#6a8a9a", 0.6, 0.6);
  B.box(I, 3.6, 2.4, 0.1, 0, 1.28, -0.9, 0, true, 2), B.box(I, 0.1, 2.4, 1.8, -1.75, 1.28, 0, 0, true, 2), B.box(I, 0.1, 2.4, 1.8, 1.75, 1.28, 0, 0, true, 2), B.box(A.corrugated, 3.9, 0.08, 2.3, 0, 2.52, 0.05, 0, true, 1.2), B.box(A.woodLight, 3, 0.06, 0.4, 0, 0.5, -0.6, 0, true);
  for (let g of [-1.3, 1.3]) B.box(A.metalDark, 0.06, 0.39, 0.34, g, 0.275, -0.6, 0, false);
  B.loot.push({ x: 0, y: 0.56, z: -0.6, table: "shelf", spread: 1, chance: 0.5 });
}
function td(B, A, I) {
  for (let E of [-2.2, 2.2]) B.box(A.woodDark, 0.25, 7, 0.25, E, 3.5, 0, 0, true, 2);
  let g = I.pick(Cd), C = ce("ad" + g[0].join(), g[0], g[1], g[2], 1024, 512), Q = [A.woodDark, A.woodDark, A.woodDark, A.woodDark, new oI({ map: C, roughness: 0.8 }), A.woodDark], i = new cA(cQ(6.4, 3.2, 0.14, 2), Q);
  i.position.set(0, 5.4, 0.15), i.castShadow = true, B.extra.push(i), B.col(3.2, 1.6, 0.1, 0, 5.4, 0.15, 0), B.box(A.woodLight, 6.2, 0.1, 0.8, 0, 3.75, 0.35, 0, false);
}
function od(B, A, I) {
  let g = A.fabric("#8a8058"), C = (t, o, e, s, a) => {
    let n = Math.hypot(e - t, s - o), r = Math.floor(n / 0.6), c = Math.atan2(-(s - o) / n, (e - t) / n);
    for (let h = 0; h < a; h++) for (let D = 0; D < r; D++) {
      let l = (D + 0.5 + h % 2 * 0.5) / r;
      if (l > 1) continue;
      let U = t + (e - t) * l, S = o + (s - o) * l;
      B.box(g, 0.58, 0.22, 0.34, U, 0.11 + h * 0.21, S, c, false);
    }
    B.col(n / 2, a * 0.11, 0.2, (t + e) / 2, a * 0.11, (o + s) / 2, c);
  };
  C(-8, 6, -2, 6, 4), C(2, 6, 8, 6, 4), C(-8, -6, -8, 6, 3), B.floor(A.woodLight, 3, -2, 5, 4, 0.1, 0.1, 2), B.wall(A.corrugated, 0.5, 0, 5.5, 0, 2.6, 0.06, [{ at: 1.2, w: 0.9, y0: 0, y1: 2, kind: "door", hinge: "l", doorMat: A.corrugated }], 0.1, 1.2, A.metalDark), B.wall(A.corrugated, 5.5, -4, 0.5, -4, 2.6, 0.06, [], 0.1, 1.2), B.wall(A.corrugated, 0.5, -4, 0.5, 0, 2.6, 0.06, [], 0.1, 1.2), B.wall(A.corrugated, 5.5, 0, 5.5, -4, 2.6, 0.06, [{ at: 2, w: 1, y0: 1.2, y1: 1.9, kind: "window" }], 0.1, 1.2), B.shedRoof(A.corrugatedRust, 3, -2, 5, 4, 2.7, 3, 0.3, { mat: A.corrugated, t: 0.06 }), B.table(3, -3.2, 0, 1.6, 0.7, 0.8, A.woodLight, "military"), B.shelf(4.9, -2, -Math.PI / 2, 1.4, 3, "military", 0.4), B.interior.push({ x0: 0.5, z0: -4, x1: 5.5, z1: 0, y1: 3 }), B.crates(-5, -3, I.int(2, 4));
  let Q = new Zg();
  Q.moveTo(-1.35, 0), Q.lineTo(1.35, 0), Q.lineTo(0, 2.15), Q.lineTo(-1.35, 0);
  let i = new lB(Q, { depth: 5, bevelEnabled: false });
  i.translate(0, 0, -2.5), i.rotateY(Math.PI / 2);
  let E = new cA(i, A.fabric("#5a6a3a"));
  E.position.set(-4, 0, 1.2), E.castShadow = true, B.extra.push(E), B.col(2.5, 1.1, 1.3, -4, 1.1, 1.2, 0), B.interact.push({ kind: "sign", x: 8, y: 1, z: 8, r: 1, data: { mines: true } });
}
function ed(B, A, I) {
  let E = A.painted(I.pick(["#e0c8a0", "#c8d8d0", "#e8d8c0"]), 0.45, 0.85), t = 4 * 4.2;
  B.box(A.concrete, t + 0.3, 0.3, 5 + 2.5, 0, 0.15, 0.9, 0, true, 3);
  let o = -t / 2, e = [];
  for (let a = 0; a < 4; a++) e.push({ at: a * 4.2 + 1, w: 0.9, y0: 0, y1: 2.05, kind: "door", hinge: "l", doorMat: A.painted(I.pick(["#8a3a2a", "#3a5a6a", "#6a6a3a"]), 0.4, 0.5) }), e.push({ at: a * 4.2 + 2.9, w: 1.4, y0: 0.9, y1: 2, kind: "window" });
  B.wall(E, o, 5 / 2, o + t, 5 / 2, 2.8, 0.16, e, 0.3, 2), B.wall(E, o + t, -5 / 2, o, -5 / 2, 2.8, 0.16, [], 0.3, 2), B.wall(E, o, -5 / 2, o, 5 / 2, 2.8, 0.16, [], 0.3, 2), B.wall(E, o + t, 5 / 2, o + t, -5 / 2, 2.8, 0.16, [], 0.3, 2);
  for (let a = 1; a < 4; a++) B.wall(E, o + a * 4.2, -5 / 2, o + a * 4.2, 5 / 2, 2.8, 0.1, [], 0.3, 2);
  B.box(A.concrete, t + 0.8, 0.2, 5 + 2.6, 0, 0.3 + 2.8 + 0.1, 0.8, 0, true, 3);
  for (let a = 0; a <= 4; a++) B.box(A.painted("#d8d0c0", 0.4, 0.8), 0.14, 2.8, 0.14, o + a * 4.2, 0.3 + 2.8 / 2, 5 / 2 + 2, 0, true);
  for (let a = 0; a < 4; a++) {
    let n = o + a * 4.2 + 2.1;
    B.baseY = 0.3, B.bed(n + 0.9, -0.8, 0), B.table(n - 1.2, -1.6, 0, 0.8, 0.5, 0.7, A.woodLight, "shelf"), B.baseY = 0, B.interior.push({ x0: o + a * 4.2, z0: -5 / 2, x1: o + (a + 1) * 4.2, z1: 5 / 2, y1: 0.3 + 2.8 });
  }
  let s = new cA(cQ(4, 1.2, 0.2), new oI({ map: ce("motel", ["МОТЕЛЬ"], "#2a3a5a", "#f0c040"), roughness: 0.5, emissive: 16777215, emissiveMap: ce("motel", ["МОТЕЛЬ"], "#2a3a5a", "#f0c040"), emissiveIntensity: 0 }));
  s.position.set(t / 2 + 2, 4.5, 4), s.userData.neon = true, B.extra.push(s), B.box(A.metalDark, 0.2, 4, 0.2, t / 2 + 2, 2, 4, 0, true);
}
function sd(B, A, I) {
  let g = A.painted("#b8b0a0", 0.6, 0.6), C = 36, Q = 2.6, i = [[-1, -1], [1, -1], [1, 1], [-1, 1]], E = [];
  for (let e = 0; e < 4; e++) {
    let [s, a] = i[e], n = [new y(s * Q, 0, a * Q), new y(s * 0.4, C, a * 0.4)], r = n[1].clone().sub(n[0]), c = new VA(0.06, 0.09, r.length(), 5);
    c.translate(0, r.length() / 2, 0), c.applyQuaternion(new nI().setFromUnitVectors(new y(0, 1, 0), r.clone().normalize())), c.translate(n[0].x, 0, n[0].z), B.add(g, c);
  }
  for (let e = 0; e < 12; e++) {
    let s = e * 3, a = Q + (0.4 - Q) * (s / C);
    for (let n = 0; n < 4; n++) {
      let [r, c] = i[n], [h, D] = i[(n + 1) % 4], l = new VA(0.03, 0.03, Math.hypot((h - r) * a, (D - c) * a), 4);
      l.rotateZ(Math.PI / 2), l.rotateY(-Math.atan2(D - c, h - r)), l.translate((r + h) / 2 * a, s, (c + D) / 2 * a), B.add(g, l);
    }
  }
  B.col(Q, 1, Q, 0, 1, 0, 0);
  let t = new cA(new ug(0.25, 10, 8), new oI({ color: 4194304, emissive: 16719888, emissiveIntensity: 3 }));
  t.position.y = C + 0.62, t.userData.blink = true, B.extra.push(t), B.box(g, 1, 0.08, 1, 0, C, 0, 0, false);
  let o = new VA(0.05, 0.06, 0.4, 6);
  o.translate(0, C + 0.22, 0), B.add(g, o), B.floor(A.concrete, 5, 0, 3.4, 3, 0.1, 0.15, 3), B.wall(A.concrete, 3.3, 1.5, 6.7, 1.5, 2.5, 0.15, [{ at: 1.2, w: 0.9, y0: 0, y1: 2, kind: "door", hinge: "l", doorMat: A.painted("#5a5a58", 0.6, 0.5) }], 0.1, 3), B.wall(A.concrete, 6.7, -1.5, 3.3, -1.5, 2.5, 0.15, [], 0.1, 3), B.wall(A.concrete, 3.3, -1.5, 3.3, 1.5, 2.5, 0.15, [], 0.1, 3), B.wall(A.concrete, 6.7, 1.5, 6.7, -1.5, 2.5, 0.15, [{ at: 1.5, w: 0.9, y0: 1.1, y1: 1.8, kind: "window" }], 0.1, 3), B.box(A.concrete, 3.8, 0.15, 3.4, 5, 2.67, 0, 0, true, 3), B.table(5, -0.8, 0, 1.4, 0.6, 0.8, A.metalDark, "crate"), B.interior.push({ x0: 3.3, z0: -1.5, x1: 6.7, z1: 1.5, y1: 2.7 });
}
function ad(B, A, I) {
  B.floor(A.woodLight, 0, 0, 4, 3.5, 0.08, 0.1, 2), B.wall(A.woodDark, -4 / 2, 3.5 / 2, 4 / 2, 3.5 / 2, 2.4, 0.08, [{ at: 1.2, w: 0.85, y0: 0, y1: 1.95, kind: "door", hinge: "l" }], 0.08, 2), B.wall(A.woodDark, 4 / 2, -3.5 / 2, -4 / 2, -3.5 / 2, 2.4, 0.08, [], 0.08, 2), B.wall(A.woodDark, -4 / 2, -3.5 / 2, -4 / 2, 3.5 / 2, 2.4, 0.08, [{ at: 1.7, w: 0.8, y0: 1, y1: 1.7, kind: "window" }], 0.08, 2), B.wall(A.woodDark, 4 / 2, 3.5 / 2, 4 / 2, -3.5 / 2, 2.4, 0.08, [], 0.08, 2), B.shedRoof(A.corrugatedRust, 0, 0, 4, 3.5, 2.4 + 0.08, 2.4 + 0.5, 0.3, { mat: A.woodDark, t: 0.08 }), B.shelf(0, -3.5 / 2 + 0.3, 0, 1.6, 3, I.chance(0.5) ? "garage" : "shelf", 0.35), B.interior.push({ x0: -4 / 2, z0: -3.5 / 2, x1: 4 / 2, z1: 3.5 / 2, y1: 2.4 + 0.5 }), I.chance(0.5) && B.crates(1.2, 0.5, 1);
}
function nd(B, A, I) {
  let Q = new xi(A);
  _w(Q, A, I, true), Pw(B, Q, -8, 1);
  let i = new xi(A), E = Ww(i, A, I, 0, 0, true);
  Pw(B, i, 7.5, -2), B.interact.push({ kind: "well", x: 0.5, y: 0, z: 9, r: 1 });
  let t = new WA(), o = new cA(new VA(0.75, 0.8, 0.8, 20, 1, true), A.concrete);
  o.position.y = 0.4;
  let e = new cA(new Xg(0.76, 0.06, 6, 20), A.concrete);
  e.rotation.x = Math.PI / 2, e.position.y = 0.8;
  let s = new cA(new VC(0.72, 20), new oI({ color: 660504, roughness: 0.05, metalness: 0.2 }));
  s.rotation.x = -Math.PI / 2, s.position.y = 0.2;
  let a = new cA(cQ(0.1, 1.8, 0.1), A.woodDark);
  a.position.set(-0.8, 0.9, 0);
  let n = a.clone();
  n.position.x = 0.8;
  let r = new cA(new VA(0.06, 0.06, 1.7, 8), A.woodLight);
  r.rotation.z = Math.PI / 2, r.position.y = 1.6;
  let c = new cA(new VA(0.14, 0.11, 0.25, 12), A.painted("#6a6a60", 0.6, 0.5));
  c.position.set(0, 1.1, 0);
  let h = new cA(new VA(8e-3, 8e-3, 0.17, 5), A.flat("#8a7550", 0.95));
  h.position.set(0, 1.443, 0);
  let D = new cA(new Xg(0.135, 6e-3, 4, 14, Math.PI), A.metalDark);
  D.position.set(0, 1.225, 0);
  let l = new cA(new VA(0.075, 0.075, 0.34, 10), A.flat("#8a7550", 0.95));
  l.rotation.z = Math.PI / 2, l.position.y = 1.6;
  let U = new cA(new uI(0.03, 0.2, 0.03), A.metalDark);
  U.position.set(0.9, 1.52, 0);
  let S = new cA(new VA(0.018, 0.018, 0.12, 8), A.woodLight);
  S.rotation.z = Math.PI / 2, S.position.set(0.96, 1.43, 0), t.add(o, e, s, a, n, r, c, h, D, l, U, S), t.position.set(0.5, 0, 9), t.traverse((p) => {
    p.isMesh && (p.castShadow = true, p.receiveShadow = true);
  }), B.extra.push(t), B.col(0.8, 0.4, 0.8, 0.5, 0.4, 9, 0), B.interact.push({ kind: "mailbox", x: 3, y: 1.1, z: 13.2, r: 0.6 });
  for (let p = 0; p < 3; p++) {
    let d = new Xg(0.29, 0.1, 8, 18);
    d.rotateX(Math.PI / 2), d.translate(-8 + 3.8 + 0.55, 0.1 + p * 0.2, 1 + 2.6 + p % 2 * 0.05), B.add(A.tire, d);
  }
  B.col(0.4, 0.3, 0.4, -8 + 4.35, 0.3, 1 + 2.6, 0);
  for (let p = 0; p < 3; p++) for (let d = 0; d < 6 - p; d++) {
    let R = new VA(0.075, 0.08, 0.9, 8);
    R.rotateX(Math.PI / 2), R.translate(1.6 + d * 0.16 + p * 0.08, 0.08 + p * 0.14, -4.6), B.add(A.deadWood, R);
  }
  B.col(0.5, 0.25, 0.45, 2, 0.25, -4.6, 0);
  for (let p of [-2.5, 3.5]) B.box(A.woodDark, 0.08, 1.9, 0.08, p, 0.95, -9, 0, true), B.box(A.woodDark, 0.08, 0.06, 0.9, p, 1.87, -9, 0, false);
  for (let p of [-0.35, 0, 0.35]) {
    let d = new VA(4e-3, 4e-3, 6, 4);
    d.rotateZ(Math.PI / 2), d.translate(0.5, 1.88, -9 + p), B.add(A.flat("#d8d4c8", 0.9), d);
  }
  let k = [[-1.2, 0.55, -0.35, "#d8d0c0"], [0.2, 0.7, 0, "#6a7a9a"], [1.5, 0.5, 0.35, "#c8a080"], [2.4, 0.6, 0, "#e8e4dc"]];
  for (let [p, d, R, u] of k) {
    let q = new cA(new PI(0.6, d), new oI({ color: u, roughness: 0.95, side: OI }));
    q.position.set(p, 1.88 - d / 2, -9 + R), q.castShadow = true, B.extra.push(q);
  }
  for (let p = 0; p < 16; p++) B.box(A.woodDark, 0.1, 1.2, 0.1, -16 + p * 2.1, 0.6, -13, 0, true);
  B.box(A.woodDark, 32, 0.1, 0.05, -0.2, 1, -13, 0, false), B.box(A.woodDark, 32, 0.1, 0.05, -0.2, 0.5, -13, 0, false);
  let M = ((p, d, R) => [-8 + p, d, 1 + R])(0, 0.96, -8.4 / 2 + 0.55);
  B.items.push({ id: "part", x: M[0] - 0.5, y: M[1] + 0.12, z: M[2], state: { partKind: "battery", cond: 0.9, charge: 0.85 } }), B.items.push({ id: "wrench", x: M[0] + 0.4, y: M[1] + 0.03, z: M[2], ry: 1.2 }), B.items.push({ id: "flashlight", x: M[0] + 0.8, y: M[1] + 0.05, z: M[2] + 0.1, ry: 0.4 }), B.items.push({ id: "jerrycan", x: -8 + 3.2, y: 0.4, z: 1 + 3.2, ry: 0.3, state: { color: "#b8261c", liquid: "petrol", amount: 16 } }), B.items.push({ id: "oilcan", x: -8 - 3.4, y: 1.4, z: 1 - 2.8, state: { liquid: "oil", amount: 3 } }), B.items.push({ id: "water", x: 7.5 - 3.2, y: E + 0.98, z: -2 - 3.5 + 0.45, state: { liquid: "water", amount: 1.5 } }), B.items.push({ id: "water", x: 7.5 - 2.9, y: E + 0.98, z: -2 - 3.5 + 0.45, state: { liquid: "water", amount: 1.5 } }), B.items.push({ id: "stew", x: 7.5 - 2.3, y: E + 0.8, z: -2 + 0.8 }), B.items.push({ id: "beans", x: 7.5 - 2.7, y: E + 0.8, z: -2 + 0.9 }), B.items.push({ id: "note", x: 7.5 - 2.5, y: E + 0.79, z: -2 + 0.6, state: { text: "letter" } }), B.items.push({ id: "money", x: 7.5 + 3.8, y: E + 1, z: -2 + 1.8, state: { money: 25 } }), B.items.push({ id: "compass", x: 7.5 + 3.8, y: E + 1, z: -2 + 1.5 }), B.items.push({ id: "canister", x: -8 + 3.2, y: 0.25, z: 1 + 2.2, state: { liquid: "water", amount: 6, color: "#3a6ab0" } }), B.wrecks.length = 0, B.loot = B.loot.filter(() => false);
}
function Pw(B, A, I, g) {
  for (let [C, Q] of A.geos) for (let i of Q) i.translate(I, 0, g), B.add(C, i);
  for (let C of A.cols) B.cols.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.doors) B.doors.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.loot) B.loot.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.lights) B.lights.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.interact) B.interact.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.wrecks) B.wrecks.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.items) B.items.push({ ...C, x: C.x + I, z: C.z + g });
  for (let C of A.extra) C.position.x += I, C.position.z += g, B.extra.push(C);
  for (let C of A.interior) B.interior.push({ x0: C.x0 + I, z0: C.z0 + g, x1: C.x1 + I, z1: C.z1 + g, y1: C.y1 });
}
var QI = { STATIC: 1, CAR: 2, ITEM: 4, PLAYER: 8, ENEMY: 16, HEAVY: 32, SENSOR: 64, DEBRIS: 128 }, AC = (B, A) => (B & 65535) << 16 | A & 65535, fB = { static: AC(QI.STATIC, 65535), car: AC(QI.CAR, QI.STATIC | QI.CAR | QI.ITEM | QI.HEAVY | QI.ENEMY | QI.PLAYER | QI.DEBRIS), item: AC(QI.ITEM, QI.STATIC | QI.CAR | QI.ITEM | QI.HEAVY | QI.DEBRIS), heavy: AC(QI.HEAVY, QI.STATIC | QI.CAR | QI.ITEM | QI.HEAVY | QI.PLAYER | QI.ENEMY), player: AC(QI.PLAYER, QI.STATIC | QI.CAR | QI.HEAVY | QI.ENEMY), enemy: AC(QI.ENEMY, QI.STATIC | QI.CAR | QI.HEAVY | QI.PLAYER | QI.ENEMY), wheelRay: AC(65535, QI.STATIC | QI.HEAVY), debris: AC(QI.DEBRIS, QI.STATIC | QI.CAR | QI.ITEM) }, KC = 64, wd = 32;
async function Ny() {
  await _I.init();
}
var qr = class {
  constructor(A) {
    this.fn = A;
    this.world = new _I.World({ x: 0, y: -9.81, z: 0 }), this.world.timestep = 1 / 60, this.world.integrationParameters.numSolverIterations = 6, this.events = new _I.EventQueue(true);
  }
  fn;
  world;
  events;
  tiles = /* @__PURE__ */ new Map();
  statics = /* @__PURE__ */ new Set();
  originX = 0;
  originZ = 0;
  time = 0;
  onContact = null;
  owners = /* @__PURE__ */ new Map();
  setOwner(A, I) {
    this.owners.set(A.handle, I);
  }
  ownerOf(A) {
    return A ? this.owners.get(A.handle) : void 0;
  }
  step(A) {
    this.world.timestep = A, this.world.step(this.events), this.time += A, this.onContact ? this.events.drainContactForceEvents((I) => {
      let g = this.world.getCollider(I.collider1()), C = this.world.getCollider(I.collider2());
      !g || !C || this.onContact(g, C, I.totalForceMagnitude(), null);
    }) : this.events.drainContactForceEvents(() => {
    }), this.events.drainCollisionEvents(() => {
    });
  }
  buildTile(A, I) {
    let g = wd, C = KC / g, Q = A * KC, i = I * KC, E = new Float32Array((g + 1) * (g + 1));
    for (let a = 0; a <= g; a++) for (let n = 0; n <= g; n++) E[a * (g + 1) + n] = this.fn.height(Q + a * C, i + n * C);
    let t = Q + KC / 2, o = i + KC / 2, e = this.world.createRigidBody(_I.RigidBodyDesc.fixed().setTranslation(t - this.originX, 0, o - this.originZ)), s = this.world.createCollider(_I.ColliderDesc.heightfield(g, g, E, { x: KC, y: 1, z: KC }).setCollisionGroups(fB.static).setFriction(0.9), e);
    this.setOwner(s, { kind: "terrain" }), this.tiles.set(A + "," + I, { body: e, used: this.time, wx: t, wz: o });
  }
  ensureTerrain(A, I = 3) {
    let g = 0;
    for (let C of A) {
      let Q = Math.floor((C.x - C.r) / KC), i = Math.floor((C.x + C.r) / KC), E = Math.floor((C.z - C.r) / KC), t = Math.floor((C.z + C.r) / KC), o = [];
      for (let e = E; e <= t; e++) for (let s = Q; s <= i; s++) {
        let a = Math.hypot((s + 0.5) * KC - C.x, (e + 0.5) * KC - C.z);
        o.push([a, s, e]);
      }
      o.sort((e, s) => e[0] - s[0]);
      for (let [, e, s] of o) {
        let a = e + "," + s, n = this.tiles.get(a);
        if (n) {
          n.used = this.time;
          continue;
        }
        g >= I || (this.buildTile(e, s), g++);
      }
    }
    for (let [C, Q] of this.tiles) this.time - Q.used > 8 && (this.world.removeRigidBody(Q.body), this.tiles.delete(C));
    return g;
  }
  hasTerrainAt(A, I) {
    return this.tiles.has(Math.floor(A / KC) + "," + Math.floor(I / KC));
  }
  addStatic(A, I, g, C, Q, i) {
    let E = new nI().setFromAxisAngle(new y(0, 1, 0), C), t = this.world.createRigidBody(_I.RigidBodyDesc.fixed().setTranslation(A - this.originX, I, g - this.originZ).setRotation({ x: E.x, y: E.y, z: E.z, w: E.w }));
    for (let e of Q) {
      e.keepGroups || e.setCollisionGroups(fB.static);
      let s = this.world.createCollider(e, t);
      i && this.setOwner(s, i);
    }
    let o = { body: t, wx: A, wz: g };
    return this.statics.add(o), o;
  }
  removeStatic(A) {
    if (A && this.statics.delete(A)) {
      let I = A.body.numColliders();
      for (let g = 0; g < I; g++) this.owners.delete(A.body.collider(g).handle);
      this.world.removeRigidBody(A.body);
    }
  }
  removeBody(A) {
    if (!A) return;
    let I = A.numColliders();
    for (let g = 0; g < I; g++) this.owners.delete(A.collider(g).handle);
    this.world.removeRigidBody(A);
  }
  shiftOrigin(A, I) {
    this.originX += A, this.originZ += I, this.world.forEachRigidBody((g) => {
      let C = g.translation();
      g.isKinematic() && g.setNextKinematicTranslation({ x: C.x - A, y: C.y, z: C.z - I }), g.setTranslation({ x: C.x - A, y: C.y, z: C.z - I }, false);
    });
  }
  ray = new _I.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
  castRay(A, I, g, C, Q, i) {
    return this.ray.origin = { x: A.x, y: A.y, z: A.z }, this.ray.dir = { x: I.x, y: I.y, z: I.z }, this.world.castRayAndGetNormal(this.ray, g, true, void 0, C, i, Q);
  }
  groundY(A, I, g) {
    let C = this.castRay(new y(A, g, I), new y(0, -1, 0), 400, AC(65535, QI.STATIC));
    return C ? g - C.timeOfImpact : this.fn.height(A + this.originX, I + this.originZ);
  }
};
var Ry = { petrol: ["Бензин", "Petrol"], diesel: ["Дизель", "Diesel"], water: ["Вода", "Water"], oil: ["Масло", "Oil"] };
var DI = (B, A) => {
  let I = new cA(B, A);
  return I.castShadow = true, I.receiveShadow = true, I;
}, Yg = (...B) => {
  let A = new WA();
  return A.add(...B), A;
};
function _c(B, A, I = 512, g = 256) {
  return _n("label:" + B, () => {
    let [C, Q] = jg(I, g);
    return A(Q, I, g), ne(Q, I, g, 0.6, B.length * 7), Tg(C);
  });
}
function Qi(B, A, I, g, C, Q = false) {
  return _c(B, (i, E, t) => {
    i.fillStyle = A, i.fillRect(0, 0, E, t), i.fillStyle = I, i.fillRect(0, t * 0.12, E, t * 0.1), i.fillRect(0, t * 0.78, E, t * 0.1), i.fillStyle = Q ? "#1a1a1a" : "#f4efe0", i.textAlign = "center", i.textBaseline = "middle";
    for (let o of [0.25, 0.75]) i.font = `800 ${t * 0.24}px ${KB}`, i.fillText(g, E * o, t * 0.44), i.font = `600 ${t * 0.1}px ${NC}`, i.fillText(C, E * o, t * 0.64);
  });
}
function dy(B, A, I = false) {
  let g = A.color ?? "#b8261c", C = I ? 0.78 : 1, Q = 0.165 * C, i = 0.46 * C, E = 0.34 * C, t = new tg(Q, i, E, 3, 0.022 * C), o = B.painted(g, 0.35, 0.42), e = Yg(DI(t, o));
  for (let r of [-1, 1]) for (let c of [0.66, -0.66]) {
    let h = new tg(0.012, Math.hypot(i, E) * 0.72, 0.03 * C, 1, 5e-3);
    h.rotateX(c), h.translate(r * (Q / 2 + 2e-3), -0.01 * C, 0), e.add(DI(h, o));
  }
  for (let r = 0; r < 3; r++) {
    let c = (-0.1 + r * 0.1) * C, h = Vg([new y(0, i / 2 - 5e-3, c - 0.035 * C), new y(0, i / 2 + 0.035 * C, c - 0.02 * C), new y(0, i / 2 + 0.035 * C, c + 0.02 * C), new y(0, i / 2 - 5e-3, c + 0.035 * C)], () => 9e-3 * C, 6);
    e.add(DI(h, o));
  }
  let s = new VA(0.022 * C, 0.026 * C, 0.05 * C, 14);
  s.rotateX(-0.6), s.translate(0, i / 2 + 0.01, E / 2 - 0.045 * C), e.add(DI(s, B.metalDark));
  let a = new VA(0.027 * C, 0.027 * C, 0.03 * C, 14);
  a.rotateX(-0.6), a.translate(0, i / 2 + 0.03 * C, E / 2 - 0.03 * C), e.add(DI(a, B.painted(g, 0.5, 0.5)));
  let n = new cA(new PI(E * 0.34, i * 0.2), new oI({ map: Qi("jc" + (A.liquid ?? ""), "#e8dfc8", "#222", A.liquid === "diesel" ? "DIESEL" : A.liquid === "water" ? "WATER" : "BENZIN", "20 L"), roughness: 0.7 }));
  return n.rotation.y = Math.PI / 2, n.position.set(Q / 2 + 5e-3, i * 0.28, -E * 0.2), e.add(n), e;
}
function yd(B, A) {
  let I = B.flat(A.color ?? "#7d9a8c", 0.58), g = B.flat("#2c3430", 0.5), C = new tg(0.26, 0.27, 0.18, 4, 0.04);
  C.translate(0, -0.035, 0);
  let Q = Yg(DI(C, I)), i = new tg(0.22, 0.06, 0.15, 3, 0.025);
  i.translate(0, 0.1, 0), Q.add(DI(i, I));
  let E = Vg([new y(-0.1, 0.11, 0), new y(-0.085, 0.16, 0), new y(-0.02, 0.165, 0), new y(0.035, 0.16, 0), new y(0.045, 0.12, 0)], () => 0.014, 8);
  Q.add(DI(E, I));
  let t = new VA(0.022, 0.024, 0.03, 16);
  t.translate(0.085, 0.14, 0), Q.add(DI(t, I));
  let o = new VA(0.027, 0.027, 0.026, 20);
  o.translate(0.085, 0.16, 0), Q.add(DI(o, B.flat("#c8b24a", 0.45)));
  for (let r = 0; r < 10; r++) {
    let c = r / 10 * Math.PI * 2, h = new uI(4e-3, 0.024, 4e-3);
    h.translate(0.085 + Math.cos(c) * 0.027, 0.16, Math.sin(c) * 0.027), Q.add(DI(h, B.flat("#b09c3e", 0.5)));
  }
  let e = new VA(9e-3, 9e-3, 0.012, 10);
  e.translate(-0.095, 0.135, 0.045), Q.add(DI(e, g));
  for (let r of [-1, 1]) for (let c of [-0.12, -0.06, 0]) {
    let h = new tg(0.2, 0.012, 8e-3, 1, 3e-3);
    h.translate(0, c, r * 0.09), Q.add(DI(h, I));
  }
  let s = new PI(0.1, 0.1), a = s.attributes.uv;
  for (let r = 0; r < a.count; r++) a.setX(r, a.getX(r) * 0.5);
  let n = new cA(s, new oI({ map: Qi("water_can", "#e9e4d2", "#2a6aa8", "ВОДА", "10 Л", true), roughness: 0.8 }));
  return n.position.set(0, 0.035, 0.0925), Q.add(n), Q;
}
function kd(B) {
  let A = new tg(0.18, 0.26, 0.09, 2, 0.012), I = new oI({ map: Qi("oil", "#1f3a78", "#e0b020", "MOTOR", "OIL · 4 L"), roughness: 0.45, metalness: 0.4 }), g = Yg(DI(A, I)), C = new VA(0.02, 0.02, 0.03, 12);
  C.translate(0.05, 0.145, 0);
  let Q = new VA(0.024, 0.024, 0.025, 12);
  Q.translate(0.05, 0.17, 0), g.add(DI(C, B.metalBare), DI(Q, B.flat("#d8b020", 0.4)));
  let i = Vg([new y(-0.07, 0.13, 0), new y(-0.06, 0.18, 0), new y(0, 0.18, 0), new y(0.01, 0.13, 0)], () => 8e-3, 6);
  return g.add(DI(i, B.flat("#1f3a78", 0.5))), g;
}
function Md(B, A) {
  let I = [[1e-3, -0.15], [0.038, -0.15], [0.042, -0.14], [0.042, 0.05], [0.036, 0.1], [0.016, 0.13], [0.014, 0.15], [1e-3, 0.15]], g = new rQ({ color: 13625588, roughness: 0.1, transparent: true, opacity: 0.45, depthWrite: false }), C = Yg(DI(AB(I, 20), g)), Q = (A.amount ?? 0) / 1.5;
  if (Q > 0.02) {
    let t = 0.26 * Q, o = new cA(new VA(0.038, 0.038, t, 16), new oI({ color: 9091288, transparent: true, opacity: 0.55, roughness: 0.1 }));
    o.position.y = -0.145 + t / 2, C.add(o);
  }
  let i = new VA(0.016, 0.016, 0.02, 12);
  i.translate(0, 0.16, 0), C.add(DI(i, B.flat("#2a5ab0", 0.4)));
  let E = new cA(new VA(0.0425, 0.0425, 0.07, 20, 1, true), new oI({ map: Qi("water", "#3a78c8", "#fff", "AQUA", "1.5 L"), roughness: 0.5 }));
  return C.add(E), C;
}
function Hr(B, A, I, g, C, Q, i = 0.042, E = 0.11) {
  let t = new VA(i, i, E, 20, 1, true), o = new oI({ map: Qi(A, I, g, C, Q), roughness: 0.5, metalness: 0.2 }), e = Yg(DI(t, o)), s = new VA(i * 1.02, i * 1.02, 6e-3, 20), a = DI(s, B.metalBare);
  a.position.y = E / 2;
  let n = DI(s, B.metalBare);
  return n.position.y = -E / 2, e.add(a, n), e;
}
function Ud(B) {
  let A = new tg(0.26, 0.17, 0.09, 2, 0.015), I = Yg(DI(A, B.flat("#e8e4dc", 0.5)));
  for (let C of [0, Math.PI / 2]) {
    let Q = new uI(0.06, 0.018, 2e-3);
    Q.rotateZ(C), Q.translate(0, 0, 0.046), I.add(DI(Q, B.flat("#c01e1e", 0.5)));
  }
  let g = Vg([new y(-0.05, 0.085, 0), new y(-0.04, 0.115, 0), new y(0.04, 0.115, 0), new y(0.05, 0.085, 0)], () => 7e-3, 6);
  return I.add(DI(g, B.flat("#333", 0.5))), I;
}
function Kd(B) {
  let A = new tg(0.022, 0.26, 8e-3, 2, 3e-3), I = Yg(DI(A, B.chrome));
  for (let [g, C] of [[0.14, 1], [-0.14, 0.8]]) {
    let Q = new Zg();
    Q.absarc(0, 0, 0.022 * C, 0, Math.PI * 2, false);
    let i = new ZB();
    i.moveTo(-8e-3 * C, 0.03 * C), i.lineTo(-8e-3 * C, -4e-3 * C), i.lineTo(8e-3 * C, -4e-3 * C), i.lineTo(8e-3 * C, 0.03 * C), Q.holes.push(i);
    let E = Yw(Q, 9e-3, 2e-3, 1, 12);
    E.translate(0, g, 0), g < 0 && E.rotateZ(Math.PI), I.add(DI(E, B.chrome));
  }
  return I;
}
function Gd(B) {
  let A = [new y(0, -0.3, 0), new y(0, 0.25, 0), new y(0.01, 0.3, 0), new y(0.045, 0.32, 0), new y(0.07, 0.3, 0)];
  return Yg(DI(Vg(A, () => 0.011, 6), B.painted("#8a1e16", 0.6, 0.5)));
}
function Fd(B) {
  let A = new VA(0.018, 0.018, 0.62, 10);
  return Yg(DI(A, B.rust));
}
function pd(B) {
  let A = B.flat("#2a2b2e", 0.32, 0.9), I = new WA(), g = new VA(9e-3, 9e-3, 0.16, 12);
  g.rotateX(Math.PI / 2), g.translate(0, 0.03, -0.1);
  let C = new uI(8e-3, 8e-3, 0.16);
  C.translate(0, 0.041, -0.1);
  let Q = new VA(0.02, 0.02, 0.045, 12);
  Q.rotateX(Math.PI / 2), Q.translate(0, 0.022, 0);
  let i = new tg(0.018, 0.045, 0.09, 2, 4e-3);
  i.translate(0, 0.02, 0.02);
  let E = new tg(0.024, 0.09, 0.035, 2, 8e-3);
  E.rotateX(-0.3), E.translate(0, -0.03, 0.065);
  let t = new Xg(0.014, 3e-3, 5, 12, Math.PI);
  t.rotateY(Math.PI / 2), t.rotateX(Math.PI), t.translate(0, -4e-3, 0.02);
  let o = new uI(6e-3, 0.014, 0.012);
  return o.translate(0, 0.048, 0.055), I.add(DI(Wg([g, C, Q, i, t, o].map((e) => e.toNonIndexed())), A)), I.add(DI(E, B.woodLight)), I;
}
function Jd(B) {
  let A = new tg(0.1, 0.05, 0.07, 1, 4e-3);
  return Yg(DI(A, new oI({ map: Qi("ammo", "#b88a30", "#5a1a0a", ".38", "36 PATRONOV", true), roughness: 0.8 })));
}
function Nd(B) {
  let A = AB([[1e-3, -0.1], [0.016, -0.1], [0.016, 0.04], [0.024, 0.07], [0.024, 0.09], [1e-3, 0.09]], 16);
  A.rotateX(Math.PI / 2);
  let I = Yg(DI(A, B.flat("#2e3a2e", 0.5, 0.3))), g = new VC(0.021, 16);
  return g.rotateX(Math.PI), g.translate(0, 0, -0.0905), I.add(DI(g, B.emissive("#fff6d0", 0.6))), I;
}
function dd(B) {
  let A = new WA(), I = _c("money", (Q, i, E) => {
    Q.fillStyle = "#8fae84", Q.fillRect(0, 0, i, E), Q.strokeStyle = "#3a5a3a", Q.lineWidth = 6, Q.strokeRect(10, 10, i - 20, E - 20), Q.fillStyle = "#2a4a2a", Q.font = `800 ${E * 0.4}px ${NC}`, Q.textAlign = "center", Q.textBaseline = "middle", Q.fillText("10", i * 0.2, E * 0.5), Q.fillText("10", i * 0.8, E * 0.5), Q.beginPath(), Q.arc(i / 2, E / 2, E * 0.3, 0, Math.PI * 2), Q.stroke();
  }, 256, 128), g = new oI({ map: I, roughness: 0.9 });
  for (let Q = 0; Q < 4; Q++) {
    let i = new uI(0.15, 15e-4, 0.07), E = DI(i, g);
    E.position.y = Q * 16e-4, E.rotation.y = (Q - 1.5) * 0.08, A.add(E);
  }
  let C = new uI(0.02, 8e-3, 0.072);
  return A.add(DI(C, B.flat("#c8b890", 0.9))), A;
}
function Rd(B) {
  let A = AB([[1e-3, 0], [0.035, 0], [0.038, 4e-3], [0.038, 0.014], [0.034, 0.016], [1e-3, 0.016]], 20), I = Yg(DI(A, B.flat("#9a7a3a", 0.35, 0.8))), g = new VC(0.031, 20);
  g.rotateX(-Math.PI / 2), g.translate(0, 0.0165, 0);
  let C = _c("compass", (Q, i, E) => {
    Q.fillStyle = "#efe8d8", Q.fillRect(0, 0, i, E), Q.translate(i / 2, E / 2), Q.fillStyle = "#222", Q.font = `700 ${i * 0.12}px ${NC}`, Q.textAlign = "center", Q.textBaseline = "middle", ["N", "E", "S", "W"].forEach((t, o) => {
      Q.save(), Q.rotate(o * Math.PI / 2), Q.fillText(t, 0, -i * 0.36), Q.restore();
    }), Q.fillStyle = "#c02020", Q.beginPath(), Q.moveTo(0, -i * 0.28), Q.lineTo(i * 0.04, 0), Q.lineTo(-i * 0.04, 0), Q.fill(), Q.fillStyle = "#333", Q.beginPath(), Q.moveTo(0, i * 0.28), Q.lineTo(i * 0.04, 0), Q.lineTo(-i * 0.04, 0), Q.fill();
  }, 256, 256);
  return I.add(DI(g, new oI({ map: C, roughness: 0.4 }))), I;
}
function ud(B) {
  let A = new tg(0.36, 0.16, 0.18, 2, 0.01), I = Yg(DI(A, B.painted("#a82a1c", 0.4, 0.45))), g = Vg([new y(-0.08, 0.08, 0), new y(-0.07, 0.12, 0), new y(0.07, 0.12, 0), new y(0.08, 0.08, 0)], () => 8e-3, 6);
  return I.add(DI(g, B.chrome)), I;
}
function fd(B) {
  let A = new Xg(0.04, 0.018, 10, 20);
  return A.scale(1, 1, 1.5), Yg(DI(A, B.flat("#8a8e92", 0.6, 0.2)));
}
function Yd(B, A) {
  let I = new WA(), g = 0.55, C = B.woodRaw;
  for (let Q = 0; Q < 3; Q++) for (let [i, E] of [["x", 1], ["x", -1], ["z", 1], ["z", -1]]) {
    let t = new uI(i === "x" ? 0.02 : g, g / 3 - 0.012, i === "x" ? g : 0.02), o = DI(t, C);
    o.position.set(i === "x" ? E * (g / 2 - 0.01) : 0, -g / 2 + g / 6 + Q * (g / 3), i === "z" ? E * (g / 2 - 0.01) : 0), I.add(o);
  }
  for (let Q of [-1, 1]) {
    let i = DI(new uI(g, 0.02, g), C);
    i.position.y = Q * (g / 2 - 0.01), I.add(i);
  }
  for (let Q of [-1, 1]) for (let i of [-1, 1]) {
    let E = DI(new uI(0.05, g, 0.05), B.woodLight);
    E.position.set(Q * (g / 2 - 0.02), 0, i * (g / 2 - 0.02)), I.add(E);
  }
  return I;
}
function Ld(B, A) {
  let I = [[1e-3, -0.44], [0.29, -0.44], [0.3, -0.42], [0.3, -0.3], [0.305, -0.29], [0.3, -0.28], [0.3, 0.28], [0.305, 0.29], [0.3, 0.3], [0.3, 0.42], [0.29, 0.44], [1e-3, 0.44]], g = A.color ?? "#3a5a8a", C = Yg(DI(AB(I, 28), B.painted(g, 0.7, 0.5))), Q = new VA(0.03, 0.03, 0.02, 10);
  return Q.translate(0.18, 0.445, 0), C.add(DI(Q, B.metalDark)), C;
}
function md(B) {
  let A = new uI(0.4, 0.3, 0.3);
  return Yg(DI(A, B.cardboard));
}
function qd(B, A) {
  let I = new PI(0.15, 0.2);
  I.rotateX(-Math.PI / 2);
  let g = DI(I, new oI({ color: 15722191, roughness: 0.95, side: OI }));
  return Yg(g);
}
function Hd(B) {
  return Hr(B, "soda", "#c8201a", "#fff", "COLA", "0.33", 0.033, 0.115);
}
function Td(B) {
  let A = new uI(0.16, 0.012, 0.07);
  return Yg(DI(A, new oI({ map: Qi("choc", "#5a2a14", "#d8b060", "SHOKOLAD", "ALYONKA"), roughness: 0.6 })));
}
function bd(B) {
  let A = new ug(0.1, 12, 8);
  return A.scale(1, 1.3, 0.35), Yg(DI(A, new oI({ map: Qi("chips", "#e0a020", "#c02020", "CHIPS", "KARTOFEL"), roughness: 0.3, metalness: 0.4 })));
}
function xd(B) {
  let A = new VA(0.03, 0.03, 0.06, 14);
  return A.rotateZ(Math.PI / 2), Yg(DI(A, B.flat("#f0ece0", 0.9)));
}
function Od(B) {
  let A = AB([[1e-3, -0.14], [0.04, -0.14], [0.04, 0.1], [0.032, 0.12], [0.032, 0.16], [1e-3, 0.16]], 16);
  return Yg(DI(A, B.painted("#2a5a3a", 0.3, 0.4)));
}
function vd(B) {
  let A = AB([[1e-3, -0.1], [0.032, -0.1], [0.032, 0.07], [0.02, 0.1], [8e-3, 0.11], [1e-3, 0.11]], 16);
  return Yg(DI(A, B.flat("#30c030", 0.3, 0.3)));
}
var ji = { jerrycan: { id: "jerrycan", name: ["Канистра 20 л", "Jerry can 20 L"], mass: 4, shape: "box", half: [0.085, 0.24, 0.17], storable: false, material: "metal", liquid: { cap: 20, kinds: ["petrol", "diesel", "water", "oil"], rate: 1.4 }, build: (B, A) => dy(B, A) }, jerrycan_s: { id: "jerrycan_s", name: ["Канистра 10 л", "Jerry can 10 L"], mass: 2.5, shape: "box", half: [0.066, 0.19, 0.135], storable: false, material: "metal", liquid: { cap: 10, kinds: ["petrol", "diesel", "water", "oil"], rate: 1.1 }, build: (B, A) => dy(B, A, true) }, oilcan: { id: "oilcan", name: ["Моторное масло", "Motor oil"], mass: 1, shape: "box", half: [0.09, 0.13, 0.045], storable: true, material: "metal", liquid: { cap: 4, kinds: ["oil"], rate: 0.45 }, build: (B) => kd(B) }, water: { id: "water", name: ["Бутылка воды", "Water bottle"], mass: 0.3, shape: "cyl", half: [0.042, 0.15, 0.042], storable: true, material: "plastic", liquid: { cap: 1.5, kinds: ["water"], rate: 0.35, drinkable: true }, build: (B, A) => Md(B, A) }, canister: { id: "canister", name: ["Бидон для воды", "Water canister"], mass: 1.2, shape: "box", half: [0.13, 0.17, 0.09], storable: false, material: "plastic", liquid: { cap: 10, kinds: ["water", "petrol", "diesel", "oil"], rate: 1, drinkable: true }, build: (B, A) => yd(B, A) }, stew: { id: "stew", name: ["Тушёнка", "Canned stew"], mass: 0.4, shape: "cyl", half: [0.042, 0.055, 0.042], storable: true, material: "metal", food: { hunger: 34, thirst: -4, time: 1.4, sound: "eat" }, build: (B) => Hr(B, "stew", "#b8a060", "#8a1a14", "ТУШЁНКА", "ГОВЯЖЬЯ") }, beans: { id: "beans", name: ["Фасоль", "Beans"], mass: 0.4, shape: "cyl", half: [0.042, 0.055, 0.042], storable: true, material: "metal", food: { hunger: 26, thirst: -2, time: 1.2, sound: "eat" }, build: (B) => Hr(B, "beans", "#6a2a1a", "#e8c040", "ФАСОЛЬ", "В ТОМАТЕ") }, sprats: { id: "sprats", name: ["Шпроты", "Sprats"], mass: 0.25, shape: "cyl", half: [0.055, 0.015, 0.055], storable: true, material: "metal", food: { hunger: 20, thirst: -6, time: 1.2, sound: "eat" }, build: (B) => Hr(B, "sprats", "#d8b040", "#1a2a5a", "ШПРОТЫ", "В МАСЛЕ", 0.055, 0.028) }, soda: { id: "soda", name: ["Газировка", "Soda"], mass: 0.35, shape: "cyl", half: [0.033, 0.058, 0.033], storable: true, material: "metal", food: { hunger: 4, thirst: 22, energy: 6, time: 1, sound: "drink" }, build: (B) => Hd(B) }, chocolate: { id: "chocolate", name: ["Шоколад", "Chocolate"], mass: 0.1, shape: "box", half: [0.08, 6e-3, 0.035], storable: true, material: "soft", food: { hunger: 14, thirst: -3, energy: 8, time: 0.8, sound: "eat" }, build: (B) => Td(B) }, chips: { id: "chips", name: ["Чипсы", "Crisps"], mass: 0.1, shape: "box", half: [0.1, 0.13, 0.035], storable: true, material: "soft", food: { hunger: 12, thirst: -8, time: 1, sound: "eat" }, build: (B) => bd(B) }, coffee: { id: "coffee", name: ["Термос с кофе", "Coffee thermos"], mass: 0.9, shape: "cyl", half: [0.04, 0.15, 0.04], storable: true, material: "metal", food: { hunger: 2, thirst: 14, energy: 35, time: 1.4, sound: "drink" }, build: (B) => Od(B) }, medkit: { id: "medkit", name: ["Аптечка", "First aid kit"], mass: 0.8, shape: "box", half: [0.13, 0.085, 0.045], storable: true, material: "plastic", tool: "medkit", food: { hunger: 0, thirst: 0, health: 55, time: 2.2, sound: "eat" }, build: (B) => Ud(B) }, bandage: { id: "bandage", name: ["Бинт", "Bandage"], mass: 0.05, shape: "cyl", half: [0.03, 0.03, 0.03], storable: true, material: "soft", tool: "medkit", food: { hunger: 0, thirst: 0, health: 20, time: 1.5, sound: "eat" }, build: (B) => xd(B) }, wrench: { id: "wrench", name: ["Гаечный ключ", "Wrench"], mass: 0.6, shape: "box", half: [0.022, 0.16, 0.01], storable: true, material: "metal", tool: "wrench", weapon: { damage: 22, range: 1.8, rate: 0.55 }, build: (B) => Kd(B) }, crowbar: { id: "crowbar", name: ["Монтировка", "Crowbar"], mass: 1.6, shape: "box", half: [0.04, 0.31, 0.02], storable: false, material: "metal", tool: "melee", weapon: { damage: 38, range: 2, rate: 0.8 }, build: (B) => Gd(B) }, pipe: { id: "pipe", name: ["Труба", "Iron pipe"], mass: 1.4, shape: "cyl", half: [0.02, 0.31, 0.02], storable: false, material: "metal", tool: "melee", weapon: { damage: 30, range: 2, rate: 0.75 }, build: (B) => Fd(B) }, revolver: { id: "revolver", name: ["Револьвер", "Revolver"], mass: 1, shape: "box", half: [0.015, 0.05, 0.12], storable: true, material: "metal", tool: "gun", weapon: { damage: 90, range: 120, rate: 0.45 }, build: (B) => pd(B) }, ammo: { id: "ammo", name: ["Патроны .38", ".38 ammo"], mass: 0.4, shape: "box", half: [0.05, 0.025, 0.035], storable: true, material: "soft", ammo: 12, build: (B) => Jd(B) }, flashlight: { id: "flashlight", name: ["Фонарик", "Flashlight"], mass: 0.4, shape: "cyl", half: [0.024, 0.1, 0.024], storable: true, material: "metal", tool: "light", build: (B) => Nd(B) }, money: { id: "money", name: ["Деньги", "Money"], mass: 0.02, shape: "box", half: [0.075, 6e-3, 0.036], storable: true, material: "soft", money: true, build: (B) => dd(B) }, compass: { id: "compass", name: ["Компас", "Compass"], mass: 0.2, shape: "cyl", half: [0.038, 9e-3, 0.038], storable: true, material: "metal", tool: "compass", build: (B) => Rd(B) }, repairkit: { id: "repairkit", name: ["Ремкомплект", "Repair kit"], mass: 3, shape: "box", half: [0.18, 0.08, 0.09], storable: false, material: "metal", tool: "repair", build: (B) => ud(B) }, tape: { id: "tape", name: ["Изолента", "Duct tape"], mass: 0.2, shape: "cyl", half: [0.058, 0.03, 0.058], storable: true, material: "soft", tool: "repair", build: (B) => fd(B) }, spray: { id: "spray", name: ["Баллончик краски", "Spray paint"], mass: 0.4, shape: "cyl", half: [0.032, 0.105, 0.032], storable: true, material: "metal", build: (B) => vd(B) }, crate: { id: "crate", name: ["Деревянный ящик", "Wooden crate"], mass: 14, shape: "box", half: [0.275, 0.275, 0.275], storable: false, material: "wood", container: true, breakable: true, heavy: true, build: (B, A) => Yd(B, A) }, box: { id: "box", name: ["Коробка", "Cardboard box"], mass: 2, shape: "box", half: [0.2, 0.15, 0.15], storable: false, material: "soft", container: true, breakable: true, build: (B) => md(B) }, barrel: { id: "barrel", name: ["Бочка", "Barrel"], mass: 30, shape: "cyl", half: [0.3, 0.44, 0.3], storable: false, material: "metal", heavy: true, liquid: { cap: 120, kinds: ["petrol", "diesel", "water", "oil"], rate: 1.6 }, build: (B, A) => Ld(B, A) }, note: { id: "note", name: ["Записка", "Note"], mass: 0.01, shape: "box", half: [0.075, 3e-3, 0.1], storable: true, material: "soft", tool: "note", build: (B, A) => qd(B, A) }, part: { id: "part", name: ["Деталь", "Car part"], mass: 10, shape: "box", half: [0.2, 0.2, 0.2], storable: false, material: "metal", build: () => new WA() } }, Wc = { shelf: [["stew", 10], ["beans", 8], ["sprats", 6], ["water", 12], ["soda", 7], ["chocolate", 6], ["chips", 5], ["oilcan", 6], ["medkit", 3], ["bandage", 5], ["money", 7], ["ammo", 3], ["flashlight", 3], ["tape", 4], ["coffee", 3], ["spray", 2]], garage: [["oilcan", 10], ["jerrycan", 6], ["jerrycan_s", 5], ["wrench", 3], ["crowbar", 3], ["pipe", 2], ["repairkit", 4], ["tape", 6], ["canister", 4], ["money", 4], ["flashlight", 3], ["water", 4]], kitchen: [["stew", 10], ["beans", 10], ["sprats", 8], ["water", 12], ["soda", 6], ["chocolate", 5], ["coffee", 5], ["chips", 4], ["money", 4]], crate: [["stew", 6], ["beans", 5], ["water", 8], ["money", 6], ["ammo", 4], ["medkit", 3], ["bandage", 5], ["oilcan", 4], ["flashlight", 2], ["compass", 2], ["soda", 4], ["revolver", 1], ["tape", 3]], military: [["ammo", 10], ["revolver", 3], ["medkit", 6], ["bandage", 6], ["water", 6], ["stew", 6], ["compass", 3], ["flashlight", 3], ["money", 3]], station: [["oilcan", 10], ["soda", 8], ["chips", 7], ["chocolate", 7], ["water", 8], ["money", 5], ["jerrycan_s", 3], ["tape", 3], ["compass", 1]] };
function je(B, A, I, g, C = 2762532) {
  let Q = new rQ({ color: A, roughness: 0.38, metalness: 0.08, clearcoat: 0.55, clearcoatRoughness: 0.28, side: OI }), i = B.tex;
  return Q.userData.rust = { value: I }, Q.userData.dust = { value: g }, Q.userData.inner = { value: new nA(C) }, Q.userData.dirt = { value: 0 }, Q.onBeforeCompile = (E) => {
    E.uniforms.uWear = { value: i.wear }, E.uniforms.uRustTex = { value: i.rust }, E.uniforms.uRustAmt = Q.userData.rust, E.uniforms.uDustAmt = Q.userData.dust, E.uniforms.uInner = Q.userData.inner, E.vertexShader = E.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vOPos;
varying vec3 vONrm;`).replace("#include <begin_vertex>", `#include <begin_vertex>
 vOPos = position;
 vONrm = normal;`), E.fragmentShader = E.fragmentShader.replace("#include <common>", `#include <common>
        varying vec3 vOPos; varying vec3 vONrm;
        uniform sampler2D uWear; uniform sampler2D uRustTex; uniform float uRustAmt; uniform float uDustAmt; uniform vec3 uInner;
        float rustK = 0.0; float innerK = 0.0;
        vec4 triS(sampler2D t, vec3 p, vec3 n, float s){
          vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x + w.y + w.z + 1e-4);
          return texture2D(t, p.zy * s) * w.x + texture2D(t, p.xz * s) * w.y + texture2D(t, p.xy * s) * w.z;
        }`).replace("#include <map_fragment>", `#include <map_fragment>
        {
          vec4 wr = triS(uWear, vOPos, vONrm, 0.55);
          vec4 wr2 = triS(uWear, vOPos * 1.7 + 3.1, vONrm, 1.9);
          float low = 1.0 - smoothstep(0.25, 0.75, vOPos.y);
          float edge = smoothstep(0.78, 0.97, abs(vOPos.x)) * 0.12;
          float m = wr.r * 0.72 + wr2.r * 0.28 + low * 0.2 + edge;
          rustK = smoothstep(1.0 - uRustAmt * 0.8, 1.06 - uRustAmt * 0.78, m);
          rustK = max(rustK, wr2.g * uRustAmt * 0.8);
          vec3 rc = triS(uRustTex, vOPos, vONrm, 1.4).rgb;
          diffuseColor.rgb = mix(diffuseColor.rgb, rc, rustK);
          float dustK = uDustAmt * (0.3 + 0.7 * wr.b) * (0.35 + 0.65 * low) + uDustAmt * 0.25 * max(vONrm.y, 0.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.66, 0.54, 0.40), clamp(dustK * 0.6, 0.0, 0.85));
          if (!gl_FrontFacing) { innerK = 1.0; diffuseColor.rgb = uInner * (0.8 + 0.2 * wr.b); }
        }`).replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
 roughnessFactor = mix(roughnessFactor, 0.9, max(max(rustK, uDustAmt * 0.4), innerK));`).replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>
 metalnessFactor *= 1.0 - rustK;`).replace("#include <lights_physical_fragment>", `#include <lights_physical_fragment>
 material.clearcoat *= (1.0 - rustK) * (1.0 - innerK) * (1.0 - clamp(uDustAmt, 0.0, 1.0) * 0.6);`);
  }, Q.customProgramCacheKey = () => "carpaint", Q;
}
function Tr(B, A, I, g) {
  B.color.set(A), B.userData.rust.value = I, B.userData.dust.value = g;
}
var RC = 1200, xr = class {
  constructor(A, I, g) {
    this.w = A;
    this.e = I;
    this.dir = g;
    for (let C = 0; C <= RC; C++) {
      let Q = C / RC * (Math.PI / 2), i = A * Math.pow(Math.cos(Q), 2 / I.b), E = I.L * Math.pow(Math.sin(Q), 2 / I.a) + I.bow * (1 - (i / A) ** 2);
      this.x[C] = C === RC ? 0 : i, this.z[C] = I.zc + g * E, C && (this.s[C] = this.s[C - 1] + Math.hypot(this.x[C] - this.x[C - 1], this.z[C] - this.z[C - 1]));
    }
    this.total = this.s[RC];
  }
  w;
  e;
  dir;
  x = new Float64Array(RC + 1);
  z = new Float64Array(RC + 1);
  s = new Float64Array(RC + 1);
  total;
  idx(A) {
    let I = Math.min(Math.max(A, 0), 1) * this.total, g = 0, C = RC;
    for (; C - g > 1; ) {
      let i = g + C >> 1;
      this.s[i] <= I ? g = i : C = i;
    }
    let Q = (I - this.s[g]) / Math.max(1e-12, this.s[C] - this.s[g]);
    return { lo: g, hi: C, k: Q };
  }
  pos(A) {
    let { lo: I, hi: g, k: C } = this.idx(A);
    return [this.x[I] + (this.x[g] - this.x[I]) * C, this.z[I] + (this.z[g] - this.z[I]) * C];
  }
  at(A, I) {
    let [g, C] = this.pos(A), Q = 1.5 / RC, [i, E] = this.pos(Math.max(0, A - Q)), [t, o] = this.pos(Math.min(1, A + Q)), e = t - i, s = o - E, a = Math.hypot(e, s) || 1;
    return e /= a, s /= a, I.x = g, I.z = C, this.dir > 0 ? (I.nx = s, I.nz = -e) : (I.nx = -s, I.nz = e), A <= 0 && (I.nx = 1, I.nz = 0), A >= 1 && (I.nx = 0, I.nz = this.dir), I;
  }
  zAtX(A) {
    if (A >= this.w) return this.e.zc;
    if (A <= 0) return this.z[RC];
    let I = 0, g = RC;
    for (; g - I > 1; ) {
      let Q = I + g >> 1;
      this.x[Q] >= A ? I = Q : g = Q;
    }
    let C = (this.x[I] - A) / Math.max(1e-12, this.x[I] - this.x[g]);
    return this.z[I] + (this.z[g] - this.z[I]) * C;
  }
  xAtZ(A) {
    let I = (A - this.e.zc) * this.dir;
    if (I <= 0) return this.w;
    let g = (this.z[RC] - this.e.zc) * this.dir;
    if (I >= g) return 0;
    let C = 0, Q = RC;
    for (; Q - C > 1; ) {
      let o = C + Q >> 1;
      (this.z[o] - this.e.zc) * this.dir <= I ? C = o : Q = o;
    }
    let i = (this.z[C] - this.e.zc) * this.dir, E = (this.z[Q] - this.e.zc) * this.dir, t = (I - i) / Math.max(1e-12, E - i);
    return this.x[C] + (this.x[Q] - this.x[C]) * t;
  }
  get tip() {
    return this.z[RC];
  }
}, dt = class {
  constructor(A, I) {
    this.spec = A;
    this.fr = I;
    this.F = new xr(A.w, A.front, 1), this.R = new xr(A.w, A.rear, -1);
  }
  spec;
  fr;
  F;
  R;
  plan(A, I) {
    let g = this.fr, C = this.spec;
    return A <= g.u1 ? this.R.at(1 - A / g.u1, I) : A >= g.u4 ? this.F.at((A - g.u4) / (1 - g.u4), I) : (I.x = C.w, I.nx = 1, I.nz = 0, A < g.u2 ? I.z = C.rear.zc + (g.zA - C.rear.zc) * (A - g.u1) / (g.u2 - g.u1) : A <= g.u3 ? I.z = g.zA + (g.zB - g.zA) * (A - g.u2) / (g.u3 - g.u2) : I.z = g.zB + (C.front.zc - g.zB) * (A - g.u3) / (g.u4 - g.u3), I);
  }
  point(A, I) {
    let g = this.plan(A, Pd);
    return I.set(g.x, this.spec.y(g.x, g.z, g.nz), g.z);
  }
  xAtZ(A) {
    return A >= this.spec.front.zc ? this.F.xAtZ(A) : A <= this.spec.rear.zc ? this.R.xAtZ(A) : this.spec.w;
  }
  get tipF() {
    return this.F.tip;
  }
  get tipR() {
    return this.R.tip;
  }
}, Pd = { x: 0, z: 0, nx: 1, nz: 0 };
function Vc(B, A) {
  return B.u2 + (A - B.zA) / (B.zB - B.zA) * (B.u3 - B.u2);
}
var Xe = class {
  constructor(A, I) {
    this.loops = A;
    this.vk = I ?? this.autoKnots();
  }
  loops;
  vk;
  cache = /* @__PURE__ */ new Map();
  autoKnots() {
    let A = this.loops[0].fr, I = (A.u2 + A.u3) / 2, g = this.loops.map((Q) => Q.point(I, new y())), C = [0];
    for (let Q = 1; Q < g.length; Q++) C.push(C[Q - 1] + Math.max(1e-4, g[Q].distanceTo(g[Q - 1])));
    return C.map((Q) => Q / C[C.length - 1]);
  }
  column(A) {
    let I = this.cache.get(A);
    return I || (this.cache.size > 6e3 && this.cache.clear(), I = this.loops.map((g) => g.point(A, new y())), this.cache.set(A, I), I);
  }
  point(A, I, g, C) {
    let Q = this.column(A), i = this.vk, E = Q.length - 1;
    I = Math.min(Math.max(I, 0), 1);
    let t = 0;
    for (; t < E - 1 && I > i[t + 1]; ) t++;
    let o = i[t + 1] - i[t], e = (I - i[t]) / o, s = (l, U) => {
      if (l === 0) return U.subVectors(Q[1], Q[0]).divideScalar(i[1] - i[0]);
      if (l === E) return U.subVectors(Q[E], Q[E - 1]).divideScalar(i[E] - i[E - 1]);
      let S = i[l] - i[l - 1], k = i[l + 1] - i[l];
      return uy.subVectors(Q[l], Q[l - 1]).multiplyScalar(k / (S * (S + k))), fy.subVectors(Q[l + 1], Q[l]).multiplyScalar(S / (k * (S + k))), U.addVectors(uy, fy);
    };
    s(t, Yy), s(t + 1, Ly);
    let a = e * e, n = a * e, r = 2 * n - 3 * a + 1, c = n - 2 * a + e, h = -2 * n + 3 * a, D = n - a;
    return C.copy(Q[t]).multiplyScalar(r).addScaledVector(Yy, c * o).addScaledVector(Q[t + 1], h).addScaledVector(Ly, D * o), C.x *= g, C;
  }
  get fn() {
    return (A, I, g, C) => this.point(A, I, g, C);
  }
  vOfY(A, I, g = 0, C = 1) {
    let Q = g, i = C;
    for (let E = 0; E < 40; E++) {
      let t = (Q + i) / 2;
      this.point(A, t, 1, Zd).y < I ? Q = t : i = t;
    }
    return (Q + i) / 2;
  }
}, uy = new y(), fy = new y(), Yy = new y(), Ly = new y(), Zd = new y(), SQ = (B, A) => typeof B == "number" ? B : B(A), Jt = new y(), Nt = new y(), br = new y(), my = new y();
function YB(B, A, I, g, C = new y()) {
  if (B(A + 7e-4, I, g, Jt), B(A - 7e-4, I, g, Nt), br.subVectors(Jt, Nt), br.lengthSq() < 1e-12) {
    let t = Math.max(0, I - 0.03);
    B(A + 7e-4, t, g, Jt), B(A - 7e-4, t, g, Nt), br.subVectors(Jt, Nt);
  }
  B(A, Math.min(1, I + 15e-4), g, Jt), B(A, Math.max(0, I - 15e-4), g, Nt), my.subVectors(Jt, Nt), C.crossVectors(my, br).multiplyScalar(g);
  let E = C.length();
  return E < 1e-12 || !isFinite(E) ? C.set(0, 1, 0) : C.divideScalar(E);
}
function jc(B, A, I, g, C, Q = {}) {
  let i = Q.nu ?? 24, E = Q.nv ?? 16, t = Q.side ?? 1, [o, e, s, a] = Q.gap ?? [0, 0, 0, 0], n = new y(), r = new y(), c = (K) => {
    let G = (SQ(g, K) + SQ(C, K)) / 2, M = 5e-4;
    return B(K + M, G, t, n).distanceTo(B(K - M, G, t, r)) / (2 * M);
  }, h = A + (o ? o / Math.max(1e-6, c(A)) : 0), D = I - (e ? e / Math.max(1e-6, c(I)) : 0), l = Q.uvScale ?? 1, U = [], S = [], k = [];
  for (let K = 0; K <= i; K++) {
    let G = K / i;
    Q.uCluster === "both" ? G = 0.5 - 0.5 * Math.cos(G * Math.PI) : Q.uCluster === "end1" ? G = Math.sin(G * Math.PI / 2) : Q.uCluster === "end0" && (G = 1 - Math.cos(G * Math.PI / 2));
    let M = h + (D - h) * G, p = SQ(g, M), d = SQ(C, M);
    (s || a) && (s && (p += s / Math.max(1e-6, B(M, p + 15e-4, t, n).distanceTo(B(M, p, t, r)) / 15e-4)), a && (d -= a / Math.max(1e-6, B(M, d, t, n).distanceTo(B(M, d - 15e-4, t, r)) / 15e-4)));
    let R = [], u = [], q = [], L = 0, b = null;
    for (let W = 0; W <= E; W++) {
      let j = W / E;
      Q.vCluster && (j = 0.5 - 0.5 * Math.cos(j * Math.PI));
      let oA = Q.vAbs ? Math.min(Math.max(Q.vAbs[0] + (Q.vAbs[1] - Q.vAbs[0]) * j, p), d) : p + (d - p) * j, H = B(M, oA, t, new y()), O = YB(B, M, oA, t, new y());
      Q.offset && H.addScaledVector(O, Q.offset), b && (L += H.distanceTo(b)), b = H, R.push(H), u.push(O), q.push([H.z / l, L / l]);
    }
    U.push(R), S.push(u), k.push(q);
  }
  return Or(U, S, k, t, Q.thickness ?? 0, Q.openEdges, Q.flip);
}
function Or(B, A, I, g, C, Q, i = false) {
  let E = B.length - 1, t = B[0].length - 1, o = (s, a) => {
    let n = [], r = [], c = [], h = [], D = t + 1;
    for (let U = 0; U <= E; U++) for (let S = 0; S <= t; S++) {
      let k = B[U][S], K = A[U][S];
      n.push(k.x - K.x * s, k.y - K.y * s, k.z - K.z * s);
      let G = a ? -1 : 1;
      r.push(K.x * G, K.y * G, K.z * G), c.push(I[U][S][0], I[U][S][1]);
    }
    let l = g > 0 !== a;
    for (let U = 0; U < E; U++) for (let S = 0; S < t; S++) {
      let k = U * D + S, K = (U + 1) * D + S, G = k + 1, M = K + 1;
      l ? h.push(k, G, K, K, G, M) : h.push(k, K, G, K, M, G);
    }
    return qy(n, r, c, h);
  }, e = { outer: o(0, i) };
  if (C > 0) {
    e.inner = o(C, true);
    let s = [], a = [], n = [], r = [], c = [[], [], [], []];
    for (let h = 0; h <= t; h++) c[0].push([0, h]);
    for (let h = 0; h <= E; h++) c[3].push([h, t]);
    for (let h = t; h >= 0; h--) c[1].push([E, h]);
    for (let h = E; h >= 0; h--) c[2].push([h, 0]);
    for (let h = 0; h < 4; h++) {
      if (Q?.[h]) continue;
      let D = c[h], l = s.length / 3, U = 0;
      for (let S = 0; S < D.length; S++) {
        let [k, K] = D[S], G = B[k][K], M = A[k][K], [p, d] = D[Math.min(D.length - 1, S + 1)], [R, u] = D[Math.max(0, S - 1)], q = B[p][d].clone().sub(B[R][u]).normalize(), L = new y().crossVectors(q, M).normalize().multiplyScalar(g > 0 ? 1 : -1);
        S > 0 && (U += G.distanceTo(B[D[S - 1][0]][D[S - 1][1]])), s.push(G.x, G.y, G.z, G.x - M.x * C, G.y - M.y * C, G.z - M.z * C), a.push(L.x, L.y, L.z, L.x, L.y, L.z), n.push(U, 0, U, C);
      }
      for (let S = 0; S < D.length - 1; S++) {
        let k = l + S * 2, K = k + 1, G = k + 2, M = k + 3;
        g > 0 ? r.push(k, K, G, G, K, M) : r.push(k, G, K, G, M, K);
      }
    }
    r.length && (e.edge = qy(s, a, n, r));
  }
  return e;
}
function qy(B, A, I, g) {
  let C = new SI();
  return C.setAttribute("position", new XA(B, 3)), C.setAttribute("normal", new XA(A, 3)), C.setAttribute("uv", new XA(I, 2)), C.setIndex(g), C;
}
function ii(B, A, I, g, C = {}) {
  let Q = C.nz ?? 24, i = C.nx ?? 24, [E, t, o] = C.gap ?? [0, 0, 0], e = A + E, s = I - t, a = [], n = [], r = [], c = C.uvScale ?? 1;
  for (let h = 0; h <= Q; h++) {
    let D = h / Q;
    C.zCluster === "both" ? D = 0.5 - 0.5 * Math.cos(D * Math.PI) : C.zCluster === "end1" ? D = Math.sin(D * Math.PI / 2) : C.zCluster === "end0" && (D = 1 - Math.cos(D * Math.PI / 2));
    let l = e + (s - e) * D, U = Math.max(0, SQ(g, l) - o), S = [], k = [], K = [];
    for (let G = 0; G <= i; G++) {
      let M = G / i, d = (-1 + 2 * (0.5 - 0.5 * Math.cos(M * Math.PI))) * U, R = new y(d, B(d, l), l), u = Xc(B, d, l, new y());
      C.offset && R.addScaledVector(u, C.offset), S.push(R), k.push(u), K.push([d / c, l / c]);
    }
    a.push(S), n.push(k), r.push(K);
  }
  return Or(a, n, r, -1, C.thickness ?? 0, C.openEdges);
}
function wQ(B, A, I, g, C = {}) {
  let Q = C.nz ?? 8, i = C.nx ?? 32, [E, t, o] = C.gap ?? [0, 0, 0], e = [], s = [], a = [], n = C.uvScale ?? 1, r = A - o;
  for (let c = 0; c <= Q; c++) e.push([]), s.push([]), a.push([]);
  for (let c = 0; c <= i; c++) {
    let h = -r + 2 * r * c / i, D = Math.abs(h), l = SQ(I, D) + E, U = SQ(g, D) - t;
    for (let S = 0; S <= Q; S++) {
      let k = l + (U - l) * S / Q, K = new y(h, B(h, k), k), G = Xc(B, h, k, new y());
      C.offset && K.addScaledVector(G, C.offset), e[S].push(K), s[S].push(G), a[S].push([h / n, k / n]);
    }
  }
  return Or(e, s, a, -1, C.thickness ?? 0, C.openEdges);
}
function Xc(B, A, I, g) {
  let Q = (B(A + 2e-3, I) - B(A - 2e-3, I)) / 4e-3, i = (B(A, I + 2e-3) - B(A, I - 2e-3)) / (2 * 2e-3);
  return g.set(-Q, 1, -i).normalize();
}
function Hy(B, A, I, g, C, Q, i = {}) {
  let E = i.nz ?? 16, t = i.nx ?? 8, o = [], e = [], s = [], a = i.uvScale ?? 1;
  for (let n = 0; n <= E; n++) {
    let r = A + (I - A) * n / E, c = SQ(g, r), h = SQ(C, r), D = [], l = [], U = [];
    for (let S = 0; S <= t; S++) {
      let k = Q * (c + (h - c) * S / t), K = new y(k, B(k, r), r);
      D.push(K), l.push(Xc(B, k, r, new y())), U.push([k / a, r / a]);
    }
    o.push(D), e.push(l), s.push(U);
  }
  return Or(o, e, s, Q > 0 ? -1 : 1, i.thickness ?? 0, i.openEdges);
}
function vr(B, A) {
  let I = B.spec;
  return new dt({ ...I, w: I.w - A, front: { ...I.front, L: I.front.L - A }, rear: { ...I.rear, L: I.rear.L - A } }, B.fr);
}
function Ei(B) {
  let A = B.index;
  for (let g = 0; g < A.count; g += 3) {
    let C = A.getX(g + 1);
    A.setX(g + 1, A.getX(g + 2)), A.setX(g + 2, C);
  }
  let I = B.attributes.normal;
  for (let g = 0; g < I.count; g++) I.setXYZ(g, -I.getX(g), -I.getY(g), -I.getZ(g));
  return B;
}
function AQ(B, A) {
  let I = [], g = new y(), C = new y(), Q = new y(), i = new y(), E = (o, e, s) => {
    C.subVectors(e, o), Q.subVectors(s, o), i.crossVectors(C, Q), !(i.lengthSq() < 1e-14) && (g.copy(o).add(e).add(s).divideScalar(3), i.dot(A(g)) < 0 ? I.push(o.x, o.y, o.z, s.x, s.y, s.z, e.x, e.y, e.z) : I.push(o.x, o.y, o.z, e.x, e.y, e.z, s.x, s.y, s.z));
  };
  for (let o = 0; o < B.length - 1; o++) for (let e = 0; e < B[o].length - 1; e++) {
    let s = B[o][e], a = B[o + 1][e], n = B[o][e + 1], r = B[o + 1][e + 1];
    E(s, a, n), E(a, r, n);
  }
  let t = new SI();
  return t.setAttribute("position", new XA(I, 3)), t.setAttribute("uv", new XA(new Float32Array(I.length / 3 * 2), 2)), t.computeVertexNormals(), t;
}
function Rt(B, A = true) {
  let I = [], g = new y(), C = new y(), Q = new y(), i = new y(), E = new y(), t = (D) => D.reduce((l, U) => l.add(U), new y()).divideScalar(D.length), o = (D, l, U, S) => {
    g.subVectors(l, D), C.subVectors(U, D), Q.crossVectors(g, C), !(Q.lengthSq() < 1e-16) && (Q.dot(S) < 0 ? I.push(D.x, D.y, D.z, U.x, U.y, U.z, l.x, l.y, l.z) : I.push(D.x, D.y, D.z, l.x, l.y, l.z, U.x, U.y, U.z));
  }, e = B.map(t);
  for (let D = 0; D < B.length - 1; D++) {
    let l = B[D], U = B[D + 1];
    i.copy(e[D]).add(e[D + 1]).multiplyScalar(0.5);
    for (let S = 0; S < l.length; S++) {
      let k = (S + 1) % l.length;
      E.copy(l[S]).add(U[S]).add(l[k]).add(U[k]).multiplyScalar(0.25);
      let K = E.clone().sub(i);
      o(l[S], U[S], l[k], K), o(U[S], U[k], l[k], K);
    }
  }
  let s = new SI();
  s.setAttribute("position", new XA(I, 3));
  let a = bi(s, 1e-6);
  a.computeVertexNormals();
  let n = [a.toNonIndexed()];
  if (A && B.length > 1) {
    I = [];
    for (let [l, U] of [[0, 1], [B.length - 1, B.length - 2]]) {
      let S = e[l].clone().sub(e[U]), k = B[l];
      for (let K = 0; K < k.length; K++) o(e[l], k[K], k[(K + 1) % k.length], S);
    }
    let D = new SI();
    D.setAttribute("position", new XA(I, 3)), D.computeVertexNormals(), n.push(D);
  }
  let r = [], c = [];
  for (let D of n) r.push(...D.attributes.position.array), c.push(...D.attributes.normal.array);
  let h = new SI();
  return h.setAttribute("position", new XA(r, 3)), h.setAttribute("normal", new XA(c, 3)), h.setAttribute("uv", new XA(new Float32Array(r.length / 3 * 2), 2)), h;
}
function zc(B) {
  let A = B.length, I = B.map((Q) => Q[0]), g = B.map((Q) => Q[1]), C = new Array(A).fill(0);
  for (let Q = 1; Q < A - 1; Q++) {
    let i = I[Q] - I[Q - 1], E = I[Q + 1] - I[Q];
    C[Q] = (g[Q] - g[Q - 1]) / i * (E / (i + E)) + (g[Q + 1] - g[Q]) / E * (i / (i + E));
  }
  return C[0] = (g[1] - g[0]) / (I[1] - I[0]), C[A - 1] = (g[A - 1] - g[A - 2]) / (I[A - 1] - I[A - 2]), (Q) => {
    if (Q <= I[0]) return g[0] + C[0] * (Q - I[0]) * 0;
    if (Q >= I[A - 1]) return g[A - 1];
    let i = 0;
    for (; Q > I[i + 1]; ) i++;
    let E = I[i + 1] - I[i], t = (Q - I[i]) / E, o = t * t, e = o * t;
    return (2 * e - 3 * o + 1) * g[i] + (e - 2 * o + t) * E * C[i] + (-2 * e + 3 * o) * g[i + 1] + (e - o) * E * C[i + 1];
  };
}
var V = { hw: 0.965, zF: 2.44, zR: -2.88, axleF: 1.45, axleR: -1.45, track: 0.795, wheelR: 0.345, tyreW: 0.235, archR: 0.448, archY: 0.352, zWS0: 0.84, zWS1: 0.21, zRW0: -1.87, zRW1: -1.28, roofY: 1.49, zHood: 0.855, zDoorSplit: -0.385, zDoorR0: -1.48, zLid: -1.955, yDoorBot: 0.33, yFloor: 0.29, yBumperF: 0.6, yBumperR: 0.64, yLampTop: 0.8 }, Ig = (B, A, I) => {
  let g = Math.min(1, Math.max(0, (I - B) / (A - B)));
  return g * g * (3 - 2 * g);
}, _d = [[-2.8, 0.99], [-2.6, 0.998], [-2.3, 1.002], [-1.87, 1], [-1.4, 0.994], [-0.6, 0.986], [0.3, 0.98], [0.8, 0.972], [0.855, 0.968], [1.2, 0.952], [1.6, 0.93], [2, 0.906], [2.3, 0.882]], Wd = zc(_d);
function Vd(B) {
  let A = Ig(0.8, 0.95, B), I = Ig(-1.9, -2.05, B);
  return 6e-3 + A * 0.014 + I * 8e-3;
}
function TI(B, A) {
  let I = Math.min(1, (B / 0.9) ** 2);
  return Wd(A) + Vd(A) * (1 - I);
}
var jd = [[-2.9, 0.36], [-2.6, 0.33], [-2.3, 0.28], [-1.9, 0.236], [-1, 0.226], [1, 0.226], [1.6, 0.232], [1.9, 0.255], [2.2, 0.3], [2.44, 0.33]], Xd = zc(jd);
function CB(B, A) {
  let I = Math.abs(B), g = Ig(0.78, 0.6, I), C = Ig(-0.98, -1.12, A), Q = Xd(A) + 0.03 * g * Ig(2.25, 1.9, A) * Ig(-2.45, -2.1, A), i = Ig(0.2, 0.12, I) * Ig(-1.1, -0.9, A);
  return Math.max(Q, Q + (0.44 - Q) * C * g, Q + (0.43 - Q) * i);
}
var $c = (B, A, I) => typeof B.y == "number" ? B.y : B.y(A, I);
function zd(B, A, I) {
  return (g, C, Q) => {
    let i = Ig(0.25, 0.9, Q), E = Ig(0.25, 0.9, -Q);
    return $c(B, g, C) * (1 - i - E) + $c(A, g, C) * i + $c(I, g, C) * E;
  };
}
var ut = { zA: -1.95, zB: 1.9, u1: 0.215, u2: 0.215, u3: 0.815, u4: 0.815 };
function LB(B, A, I, g = 2.2, C = 6, Q = 2.4, i = 7) {
  let E = V.zF + A.n, t = V.zR - I.n, o = 0.05, e = 0.04, s = { zc: ut.zB, L: E - ut.zB - o, a: g, b: C, bow: o }, a = { zc: ut.zA, L: ut.zA - t - e, a: Q, b: i, bow: e };
  return { w: V.hw + B.n, front: s, rear: a, y: zd(B, A, I) };
}
var gB = (B, A) => (I, g) => B(I, g) + A, $d = [LB({ n: -0.13, y: CB }, { n: -0.3, y: CB }, { n: -0.27, y: CB }), LB({ n: -0.05, y: gB(CB, -5e-3) }, { n: -0.13, y: gB(CB, -0.01) }, { n: -0.12, y: gB(CB, -4e-3) }), LB({ n: -0.018, y: gB(CB, 0.02) }, { n: -0.045, y: gB(CB, 0.035) }, { n: -0.04, y: gB(CB, 0.035) }), LB({ n: -8e-3, y: 0.365 }, { n: -0.012, y: 0.405 }, { n: -0.01, y: 0.45 }), LB({ n: 0, y: 0.56 }, { n: 0, y: 0.485 }, { n: 0, y: 0.545 }), LB({ n: -3e-3, y: 0.72 }, { n: -0.022, y: 0.59 }, { n: -0.015, y: 0.64 }), LB({ n: -1e-3, y: 0.8 }, { n: -0.048, y: 0.675 }, { n: -0.026, y: 0.74 }), LB({ n: -9e-3, y: 0.885 }, { n: -0.066, y: 0.77 }, { n: -0.036, y: 0.85 }), LB({ n: -0.022, y: gB(TI, -0.026) }, { n: -0.08, y: gB(TI, -0.04) }, { n: -0.045, y: gB(TI, -0.04) }), LB({ n: -0.048, y: gB(TI, -5e-3) }, { n: -0.108, y: gB(TI, -0.01) }, { n: -0.068, y: gB(TI, -7e-3) }), LB({ n: -0.1, y: TI }, { n: -0.16, y: TI }, { n: -0.11, y: TI })], yQ = $d.map((B) => new dt(B, ut)), Rg = new Xe(yQ), zi = yQ[yQ.length - 1], Ty = yQ[0], eC = zi.spec.w, ti = { zA: -1.05, zB: -0.05, u1: 0.26, u2: 0.4, u3: 0.56, u4: 0.7 };
function Xi(B, A, I, g, C, Q, i = 2, E = 3, t = 2, o = 3) {
  return { w: B, front: { zc: A, L: I - A - 0.035, a: i, b: E, bow: 0.035 }, rear: { zc: g, L: g - C - 0.03, a: t, b: o, bow: 0.03 }, y: Q };
}
var ze = (B, A, I, g = false) => (C, Q, i) => {
  let E = Ig(0.25, 0.9, i), t = Ig(0.25, 0.9, -i), o = B * (1 - E - t) + A * E + I * t;
  return g ? o : TI(C, Q) + o;
}, AR = [Xi(eC, 0.7, V.zWS0, V.zDoorR0, V.zRW0, (B, A) => TI(B, A), 2, 5, 2, 3.6), Xi(eC - 0.035, 0.7, V.zWS0 - 0.015, V.zDoorR0, V.zRW0 + 0.012, ze(6e-3, 0.012, 0.01), 2, 5, 2, 3.6), Xi(eC - 0.043, 0.66, V.zWS0 - 0.07, V.zDoorR0 + 0.04, V.zRW0 + 0.06, ze(0.06, 0.055, 0.045), 2, 4.5, 2, 3.4), Xi(eC - 0.072, 0.32, 0.52, -1.26, -1.58, ze(1.25, 1.25, 1.25, true), 2, 3.4, 2, 3.4), Xi(eC - 0.1, 0.08, 0.3, -1.12, -1.38, ze(1.428, 1.428, 1.428, true), 2, 3.2, 2, 3.2), Xi(eC - 0.122, 0.02, 0.255, -1.08, -1.325, ze(1.472, 1.472, 1.472, true)), Xi(eC - 0.158, -0.05, V.zWS1, -1.05, V.zRW1, () => V.roofY)], ft = AR.map((B) => new dt(B, ti)), rg = new Xe(ft), kQ = ft[0], $e = ft[ft.length - 1], gg = { ledge: rg.vk[1], glassLo: rg.vk[2] + 0.01, glassHi: rg.vk[4] - 0.012, doorTop: (rg.vk[4] + rg.vk[5]) / 2 };
function Yt(B, A) {
  let I = Math.abs(B), g = Ig(0.2, 0.55, A), C = (0.18 + 0.08 * g) * Ig(0.19 + 0.04 * g, 0.1 + 0.05 * g, I) * Ig(-1.05, -0.9, A), Q = 0.3 * Ig(0.5, 0.84, A), i = 0.19 * Ig(-0.96, -1.06, A), E = 0.045 * Ig(0.74, 0.8, I);
  return V.yFloor + Math.max(C, i) + Q + E;
}
function Pr(B, A) {
  let I = $e.xAtZ(A), g = I > 1e-3 ? Math.min(1, (B / I) ** 2) : 1, C = Ig(V.zRW1 - 0.02, V.zRW1 + 0.28, A) * Ig(V.zWS1 + 0.02, V.zWS1 - 0.3, A), Q = 1 - ((A - (V.zWS1 + V.zRW1) / 2) / ((V.zWS1 - V.zRW1) / 2)) ** 2;
  return V.roofY + (0.03 * (1 - g) + 8e-3 * Math.max(0, Q) * (1 - g)) * C;
}
var Cg = (B) => Vc(ut, B), by = (B) => Vc(ti, B), MQ = (B, A) => Rg.vOfY(B, A, Rg.vk[1], Rg.vk[8]);
var UQ = { f0: V.axleF - V.archR, f1: V.axleF + V.archR, r0: V.axleR - V.archR, r1: V.axleR + V.archR };
function m(B, A, ...I) {
  for (let g of I) g && (B[A] ??= []).push(g);
}
function bg(B, A, I, g = A) {
  m(B, A, I.outer, I.edge), I.inner && m(B, g, I.inner);
}
function Vr(B) {
  B.deleteAttribute("normal");
  let A = bi(B, 1e-5);
  return A.computeVertexNormals(), A;
}
var xy = (B, A) => typeof B == "number" ? B : B(A), Cl = { x: 0, z: 0, nx: 0, nz: 0 };
function Al(B, A) {
  let I = B.fr.u4, g = 1;
  for (let C = 0; C < 44; C++) {
    let Q = (I + g) / 2;
    B.plan(Q, Cl).x > A ? I = Q : g = Q;
  }
  return (I + g) / 2;
}
function Il(B, A) {
  let I = 0, g = B.fr.u1;
  for (let C = 0; C < 44; C++) {
    let Q = (I + g) / 2;
    B.plan(Q, Cl).x < A ? I = Q : g = Q;
  }
  return (I + g) / 2;
}
var Zr = yQ[6], Oy = ft[3], UA = { tl0: Il(Zr, 0.4), tl1: Il(Zr, 0.945), archR0: Cg(UQ.r0), doorR0: Cg(V.zDoorR0), archR1: Cg(UQ.r1), split: Cg(V.zDoorSplit), hood: Cg(V.zHood), archF0: Cg(UQ.f0), archF1: Cg(UQ.f1), hl1: Al(Zr, 0.935), hl0: Al(Zr, 0.44), gRW: Il(Oy, 0.62), gC: ti.u1, gVent: ti.u2, gSplit: by(V.zDoorSplit), gA: ti.u4, gW: Al(Oy, 0.735) }, oi = { ws0: rg.vk[1], ws1: rg.vk[4], rw0: rg.vk[1] + 0.02, rw1: rg.vk[4] }, Bg = (B) => (A) => MQ(A, B);
function IR(B, A) {
  let I = yQ[4].plan(B, Cl);
  for (let g of [V.axleF, V.axleR]) {
    let C = I.z - g;
    if (Math.abs(C) < V.archR) return V.archY + Math.sqrt(V.archR * V.archR - C * C) + A;
  }
  return null;
}
var $i = (B) => (A) => {
  let I = IR(A, B);
  return MQ(A, I === null ? V.yDoorBot : I);
};
function Vy(B, A, I, g, C) {
  let Q = 1, i = 0;
  for (let o = 0; o <= 16; o++) {
    let e = I + (g - I) * o / 16;
    Q = Math.min(Q, xy(B, e)), i = Math.max(i, xy(A, e));
  }
  let E = Math.floor(Q * C - 1e-6) / C, t = Math.ceil(i * C + 1e-6) / C;
  return { vAbs: [Math.max(0, E), Math.min(1, t)], nv: Math.max(1, Math.round((Math.min(1, t) - Math.max(0, E)) * C)) };
}
function jy(B, A, I, g, C, Q = 1) {
  let i = 0, E = 24;
  for (let t = 0; t < E; t++) {
    let o = B + (A - B) * (t + 0.5) / E;
    i += Math.abs(A - B) / E * (o < I[0] || o > I[1] ? C : g);
  }
  return Math.max(3, Math.round(i * Q));
}
function bI(B, A, I, g, C, Q = {}) {
  let i = jy(A, I, [vy[0], vy[1]], 70, 140, Q.density);
  return jc(Rg.fn, A, I, g, C, { side: B, nu: i, ...Vy(g, C, A, I, 44), ...Q });
}
function lC(B, A, I, g, C, Q = {}) {
  let i = jy(A, I, [ti.u1, ti.u4], 90, 150, Q.density);
  return jc(rg.fn, A, I, g, C, { side: B, nu: i, ...Vy(g, C, A, I, 30), ...Q });
}
var vy = [0.215, 0.815];
function gl(B, A, I, g) {
  let C = B(A + 1e-3, I, 1, new y()), Q = B(A - 1e-3, I, 1, new y());
  return g / Math.max(1e-6, C.distanceTo(Q) / 2e-3);
}
var hg = 22e-4, gR = [[1, "l"], [-1, "r"]];
function CR(B, A, I, g) {
  let C = (s) => g[s] ??= {}, Q = Bg(V.yBumperR), i = Bg(V.yBumperF), E = Bg(V.yDoorBot), t = Rg.vk[1];
  bg(C("bumper_r"), "paint", bI(B, 0, UA.archR0, t, Q, { gap: [0, 4e-3, 0, hg], thickness: 0.03, openEdges: [true, false, false, false] })), m(I, "under", bI(B, 0, Cg(-1.93), 0, t).outer), bg(I, "paint", bI(B, 0, UA.tl0, Q, 1, { thickness: 0.02, openEdges: [true, true, false, true] })), bg(I, "paint", bI(B, UA.tl0, UA.tl1, Bg(0.935), 1)), bg(I, "paint", bI(B, UA.tl1, UA.archR0, Q, 1, { thickness: 0.02, openEdges: [false, true, false, true] })), bg(I, "paint", bI(B, UA.archR0, UA.doorR0, $i(0), 1, { uCluster: "end0", density: 2.6 })), bg(I, "paint", bI(B, UA.doorR0, UA.archR1, $i(0), $i(0.045), { density: 2.6 }));
  let o = C("door_r" + A);
  bg(o, "paint", bI(B, UA.doorR0, UA.archR1, $i(0.045), 1, { gap: [hg, 0, hg, 0], thickness: 0.09, openEdges: [false, true, false, true], density: 2.6 }), "doorIn"), bg(o, "paint", bI(B, UA.archR1, UA.split, E, 1, { gap: [0, hg, hg, 0], thickness: 0.09, openEdges: [true, false, false, true] }), "doorIn"), m(I, "paint", bI(B, UA.archR1, UA.archF0, 0, E).outer), bg(C("door_f" + A), "paint", bI(B, UA.split, UA.hood, E, 1, { gap: [hg, hg, hg, 0], thickness: 0.09, openEdges: [false, false, false, true] }), "doorIn");
  let e = C("fender_f" + A);
  bg(e, "paint", bI(B, UA.hood, UA.archF0, E, 1, { gap: [hg, 0, hg, hg], thickness: 0.012, openEdges: [false, true, false, false] })), bg(e, "paint", bI(B, UA.archF0, UA.archF1, $i(0), 1, { gap: [0, 0, 0, hg], uCluster: "both", thickness: 0.012, openEdges: [true, true, false, false], density: 2.6 })), bg(e, "paint", bI(B, UA.archF1, UA.hl1, i, 1, { gap: [0, hg, hg, hg], thickness: 0.012, openEdges: [true, false, false, false] })), bg(C("bumper_f"), "paint", bI(B, UA.archF1, 1, t, i, { gap: [4e-3, 0, 0, hg], thickness: 0.03, openEdges: [false, true, false, false] })), m(I, "under", bI(B, Cg(1.93), 1, 0, t).outer), bg(I, "paint", bI(B, UA.hl1, 1, Bg(V.yLampTop), 1, { thickness: 0.03, openEdges: [false, true, false, true] }));
  for (let [s, a] of [[UA.archR0, UA.archR1], [UA.archF0, UA.archF1]]) {
    let n = [];
    for (let r = 0; r <= 40; r++) {
      let c = s + (a - s) * r / 40;
      n.push(Rg.point(c, $i(0)(c), B, new y()).add(new y(-B * 4e-3, 0, 0)));
    }
    m(I, "paint", cg(n, 8e-3));
  }
}
function Py(B, A, I, g, C) {
  let Q = rg.fn, i = (gg.glassLo + gg.glassHi) / 2, E = gl(Q, A, i, 0.03), t = gl(Q, I, i, 0.03);
  bg(g, "paint", lC(B, A, I, 0, gg.ledge, { gap: [hg, hg, 0, 0], thickness: 0.02, openEdges: [false, false, true, false] })), m(g, "rubber", lC(B, A, I, gg.ledge, gg.glassLo, { gap: [hg, hg, 0, 0] }).outer), bg(g, "black", lC(B, A, I, gg.glassHi, gg.doorTop, { gap: [hg, hg, 0, hg], thickness: 0.028 })), bg(g, "black", lC(B, A, A + E, gg.glassLo, gg.glassHi, { gap: [hg, 0, 0, 0], thickness: 0.028 })), bg(g, "black", lC(B, I - t, I, gg.glassLo, gg.glassHi, { gap: [0, hg, 0, 0], thickness: 0.028 }));
  let o = (e, s) => m(g, "glass", lC(B, e, s, gg.glassLo - 6e-3, gg.glassHi + 6e-3, { offset: -9e-3, density: 0.5, nv: 8 }).outer);
  if (C !== void 0) {
    let e = gl(Q, C, i, 0.024);
    bg(g, "black", lC(B, C - e / 2, C + e / 2, gg.glassLo, gg.glassHi, { thickness: 0.02 })), o(A + E * 0.5, C - e * 0.3), o(C + e * 0.3, I - t * 0.5);
  } else o(A + E * 0.5, I - t * 0.5);
}
function BR(B, A, I, g) {
  let C = (Q) => g[Q] ??= {};
  m(C("window_r"), "glass", lC(B, 0, UA.gRW + 0.01, oi.rw0 - 4e-3, oi.rw1 + 4e-3, { offset: -5e-3, density: 0.6, nv: 10 }).outer), m(I, "paint", lC(B, 0, UA.gRW, 0, oi.rw0).outer), m(I, "paint", lC(B, 0, UA.gRW, oi.rw1, 1).outer), m(I, "paint", lC(B, UA.gRW, UA.gC, 0, 1, { uCluster: "both" }).outer), m(I, "paint", lC(B, UA.gC, UA.gA, gg.doorTop, 1).outer), m(I, "paint", lC(B, UA.gA, UA.gW, 0, 1).outer), m(C("windshield"), "glass", lC(B, UA.gW - 0.012, 1, oi.ws0 - 4e-3, oi.ws1 + 4e-3, { offset: -5e-3, density: 0.6, nv: 10 }).outer), m(I, "black", lC(B, UA.gW, 1, 0, oi.ws0).outer), m(I, "paint", lC(B, UA.gW, 1, oi.ws1, 1).outer), Py(B, UA.gC, UA.gSplit, C("door_r" + A), UA.gVent), Py(B, UA.gSplit, UA.gA, C("door_f" + A));
}
function QR(B, A) {
  let I = vr(zi, hg);
  bg(A.hood ??= {}, "paint", ii(TI, V.zHood + hg, I.tipF, (Q) => I.xAtZ(Q), { nz: 30, nx: 30, thickness: 0.03, zCluster: "end1" }), "paintIn"), bg(A.trunk ??= {}, "paint", ii(TI, I.tipR, V.zLid - hg, (Q) => I.xAtZ(Q), { nz: 22, nx: 30, thickness: 0.03, zCluster: "end0" }), "paintIn"), m(B, "paint", wQ(TI, eC, (Q) => kQ.F.zAtX(Q), V.zHood, { nx: 40, nz: 4, gap: [0, 0, 3e-3] }).outer), m(B, "paint", wQ(TI, eC, V.zLid, (Q) => kQ.R.zAtX(Q), { nx: 40, nz: 5 }).outer), m(B, "paint", ii(Pr, $e.tipR, $e.tipF, (Q) => $e.xAtZ(Q), { nz: 24, nx: 24, zCluster: "both" }).outer);
  let g = Ty, C = 0.6;
  m(B, "under", Ei(ii(CB, g.tipR, V.zHood, (Q) => Math.min(C, g.xAtZ(Q)), { nz: 50, nx: 22 }).outer)), m(B, "liner", Ei(ii(() => 0.17, 1, 2, 0.45, { nz: 4, nx: 4 }).outer));
  for (let [Q, i] of [[g.tipR, UQ.r0 - 0.03], [UQ.r1 + 0.03, UQ.f0 - 0.03], [UQ.f1 + 0.03, g.tipF]]) for (let E of [1, -1]) m(B, "under", Ei(Hy(CB, Q, i, C, (t) => Math.max(C, g.xAtZ(t)), E, { nz: 10, nx: 3 }).outer));
  for (let Q of [V.axleF, V.axleR]) {
    let i = V.archR + 0.014, E = [];
    E.push([Q + i + 0.03, 0.23]);
    for (let t = 0; t <= 28; t++) {
      let o = t / 28 * Math.PI;
      E.push([Q + Math.cos(o) * i, V.archY + Math.sin(o) * i]);
    }
    E.push([Q - i - 0.03, 0.23]);
    for (let t of [1, -1]) {
      let o = [0.6, 0.97].map((a) => E.map(([n, r]) => new y(t * a, r, n)));
      m(B, "liner", AQ(o, (a) => new y(0, V.archY, Q).sub(a)));
      let e = t * 0.6, s = [];
      for (let a = 0; a <= 28; a++) {
        let n = a / 28 * Math.PI;
        s.push([new y(e, V.archY + Math.sin(n) * i * 0.55, Q + Math.cos(n) * i * 0.55), new y(e, V.archY + Math.sin(n) * i, Q + Math.cos(n) * i)]);
      }
      m(B, "liner", AQ(s, () => new y(t, 0, 0)));
    }
  }
}
var _r = (B, A, I) => B.clone().addScaledVector(A, -I);
function Zy(B, A, I) {
  let C = Rg.point(B + 8e-4, A, I, new y()), Q = Rg.point(B - 8e-4, A, I, new y()), i = Rg.point(B, Math.min(1, A + 8e-4), I, new y()), E = Rg.point(B, Math.max(0, A - 8e-4), I, new y());
  return new y().crossVectors(i.sub(E), C.sub(Q)).multiplyScalar(I).normalize();
}
function _y(B, A, I) {
  let C = rg.point(B + 8e-4, A, I, new y()), Q = rg.point(B - 8e-4, A, I, new y()), i = rg.point(B, Math.min(1, A + 8e-4), I, new y()), E = rg.point(B, Math.max(0, A - 8e-4), I, new y()), t = new y().crossVectors(i.sub(E), C.sub(Q)).multiplyScalar(I);
  return t.lengthSq() < 1e-14 ? new y(I, 0, 0) : t.normalize();
}
function iR(B, A) {
  let I = Bg(V.yDoorBot), g = $i(0.045), C = [], Q = 40;
  for (let e = 0; e <= Q; e++) {
    let s = UA.doorR0 + (UA.hood - UA.doorR0) * e / Q, a = s < UA.archR1 ? g(s) : I(s), n = Rg.point(s, a, B, new y()), r = Zy(s, a, B), c = _r(n, r, 0.012).add(new y(0, 4e-3, 0)), h = Math.max(c.y, 0.335);
    C.push([n, c, new y(B * 0.8, h, n.z)]);
  }
  m(A, "paint", Vr(AQ(C, () => new y(0, 1, 0))));
  let i = (e, s, a) => {
    let n = e.map(([r, c]) => [r, _r(r, c, s * 0.35), _r(r, c, s)]);
    m(A, "paint", Vr(AQ(n, () => a)));
  }, E = (e, s, a, n, r) => {
    let c = [];
    for (let h = 0; h <= r; h++) {
      let D = a + (n - a) * h / r;
      c.push(e === "L" ? [Rg.point(s, D, B, new y()), Zy(s, D, B)] : [rg.point(s, D, B, new y()), _y(s, D, B)]);
    }
    return c;
  };
  i([...E("L", UA.hood, I(UA.hood), 1, 24)], 0.11, new y(0, 0, -1)), i(E("G", UA.gA, 0, gg.doorTop, 24), 0.07, new y(0, -0.3, -1)), i(E("L", UA.doorR0, g(UA.doorR0), 1, 20), 0.11, new y(0, 0, 1)), i(E("G", UA.gC, 0, gg.doorTop, 24), 0.07, new y(0, -0.3, 1));
  let t = [];
  for (let e = 0; e <= 50; e++) {
    let s = UA.gC + (UA.gA - UA.gC) * e / 50;
    t.push([rg.point(s, gg.doorTop, B, new y()), _y(s, gg.doorTop, B)]);
  }
  i(t, 0.06, new y(0, -1, 0));
  let o = [];
  for (let [e, s] of [...E("L", UA.split, I(UA.split), 1, 18), ...E("G", UA.gSplit, 0.02, gg.doorTop, 18)]) o.push(_r(e, s, 0.05));
  m(A, "paint", tR(o, B, 0.12, 0.08));
}
function Wy(B, A, I, g, C, Q, i, E, t) {
  for (let o of [1, -1]) {
    let e = [], s = [];
    for (let n = 0; n <= 40; n++) {
      let r = B + (A - B) * n / 40, c = zi.plan(r, { x: 0, z: 0, nx: 0, nz: 0 }), h = Math.abs(c.nz), D = new y(o * c.x, TI(c.x, c.z), c.z), l = new y(-o * c.nx, 0, -c.nz), U = g + (C - g) * Ig(0.2, 0.9, h), S = D.clone().addScaledVector(l, 0.022).add(new y(0, -0.014, 0)), k = D.clone().addScaledVector(l, U);
      k.y = Q(D, h);
      let K = k.clone();
      K.y = i, e.push([D, S, k]), s.push([k, K]);
    }
    m(I, "paintIn", Vr(AQ(e, t))), m(I, E, Vr(AQ(s, t)));
  }
}
function ER(B) {
  let A = (i) => new y(0, 1.3, 1.45).sub(i);
  Wy(UA.hood, 1, B, eC - 0.595, 0.15, (i, E) => 0.815 + (i.y - 0.05 - 0.815) * Ig(0.3, 0.9, E), 0.3, "paintIn", A);
  let I = [];
  for (let i = 0; i <= 24; i++) {
    let E = -eC + 2 * eC * i / 24;
    I.push([new y(E, Yt(E, V.zHood) - 0.025, V.zHood + 4e-3), new y(E, TI(E, V.zHood) - 4e-3, V.zHood + 4e-3)]);
  }
  m(B, "paintIn", AQ(I, () => new y(0, 0, 1)));
  for (let i of [1, -1]) {
    let E = new VA(0.085, 0.1, 0.07, 20);
    E.translate(i * 0.66, 0.845, V.axleF), m(B, "paintIn", E);
  }
  let g = (i) => new y(0, 1.4, -2.3).sub(i);
  Wy(0, Cg(V.zLid), B, 0.12, 0.1, (i) => i.y - 0.085, 0.46, "carpet", g);
  let C = [];
  for (let i = 0; i <= 24; i++) {
    let E = -eC + 2 * eC * i / 24;
    C.push([new y(E, 0.46, V.zLid - 4e-3), new y(E, TI(E, V.zLid) - 4e-3, V.zLid - 4e-3)]);
  }
  m(B, "carpet", AQ(C, () => new y(0, 0, -1)));
  let Q = zi.tipR + 0.1;
  m(B, "carpet", AQ([[new y(-0.745, 0.46, Q), new y(0.745, 0.46, Q)], [new y(-0.745, 0.46, V.zLid), new y(0.745, 0.46, V.zLid)]], () => new y(0, 1, 0)));
}
function cg(B, A, I = 6) {
  let g = new DC(B);
  return new nQ(g, Math.min(64, Math.max(6, B.length * 3)), A, I, false);
}
function tR(B, A, I, g) {
  let C = [];
  for (let Q = 0; Q < B.length; Q++) {
    let i = B[Q], E = B[Math.min(B.length - 1, Q + 1)].clone().sub(B[Math.max(0, Q - 1)]).normalize(), t = new y(0, 0, 1), o = new y().crossVectors(E, t).normalize();
    o.x * A < 0 && o.negate(), C.push([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([e, s]) => i.clone().addScaledVector(t, e * I / 2).addScaledVector(o, s * g / 2)));
  }
  return Rt(C);
}
var Wr = null;
function Bl() {
  if (Wr) return Wr;
  let B = {}, A = {};
  for (let [I, g] of gR) CR(I, g, B, A), BR(I, g, B, A), iR(I, B);
  return QR(B, A), ER(B), Wr = { shell: B, parts: A }, Wr;
}
var IC = 22e-4, oR = [[1, "l"], [-1, "r"]];
function ei(B, A, I) {
  let g = Rg.point(B, A, I, new y()), C = YB(Rg.fn, B, A, I);
  return { p: g, n: C };
}
function Ql(B, A, I) {
  let g = I.clone().setY(0).normalize(), C = new y(0, 1, 0), Q = new y().crossVectors(g, C).normalize();
  return B.applyMatrix4(new TA().makeBasis(g, C, Q)), B.translate(A.x, A.y, A.z), B;
}
function eR(B, A) {
  let I = [];
  for (let C = 0; C <= 10; C++) {
    let Q = C / 10;
    I.push(new eA(Math.max(4e-3, B * Q), A * Q * Q));
  }
  let g = new sQ(I, 24);
  return g.rotateX(Math.PI / 2), g;
}
function Xy(B) {
  let A = {}, I = Bg(V.yBumperF + 3e-3), g = Bg(V.yLampTop - 3e-3), C = UA.hl1 + 12e-4, Q = UA.hl0 - 12e-4;
  m(A, "lens", bI(B, C, Q, I, g, { offset: 2e-3, gap: [IC, IC, IC, IC] }).outer);
  let i = bI(B, C, Q, I, g, { offset: 2e-3, thickness: 0.09, gap: [IC, IC, IC, IC] });
  m(A, "housing", i.edge), m(A, "lampHousing", i.inner);
  let E = C + (Q - C) * 0.24;
  m(A, "indicator", bI(B, C + 2e-3, E, I, g, { offset: -0.018, gap: [4e-3, 3e-3, 0.012, 0.012] }).outer);
  for (let [t, o] of [[0.47, 0.056], [0.8, 0.05]]) {
    let e = C + (Q - C) * t, s = (I(e) + g(e)) / 2, { p: a, n } = ei(e, s, B), r = eR(o, 0.05), c = new nI().setFromUnitVectors(new y(0, 0, 1), n);
    r.applyQuaternion(c);
    let h = a.clone().addScaledVector(n, -0.075);
    r.translate(h.x, h.y, h.z), m(A, "lamp", r);
    let D = new ug(0.011, 10, 8), l = h.clone().addScaledVector(n, 0.02);
    D.translate(l.x, l.y, l.z), m(A, "lamp", D);
    let U = new Xg(o + 4e-3, 4e-3, 6, 24);
    U.applyQuaternion(c);
    let S = h.clone().addScaledVector(n, 0.05);
    U.translate(S.x, S.y, S.z), m(A, "chrome", U);
  }
  return A;
}
function zy(B) {
  let A = {}, I = Bg(V.yBumperR + 3e-3), g = Bg(0.932), C = UA.tl0 + 12e-4, Q = UA.tl1 - 12e-4, i = Bg(0.735), E = C + (Q - C) * 0.4;
  m(A, "tail", bI(B, C, Q, i, g, { offset: 2e-3, gap: [IC, IC, 15e-4, IC] }).outer), m(A, "reverse", bI(B, C, E, I, i, { offset: 2e-3, gap: [IC, 15e-4, IC, 15e-4] }).outer), m(A, "indicator", bI(B, E, Q, I, i, { offset: 2e-3, gap: [15e-4, IC, IC, 15e-4] }).outer);
  let t = bI(B, C, Q, I, g, { offset: 2e-3, thickness: 0.06, gap: [IC, IC, IC, IC] });
  m(A, "housing", t.inner, t.edge);
  for (let o of [0.78, 0.83, 0.88]) {
    let e = [];
    for (let s = 0; s <= 16; s++) {
      let a = C + 4e-3 + (Q - C - 8e-3) * s / 16, { p: n, n: r } = ei(a, Bg(o)(a), B);
      e.push(n.addScaledVector(r, -0.02));
    }
    m(A, "tailRib", cg(e, 6e-3, 4));
  }
  return A;
}
function $y() {
  let B = {};
  for (let [A] of oR) {
    let I = Bg(V.yBumperF), g = Bg(V.yLampTop);
    m(B, "grille", bI(A, UA.hl0, 1, I, g, { offset: -0.03 }).outer);
    for (let i = 1; i <= 4; i++) {
      let E = [];
      for (let t = 0; t <= 14; t++) {
        let o = UA.hl0 + 4e-3 + (1 - UA.hl0 - 4e-3) * t / 14, e = I(o) + (g(o) - I(o)) * i / 5, { p: s, n: a } = ei(o, e, A);
        E.push(s.addScaledVector(a, -0.016));
      }
      m(B, "blackGloss", cg(E, 9e-3, 5));
    }
    let C = [], Q = (i, E) => {
      let { p: t, n: o } = ei(i, E, A);
      return t.addScaledVector(o, 3e-3);
    };
    for (let i = 0; i <= 12; i++) C.push(Q(1 - (1 - UA.hl0) * i / 12, g(1 - (1 - UA.hl0) * i / 12) - 4e-3));
    for (let i = 1; i <= 6; i++) C.push(Q(UA.hl0 + 2e-3, g(UA.hl0) - (g(UA.hl0) - I(UA.hl0)) * i / 6));
    for (let i = 1; i <= 12; i++) C.push(Q(UA.hl0 + (1 - UA.hl0) * i / 12, I(UA.hl0 + (1 - UA.hl0) * i / 12) + 4e-3));
    m(B, "chrome", cg(C, 0.011, 6)), m(B, "blackGloss", bI(A, 0, UA.tl0 - 2e-3, Bg(0.7), Bg(0.915), { offset: 15e-4 }).outer), m(B, "grille", bI(A, aR(0.56), 1, Bg(0.3), Bg(0.39), { offset: 2e-3 }).outer);
  }
  return m(B, "grille", wQ(TI, 0.72, (A) => kQ.F.zAtX(A) + 4e-3, (A) => kQ.F.zAtX(A) + 0.05, { nx: 40, nz: 3, offset: 2e-3 }).outer), B;
}
function sR(B) {
  return [B.outer, B.inner, B.edge].filter(Boolean);
}
function aR(B) {
  let A = yQ[6], I = A.fr.u4, g = 1;
  for (let C = 0; C < 40; C++) {
    let Q = (I + g) / 2;
    A.plan(Q, { x: 0, z: 0, nx: 0, nz: 0 }).x > B ? I = Q : g = Q;
  }
  return (I + g) / 2;
}
function jr(B, A, I) {
  return sR(bI(B, Cg(A), Cg(I), Bg(0.53), Bg(0.56), { offset: 6e-3, thickness: 6e-3 }));
}
function il(B, A) {
  let I = {};
  m(I, "black", ...A ? jr(B, V.zDoorSplit + 0.012, V.zHood - 0.012) : jr(B, V.zDoorR0 + 0.012, V.zDoorSplit - 0.012));
  let g = A ? V.zDoorSplit + 0.15 : V.zDoorR0 + 0.16, { p: C, n: Q } = ei(Cg(g), Bg(0.905)(Cg(g)), B), i = new tg(6e-3, 0.055, 0.2, 2, 2e-3);
  m(I, "black", Ql(i, C.clone().addScaledVector(Q, 15e-4), Q));
  let E = new tg(0.026, 0.032, 0.17, 3, 0.011);
  m(I, "paint", Ql(E, C.clone().addScaledVector(Q, 0.014), Q));
  let t = new VA(9e-3, 9e-3, 0.01, 12);
  if (t.rotateZ(Math.PI / 2), A && m(I, "chrome", Ql(t, C.clone().addScaledVector(Q, 0.018).add(new y(0, 0, 0.1)), Q)), A) {
    let o = V.zHood - 0.12, s = ei(Cg(o), 1, B).p.clone().add(new y(B * 4e-3, 0.01, 0)), a = new tg(0.05, 0.05, 0.1, 2, 0.012);
    a.translate(s.x + B * 0.015, s.y + 0.02, s.z), m(I, "black", a);
    let n = cg([s.clone().add(new y(B * 0.025, 0.03, 0)), s.clone().add(new y(B * 0.055, 0.05, -0.012)), s.clone().add(new y(B * 0.075, 0.058, -0.02))], 0.014, 8);
    m(I, "black", n);
    let r = new tg(0.165, 0.12, 0.075, 4, 0.032);
    r.translate(s.x + B * 0.145, s.y + 0.072, s.z - 0.03), m(I, "paint", r);
    let c = new PI(0.145, 0.098);
    c.rotateY(Math.PI), c.translate(s.x + B * 0.145, s.y + 0.072, s.z - 0.0685), m(I, "mirror", c);
  }
  return I;
}
function Ak() {
  let B = ei(1, Bg(0.46)(1), 1), A = ei(0, Bg(0.755)(0), 1), I = new PI(0.52, 0.112);
  I.translate(0, B.p.y, B.p.z + 0.012);
  let g = new PI(0.52, 0.112);
  return g.rotateY(Math.PI), g.translate(0, A.p.y, A.p.z - 6e-3), { front: I, rear: g };
}
var nR = null;
function gk() {
  return nR ??= rR();
}
function Ik(B) {
  let A = B.index ? B.toNonIndexed() : B;
  return A.attributes.uv || A.setAttribute("uv", new XA(new Float32Array(A.attributes.position.count * 2), 2)), A.attributes.normal || A.computeVertexNormals(), A;
}
function rR() {
  let B = V.wheelR, A = V.tyreW, I = 0.216, g = A / 2, C = (h) => h.rotateZ(-Math.PI / 2), Q = [[I + 8e-3, -g * 0.9, 0], [I + 0.03, -g * 0.97, 0.06], [B - 0.07, -g * 1.02, 0.16], [B - 0.028, -g * 0.96, 0.25], [B - 8e-3, -g * 0.78, 0.31], [B, -g * 0.5, 0.36], [B, g * 0.5, 0.64], [B - 8e-3, g * 0.78, 0.69], [B - 0.028, g * 0.96, 0.75], [B - 0.07, g * 1.02, 0.84], [I + 0.03, g * 0.97, 0.94], [I + 8e-3, g * 0.9, 1]], i = AB(Q.map(([h, D]) => [h, D]), 56), E = i.attributes.uv;
  for (let h = 0; h < E.count; h++) E.setXY(h, E.getX(h) * 7, Q[h % Q.length][2]);
  C(i);
  let t = AB([[I + 0.012, 0.088], [I + 0.012, 0.08], [I + 2e-3, 0.072], [I - 4e-3, 0.06], [I - 0.012, 0.03], [0.17, 0.022], [0.168, 0.03]], 56), o = new Zg().absarc(0, 0, 0.17, 0, Math.PI * 2, false);
  o.holes.push(new ZB().absarc(0, 0, 0.085, 0, Math.PI * 2, true));
  for (let h = 0; h < 8; h++) {
    let D = h / 8 * Math.PI * 2 + Math.PI / 8;
    o.holes.push(new ZB().absarc(Math.cos(D) * 0.128, Math.sin(D) * 0.128, 0.022, 0, Math.PI * 2, true));
  }
  let e = new aQ(o, 20);
  e.rotateY(Math.PI / 2), e.translate(0.03, 0, 0);
  let s = AB([[0.085, 0.03], [0.082, 0.042], [0.07, 0.05], [1e-3, 0.052]], 36), a = new VA(I - 4e-3, I - 4e-3, A * 0.92, 48, 1, true);
  a.rotateZ(Math.PI / 2);
  let n = new VA(0.16, 0.16, 0.07, 36);
  n.rotateZ(Math.PI / 2), n.translate(-0.015, 0, 0);
  let r = AB([[0.052, 0.05], [0.051, 0.058], [0.046, 0.068], [0.034, 0.075], [0.016, 0.078], [1e-3, 0.079]], 32);
  C(r);
  let c = [];
  for (let h = 0; h < 5; h++) {
    let D = h / 5 * Math.PI * 2, l = new VA(95e-4, 0.0105, 0.016, 6);
    l.rotateZ(Math.PI / 2), l.translate(0.056, Math.cos(D) * 0.066, Math.sin(D) * 0.066), c.push(l);
  }
  return { tire: i, rim: Wg([C(t), e, C(s), a].map(Ik)), cap: r, drum: n, nuts: Wg(c.map(Ik)) };
}
function hR(B, A, I) {
  let g = B.map((C, Q) => {
    let i = B[Math.min(B.length - 1, Q + 1)].clone().sub(B[Math.max(0, Q - 1)]).normalize(), E = new y().crossVectors(new y(0, 1, 0), i);
    E.lengthSq() < 1e-6 && E.set(1, 0, 0), E.normalize();
    let t = new y().crossVectors(i, E).normalize();
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([o, e]) => C.clone().addScaledVector(E, o * A / 2).addScaledVector(t, e * I / 2));
  });
  return Rt(g);
}
function Ck(B, A, I, g = 6) {
  let C = new DC(Array.from({ length: g * 8 + 1 }, (Q, i) => {
    let E = i / (g * 8), t = E * g * Math.PI * 2;
    return new y(B.x + Math.cos(t) * I, B.y + E * A, B.z + Math.sin(t) * I);
  }));
  return new nQ(C, g * 10, 9e-3, 5, false);
}
var HI = (B, A, I) => new y(B, A, I), El = null;
function Bk() {
  if (El) return El;
  let B = {};
  for (let i of [1, -1]) {
    let E = [HI(i * 0.5, 0.33, 2.2), HI(i * 0.5, 0.3, 1.9), HI(i * 0.52, 0.26, 1.2), HI(i * 0.56, 0.2, 0.6), HI(i * 0.58, 0.195, -0.5), HI(i * 0.56, 0.21, -0.95), HI(i * 0.52, 0.34, -1.25), HI(i * 0.52, 0.36, -1.65), HI(i * 0.52, 0.33, -2), HI(i * 0.5, 0.33, -2.6)];
    m(B, "frame", hR(new DC(E).getPoints(40), 0.07, 0.1));
  }
  for (let [i, E, t] of [[2.15, 0.33, 0.1], [1.2, 0.24, 0.1], [0.25, 0.19, 0.07], [-0.9, 0.2, 0.08], [-1.95, 0.33, 0.09], [-2.55, 0.33, 0.1]]) {
    let o = i > 1 || i < -1.5 ? 0.5 : 0.58, e = new tg(o * 2, t, 0.08, 2, 0.015);
    e.translate(0, E, i), m(B, "frame", e);
  }
  for (let i of [1, -1]) {
    let E = HI(i * (V.track - 0.1), V.wheelR, V.axleF);
    m(B, "susp", cg([HI(i * 0.46, 0.25, V.axleF + 0.18), E.clone().add(HI(0, -0.13, 0)), HI(i * 0.46, 0.25, V.axleF - 0.2)], 0.022, 6)), m(B, "susp", cg([HI(i * 0.48, 0.56, V.axleF + 0.12), E.clone().add(HI(-i * 0.02, 0.15, 0)), HI(i * 0.48, 0.56, V.axleF - 0.14)], 0.018, 6));
    let t = new tg(0.05, 0.3, 0.07, 2, 0.015);
    t.translate(E.x, E.y, E.z), m(B, "susp", t), m(B, "spring", Ck(HI(i * 0.52, 0.3, V.axleF), 0.36, 0.05, 6));
    let o = new VA(0.022, 0.022, 0.42, 10);
    o.translate(i * 0.52, 0.49, V.axleF), m(B, "susp", o);
  }
  m(B, "susp", cg([HI(0.62, 0.3, V.axleF - 0.25), HI(0.45, 0.32, V.axleF + 0.28), HI(-0.45, 0.32, V.axleF + 0.28), HI(-0.62, 0.3, V.axleF - 0.25)], 0.013, 6));
  let A = new VA(0.028, 0.028, 0.8, 10);
  A.rotateZ(Math.PI / 2), A.translate(0, 0.3, V.axleF - 0.12), m(B, "susp", A);
  let I = new VA(0.045, 0.045, V.track * 2 - 0.2, 14);
  I.rotateZ(Math.PI / 2), I.translate(0, V.wheelR, V.axleR), m(B, "susp", I);
  let g = new ug(0.11, 18, 14);
  g.scale(1, 0.85, 1.15), g.translate(0, V.wheelR, V.axleR + 0.02), m(B, "susp", g);
  for (let i of [1, -1]) {
    m(B, "susp", cg([HI(i * 0.56, 0.24, -0.62), HI(i * 0.6, 0.26, -1.1), HI(i * 0.62, V.wheelR - 0.06, V.axleR)], 0.024, 6)), m(B, "spring", Ck(HI(i * 0.52, V.wheelR + 0.05, V.axleR - 0.03), 0.2, 0.06, 4));
    let E = new VA(0.021, 0.021, 0.36, 10);
    E.rotateX(0.25), E.translate(i * 0.4, 0.46, V.axleR - 0.1), m(B, "susp", E);
  }
  let C = new VA(0.12, 0.2, 0.62, 16);
  C.rotateX(Math.PI / 2), C.translate(0, 0.36, 0.75), m(B, "susp", C), m(B, "susp", cg([HI(0, 0.34, 0.42), HI(0, 0.34, -0.4), HI(0, V.wheelR, V.axleR + 0.16)], 0.036, 10));
  for (let i of [1, -1]) {
    let E = [HI(i * 0.24, 0.3, 1.25), HI(i * 0.28, 0.2, 0.9), HI(i * 0.3, 0.18, 0.1), HI(i * 0.34, 0.2, -0.95), HI(i * 0.38, 0.38, -1.25), HI(i * 0.4, 0.38, -1.7), HI(i * 0.42, 0.28, -2.2), HI(i * 0.44, 0.27, -2.84)];
    m(B, "exhaust", cg(new DC(E).getPoints(16), 0.028, 8));
    let t = new tg(0.2, 0.12, 0.5, 3, 0.04);
    t.translate(i * 0.31, 0.19, -0.35), m(B, "exhaust", t);
    let o = new VA(0.036, 0.034, 0.12, 16, 1, true);
    o.rotateX(Math.PI / 2), o.translate(i * 0.44, 0.27, -2.86), m(B, "chrome", o);
    let e = new VA(0.03, 0.03, 0.11, 16, 1, true);
    e.rotateX(Math.PI / 2), e.scale(-1, 1, 1), e.translate(i * 0.44, 0.27, -2.86), m(B, "engineDark", e, new VC(0.03, 16).translate(i * 0.44, 0.27, -2.83).rotateY(0));
  }
  let Q = new tg(0.9, 0.16, 0.5, 3, 0.05);
  return Q.translate(0, 0.17, -0.62), m(B, "frame", Q), El = B, B;
}
var QH = new y(-0.44, 0.27, -2.92);
var tl = /* @__PURE__ */ new Map();
function AE(B, A) {
  return tl.has(B) || tl.set(B, A()), tl.get(B);
}
var BB = { big: (B) => 2.36 - B * 4.72, small: (B) => 1 - B * 2 }, XI = { w: 0.3, h: 0.1, tach: [-0.088, 0], speed: [0.088, 0], fuel: [0, 0.022], temp: [0, -0.024], bigR: 0.043, smallR: 0.018 }, As = 1024 / XI.w, Qk = (B) => 512 + B * As, ik = (B) => (XI.h / 2 - B) * As;
function ol() {
  return AE("cluster2010", () => {
    let B = Math.round(XI.h * As), [A, I] = jg(1024, B), g = I.createLinearGradient(0, 0, 0, B);
    g.addColorStop(0, "#0a0b0d"), g.addColorStop(1, "#131519"), I.fillStyle = g, I.fillRect(0, 0, 1024, B), I.textAlign = "center", I.textBaseline = "middle";
    let C = (i, E, t, o, e, s, a, n, r, c = 0.22) => {
      let h = Qk(i[0]), D = ik(i[1]), l = E * As, U = I.createLinearGradient(h - l, D - l, h + l, D + l);
      U.addColorStop(0, "#d9dde2"), U.addColorStop(0.5, "#6b7078"), U.addColorStop(1, "#c5c9cf"), I.strokeStyle = U, I.lineWidth = 7, I.beginPath(), I.arc(h, D, l + 10, 0, Math.PI * 2), I.stroke();
      let S = I.createRadialGradient(h, D - l * 0.3, l * 0.1, h, D, l + 8);
      S.addColorStop(0, "#1b1e23"), S.addColorStop(1, "#07080a"), I.fillStyle = S, I.beginPath(), I.arc(h, D, l + 7, 0, Math.PI * 2), I.fill();
      let k = (K, G) => {
        let M = n(K / t);
        return [h - Math.sin(M) * G, D - Math.cos(M) * G];
      };
      for (let K = 0; K <= t + 1e-6; K += o) {
        let G = Math.abs(K / e - Math.round(K / e)) < 1e-6, [M, p] = k(K, l - (G ? 22 : 11)), [d, R] = k(K, l);
        if (I.strokeStyle = K >= a ? "#e0412e" : "#f2f1ec", I.lineWidth = G ? 5 : 2.2, I.beginPath(), I.moveTo(M, p), I.lineTo(d, R), I.stroke(), G) {
          let [u, q] = k(K, l - 26 - l * c * 0.9);
          I.fillStyle = K >= a ? "#e0412e" : "#f2f1ec", I.font = `600 ${Math.round(l * c)}px ${KB}`, I.fillText(r(K), u, q);
        }
      }
      I.fillStyle = "#9aa0a8", I.font = `500 ${Math.round(l * 0.13)}px ${NC}`, I.fillText(s, h, D + l * 0.45);
    };
    C(XI.tach, XI.bigR, 7, 0.5, 1, "x1000 r/min", 6, BB.big, (i) => String(i)), C(XI.speed, XI.bigR, 220, 10, 20, "km/h", 999, BB.big, (i) => String(i), 0.155);
    let Q = (i, E, t, o, e) => {
      let s = Qk(i[0]), a = ik(i[1]), n = XI.smallR * As;
      for (let h = 0; h <= 4; h++) {
        let D = BB.small(h / 4), l = n - (h % 2 ? 7 : 12), U = o ? h === 0 : h === 4;
        I.strokeStyle = U ? "#e0412e" : "#f2f1ec", I.lineWidth = h % 2 ? 2 : 3.5, I.beginPath(), I.moveTo(s - Math.sin(D) * l, a - Math.cos(D) * l), I.lineTo(s - Math.sin(D) * n, a - Math.cos(D) * n), I.stroke();
      }
      I.fillStyle = "#f2f1ec", I.font = `600 17px ${KB}`;
      let r = BB.small(0), c = BB.small(1);
      I.fillText(E, s - Math.sin(r) * (n + 12), a - Math.cos(r) * (n + 12) + 6), I.fillText(t, s - Math.sin(c) * (n + 12), a - Math.cos(c) * (n + 12) + 6), I.fillStyle = "#8c929a", I.font = `500 15px ${NC}`, I.fillText(e, s, a + 16);
    };
    return Q(XI.fuel, "E", "F", true, "FUEL"), Q(XI.temp, "C", "H", false, "TEMP"), Tg(A);
  });
}
function Ek() {
  let [B, A] = jg(256, 64);
  return { canvas: B, ctx: A, tex: Tg(B), last: -1 };
}
function Lt(B, A) {
  let I = Math.floor(A * 10);
  if (I === B.last) return;
  B.last = I;
  let g = B.ctx;
  g.fillStyle = "#05070a", g.fillRect(0, 0, 256, 64), g.font = `600 40px ${KB}`, g.textAlign = "right", g.textBaseline = "middle", g.fillStyle = "#9fe3ff", g.fillText(`${Math.floor(A) % 1e6}`, 196, 34), g.font = `500 22px ${NC}`, g.fillText("km", 244, 38), B.tex.needsUpdate = true;
}
function tk() {
  let [B, A] = jg(512, 128);
  return { canvas: B, ctx: A, tex: Tg(B), last: "" };
}
function mt(B, A, I, g = "") {
  let C = I ? `${A.toFixed(1)}|${g}` : "off";
  if (C === B.last) return;
  B.last = C;
  let Q = B.ctx;
  Q.fillStyle = "#04070a", Q.fillRect(0, 0, 512, 128), I && (Q.fillStyle = "#7fd4ff", Q.textBaseline = "middle", Q.textAlign = "left", Q.font = `600 26px ${NC}`, Q.fillText("FM", 26, 44), Q.font = `600 70px ${KB}`, Q.textAlign = "right", Q.fillText(A.toFixed(1), 380, 56), Q.font = `500 24px ${NC}`, Q.textAlign = "left", Q.fillText("MHz", 392, 70), g && (Q.font = `500 24px ${NC}`, Q.fillText(g.slice(0, 28), 26, 108))), B.tex.needsUpdate = true;
}
function el(B) {
  return AE("icon:" + B, () => {
    let [A, I] = jg(64, 64);
    if (I.clearRect(0, 0, 64, 64), I.strokeStyle = "#fff", I.fillStyle = "#fff", I.lineWidth = 5, I.lineCap = "round", I.lineJoin = "round", B === "oil") I.beginPath(), I.moveTo(10, 40), I.lineTo(20, 30), I.lineTo(42, 30), I.lineTo(54, 22), I.lineTo(46, 40), I.closePath(), I.stroke(), I.beginPath(), I.arc(56, 36, 3, 0, Math.PI * 2), I.fill();
    else if (B === "batt") I.strokeRect(10, 22, 44, 28), I.fillRect(16, 16, 8, 6), I.fillRect(40, 16, 8, 6), I.fillRect(16, 34, 10, 4), I.fillRect(38, 34, 10, 4), I.fillRect(41, 31, 4, 10);
    else if (B === "beam") {
      I.beginPath(), I.moveTo(34, 14), I.bezierCurveTo(14, 14, 14, 50, 34, 50), I.closePath(), I.stroke();
      for (let C = 0; C < 4; C++) I.beginPath(), I.moveTo(40, 20 + C * 8), I.lineTo(58, 20 + C * 8), I.stroke();
    } else B === "hand" ? (I.beginPath(), I.arc(32, 32, 16, 0, Math.PI * 2), I.stroke(), I.beginPath(), I.arc(32, 32, 25, -0.7, 0.7), I.stroke(), I.beginPath(), I.arc(32, 32, 25, Math.PI - 0.7, Math.PI + 0.7), I.stroke(), I.font = `700 24px ${NC}`, I.textAlign = "center", I.textBaseline = "middle", I.fillText("!", 32, 33)) : (I.beginPath(), I.moveTo(8, 32), I.lineTo(28, 16), I.lineTo(28, 48), I.closePath(), I.fill(), I.beginPath(), I.moveTo(56, 32), I.lineTo(36, 16), I.lineTo(36, 48), I.closePath(), I.fill());
    return Tg(A);
  });
}
function ok(B) {
  let [A, I] = jg(512, 112);
  I.fillStyle = "#eceae3", I.fillRect(0, 0, 512, 112), I.strokeStyle = "#161616", I.lineWidth = 5, I.strokeRect(6, 6, 500, 100), I.fillStyle = "#161616", I.font = `700 76px ${KB}`, I.textAlign = "center", I.textBaseline = "middle", I.fillText(B, 256, 60), I.fillStyle = "rgba(110,85,50,0.22)";
  for (let g = 0; g < 50; g++) I.fillRect(Math.random() * 512, Math.random() * 112, Math.random() * 26, Math.random() * 5);
  return Tg(A);
}
function ek() {
  return AE("gate", () => {
    let [B, A] = jg(128, 256);
    return A.fillStyle = "#111214", A.fillRect(0, 0, 128, 256), A.fillStyle = "#e8e8e8", A.font = `700 34px ${NC}`, A.textAlign = "center", A.textBaseline = "middle", ["P", "R", "N", "D"].forEach((I, g) => A.fillText(I, 34, 40 + g * 52)), A.fillStyle = "#2a2c30", A.fillRect(70, 20, 14, 216), Tg(B);
  });
}
function sk(B, A, I, g = 256, C = 128) {
  return AE(`label:${B.join("|")}:${A}:${I}`, () => {
    let [Q, i] = jg(g, C);
    return i.fillStyle = A, i.fillRect(0, 0, g, C), i.fillStyle = I, i.textAlign = "center", i.textBaseline = "middle", B.forEach((E, t) => {
      i.font = `${t === 0 ? 700 : 500} ${Math.round(t === 0 ? C * 0.28 : C * 0.14)}px ${NC}`, i.fillText(E, g / 2, C * (0.32 + t * 0.3));
    }), Tg(Q);
  });
}
function ak() {
  return AE("meshGrille", () => {
    let [B, A] = jg(128, 128);
    A.fillStyle = "#18191b", A.fillRect(0, 0, 128, 128), A.fillStyle = "#060607";
    for (let g = 0; g < 16; g++) for (let C = 0; C < 16; C++) A.beginPath(), A.arc(4 + g * 8 + C % 2 * 4, 4 + C * 8, 2.2, 0, Math.PI * 2), A.fill();
    let I = Tg(B, true, true);
    return I.repeat.set(3, 3), I;
  });
}
function nk() {
  return AE("veneer", () => {
    let [B, A] = jg(512, 128);
    A.fillStyle = "#3b2415", A.fillRect(0, 0, 512, 128);
    for (let g = 0; g < 90; g++) {
      let C = Math.random() * 128, Q = 0.05 + Math.random() * 0.12;
      A.strokeStyle = Math.random() < 0.5 ? `rgba(20,10,4,${Q})` : `rgba(120,70,35,${Q})`, A.lineWidth = 0.6 + Math.random() * 2.2, A.beginPath(), A.moveTo(0, C);
      for (let i = 0; i <= 512; i += 16) A.lineTo(i, C + Math.sin(i * 0.013 + g) * 5 + Math.sin(i * 0.05 + g * 2) * 1.5);
      A.stroke();
    }
    let I = Tg(B, true, true);
    return I.repeat.set(4, 1), I;
  });
}
function rk() {
  return AE("fins", () => {
    let [B, A] = jg(128, 128);
    A.fillStyle = "#1d1e1f", A.fillRect(0, 0, 128, 128), A.fillStyle = "#4a4c4e";
    for (let g = 0; g < 128; g += 3) A.fillRect(g, 0, 1, 128);
    A.fillStyle = "#2c2d2f";
    for (let g = 0; g < 128; g += 16) A.fillRect(0, g, 128, 4);
    let I = Tg(B, true, true);
    return I.repeat.set(6, 4), I;
  });
}
var kA = (B, A, I) => new y(B, A, I), uC = V.yFloor;
function QB(B, A = false) {
  let I = B.length, g = B[0].length, C = new Float32Array(I * g * 3);
  B.forEach((E, t) => E.forEach((o, e) => C.set([o.x, o.y, o.z], (t * g + e) * 3)));
  let Q = [];
  for (let E = 0; E < I - 1; E++) for (let t = 0; t < g - 1; t++) {
    let o = E * g + t, e = (E + 1) * g + t, s = o + 1, a = e + 1;
    A ? Q.push(o, s, e, e, s, a) : Q.push(o, e, s, e, a, s);
  }
  let i = new SI();
  return i.setAttribute("position", new GI(C, 3)), i.setIndex(Q), i.computeVertexNormals(), i;
}
function fA(B, A, I, g, C, Q = 0, i = 0, E = 0, t = 2) {
  let o = new tg(B, A, I, t, Math.min(g, B / 2 - 1e-4, A / 2 - 1e-4, I / 2 - 1e-4));
  return (Q || i || E) && o.applyMatrix4(new TA().makeRotationFromEuler(new $I(Q, i, E))), o.translate(C.x, C.y, C.z), o;
}
function vC(B, A, I, g, C = 0, Q = 0, i = 0, E = 16) {
  let t = new VA(B, A, I, E);
  return (C || Q || i) && t.applyMatrix4(new TA().makeRotationFromEuler(new $I(C, Q, i))), t.translate(g.x, g.y, g.z), t;
}
function qt(B, A, I, g, C) {
  return B.applyMatrix4(new TA().makeBasis(I, g, new y().crossVectors(I, g).normalize()).setPosition(A)), B;
}
function Dk(B, A) {
  let I = B.map((g) => A.map(([C, Q]) => g.o.clone().addScaledVector(g.a, C).addScaledVector(g.b, Q)));
  return [Rt(I)];
}
function ck(B, A, I, g = 3) {
  let C = [], Q = (i, E, t) => {
    for (let o = 0; o <= g; o++) {
      let e = t + o / g * (Math.PI / 2);
      C.push([i + Math.cos(e) * I, E + Math.sin(e) * I]);
    }
  };
  return Q(B - I, A / 2 - I, 0), Q(I, A / 2 - I, Math.PI / 2), Q(I, -A / 2 + I, Math.PI), Q(B - I, -A / 2 + I, Math.PI * 1.5), C;
}
function DR(B) {
  m(B, "carpet", wQ(Yt, 0.8, -1.12, 0.846, { nx: 56, nz: 34 }).outer), m(B, "under", Ei(wQ((A, I) => Yt(A, I) - 0.02, 0.8, 0.2, 0.846, { nx: 30, nz: 8 }).outer));
  for (let [A, I, g, C] of [[0.42, 0.2, 0.46, 0.56], [-0.42, 0.2, 0.46, 0.56], [0.45, -0.72, 0.42, 0.36], [-0.45, -0.72, 0.42, 0.36]]) m(B, "mat", fA(g, 8e-3, C, 3e-3, kA(A, Yt(A, I) + 4e-3, I)));
}
function cR(B) {
  let A = Math.min(Math.abs(B), 0.864), I = kQ.F.zAtX(A), g = [Math.min(I - 0.016, 0.826), TI(A, I) + 0.012], C = [g, [0.62, 1.03], [0.47, 1.045], [0.39, 1.04], [0.36, 1.015], [0.352, 0.985], [0.352, 0.975], [0.353, 0.965], [0.354, 0.955], [0.36, 0.84], [0.43, 0.68], [0.6, 0.61], [0.85, 0.6]], Q = [g, [0.62, 1.05], [0.48, 1.102], [0.39, 1.106], [0.345, 1.09], [0.35, 1.07], [0.462, 1.05], [0.442, 0.94], [0.37, 0.915], [0.36, 0.84], [0.46, 0.7], [0.6, 0.62], [0.85, 0.6]], i = [g, [0.62, 1.03], [0.47, 1.045], [0.39, 1.04], [0.34, 1.015], [0.32, 0.98], [0.315, 0.95], [0.312, 0.9], [0.31, 0.8], [0.31, 0.7], [0.32, 0.6], [0.36, 0.52], [0.42, 0.5]], E = B > 0 ? Ig(0.2, 0.25, B) * Ig(0.64, 0.59, B) : 0, t = Ig(0.19, 0.14, Math.abs(B)), o = 1 - E - t;
  return C.map((e, s) => [e[0] * o + Q[s][0] * E + i[s][0] * t, e[1] * o + Q[s][1] * E + i[s][1] * t]);
}
var al = 56, Xr = 0.86;
function nl(B) {
  return new DC(cR(B).map(([I, g]) => kA(B, g, I)), false, "centripetal").getPoints(al);
}
function Ah(B, A) {
  let I = nl(B), g = Math.floor(8 / 12 * al), C = Math.ceil(9 / 12 * al);
  for (let Q = g; Q < C; Q++) {
    let i = I[Q], E = I[Q + 1];
    if ((i.y - A) * (E.y - A) <= 0) return i.clone().lerp(E, (i.y - A) / (i.y - E.y || 1));
  }
  return I[C].clone();
}
function lR(B) {
  let A = [];
  for (let g = 0; g <= 70; g++) A.push(nl(-Xr + 2 * Xr * g / 70));
  m(B, "dash", QB(A));
  for (let g of [1, -1]) {
    let C = nl(g * Xr), Q = new Zg(C.map((E) => new eA(E.z, E.y)));
    Q.lineTo(0.85, C[0].y);
    let i = new aQ(Q, 1);
    if (i.rotateY(-Math.PI / 2), g > 0) {
      i.scale(-1, 1, 1);
      let E = i.index;
      for (let t = 0; t < E.count; t += 3) {
        let o = E.getX(t + 1);
        E.setX(t + 1, E.getX(t + 2)), E.setX(t + 2, o);
      }
      i.computeVertexNormals();
    }
    i.translate(g * Xr, 0, 0), m(B, "dashD", i);
  }
  for (let [g, C] of [[-0.84, -0.2], [0.2, 0.84]]) {
    let Q = [];
    for (let i = 0; i <= 40; i++) {
      let E = g + (C - g) * i / 40, t = Ah(E, 0.866), o = Ah(E, 0.894);
      Q.push([t, t.clone().add(kA(0, 0, -4e-3)), o.clone().add(kA(0, 0, -4e-3)), o]);
    }
    m(B, "wood", QB(Q, (g < 0, false)));
  }
  for (let [g, C, Q, i] of [[0.735, 0.93, 0.349, 0.13], [-0.735, 0.93, 0.349, 0.13], [0.066, 0.925, 0.309, 0.1], [-0.066, 0.925, 0.309, 0.1]]) {
    let E = kA(g, C, Q);
    m(B, "trim", fA(i + 0.016, 0.066, 0.012, 6e-3, E)), m(B, "black", fA(i, 0.05, 4e-3, 1e-3, E.clone().add(kA(0, 0, -5e-3))));
    for (let t = -1; t <= 1; t++) m(B, "trim", fA(i - 8e-3, 6e-3, 0.014, 2e-3, E.clone().add(kA(0, t * 0.014, -4e-3)), 0.25, 0, 0, 1));
  }
  m(B, "red", fA(0.022, 0.018, 0.01, 3e-3, kA(0, 0.925, 0.305))), m(B, "trim", fA(0.2, 0.075, 0.012, 8e-3, kA(0, 0.72, 0.305)));
  for (let g of [-0.06, 0, 0.06]) m(B, "knob", vC(0.019, 0.02, 0.022, kA(g, 0.72, 0.293), Math.PI / 2, 0, 0, 20)), m(B, "chrome", vC(0.0205, 0.0205, 4e-3, kA(g, 0.72, 0.2995), Math.PI / 2, 0, 0, 20));
  m(B, "black", fA(0.16, 0.05, 6e-3, 6e-3, kA(0, 0.64, 0.314))), m(B, "dashD", fA(0.11, 0.1, 0.02, 0.03, kA(0.42, 0.835, 0.365), -0.3)), m(B, "black", fA(0.026, 0.2, 0.012, 4e-3, kA(0.34, 0.5, 0.64), -0.5)), m(B, "rubber", fA(0.075, 0.055, 0.014, 6e-3, kA(0.34, 0.405, 0.6), -0.9)), m(B, "black", fA(0.018, 0.22, 0.01, 3e-3, kA(0.52, 0.5, 0.68), -0.35)), m(B, "rubber", fA(0.05, 0.12, 0.012, 5e-3, kA(0.52, 0.4, 0.64), -0.95));
}
function lk() {
  let B = kA(0.42, 1.05, 0.462), A = kA(0.42, 0.94, 0.442), I = B.clone().sub(A).normalize(), g = new y().crossVectors(kA(-1, 0, 0), I).normalize();
  return { o: B.clone().add(A).multiplyScalar(0.5).addScaledVector(g, 4e-3), x: kA(-1, 0, 0), y: I, z: g };
}
function Sk() {
  return legacyGlovebox();
}
var rl = { hub: kA(0.42, 0.98, 0.1), dir: kA(0, 0.423, -0.906) };
function wk() {
  return legacySteering();
}
function yk() {
  let B = {};
  return m(B, "chrome", fA(7e-3, 0.018, 0.035, 2e-3, kA(0, 0, 0.012))), m(B, "black", fA(0.012, 0.036, 0.032, 0.01, kA(0, 0, 0.044))), m(B, "chrome", new Xg(0.012, 25e-4, 6, 16).translate(0, 0.02, 0.07)), B;
}
var Ht = kA(0, 0.556, 0.13), kk = kA(0.068, 0.568, -0.2);
function SR(B) {
  m(B, "console", fA(0.26, 0.28, 0.6, 0.03, kA(0, uC + 0.13, 0.02))), m(B, "console", fA(0.26, 0.34, 0.4, 0.035, kA(0, uC + 0.16, -0.43))), m(B, "armrest", fA(0.25, 0.045, 0.38, 0.02, kA(0, uC + 0.34, -0.43))), m(B, "trim", fA(0.1, 0.22, 0.012, 4e-3, kA(0, 0.555, 0.02), -0.05)), m(B, "black", fA(0.075, 4e-3, 0.2, 4e-3, kA(0, Ht.y - 1e-3, Ht.z)));
  for (let A of [-0.02, -0.11]) m(B, "black", vC(0.037, 0.037, 2e-3, kA(-0.058, uC + 0.271, A), 0, 0, 0, 24)), m(B, "black", new Xg(0.038, 4e-3, 6, 24).rotateX(Math.PI / 2).translate(-0.058, uC + 0.272, A));
  m(B, "black", fA(0.09, 0.05, 4e-3, 4e-3, kA(0, uC + 0.2, -0.632)));
}
function Mk() {
  let B = {};
  return m(B, "black", vC(0.02, 0.035, 0.05, kA(0, 0.022, 0), 0, 0, 0, 16)), m(B, "chrome", vC(7e-3, 7e-3, 0.1, kA(0, 0.08, 0))), m(B, "knob", fA(0.045, 0.07, 0.06, 0.02, kA(0, 0.145, 8e-3), 0.2)), m(B, "chrome", fA(0.012, 0.02, 0.01, 3e-3, kA(-0.024, 0.15, 0.02))), B;
}
function Uk() {
  let B = {};
  return m(B, "trim", fA(0.034, 0.03, 0.2, 0.012, kA(0, 0.01, 0.1))), m(B, "knob", fA(0.036, 0.034, 0.08, 0.014, kA(0, 0.012, 0.19))), m(B, "chrome", vC(7e-3, 7e-3, 0.012, kA(0, 0.012, 0.235), Math.PI / 2, 0, 0, 12)), B;
}
function sl(B) {
  let A = rg.vk[4];
  return B <= UA.gRW || B >= UA.gW ? A : B < UA.gC ? A + (gg.doorTop - A) * Ig(UA.gRW, UA.gC, B) : B > UA.gA ? gg.doorTop + (A - gg.doorTop) * Ig(UA.gA, UA.gW, B) : gg.doorTop;
}
var hk = 0.035;
function si(B, A) {
  return Pr(B, A) - 0.048;
}
function wR(B) {
  for (let I of [1, -1]) {
    let g = [];
    for (let i = 0; i <= 120; i++) {
      let E = i / 120, t = [], o = sl(E);
      for (let s = 0; s <= 4; s++) {
        let a = o + (1 - o) * s / 4, n = rg.point(E, a, I, new y());
        t.push(n.addScaledVector(YB(rg.fn, E, a, I), -hk));
      }
      let e = t[t.length - 1];
      for (let s = 1; s <= 10; s++) {
        let a = s / 10, n = e.x * (1 - a);
        t.push(kA(n, e.y + (si(n, e.z) - e.y) * Ig(0, 0.3, a), e.z));
      }
      g.push(t);
    }
    m(B, "headliner", QB(g, I < 0));
    for (let [i, E] of [[UA.gRW, UA.gC], [UA.gA, UA.gW]]) {
      let t = [];
      for (let o = 0; o <= 12; o++) {
        let e = i + (E - i) * o / 12, s = [], a = gg.ledge, n = sl(e);
        for (let r = 0; r <= 10; r++) {
          let c = a + (n - a) * r / 10;
          s.push(rg.point(e, c, I, new y()).addScaledVector(YB(rg.fn, e, c, I), -hk));
        }
        t.push(s);
      }
      m(B, "trim", QB(t, I < 0));
      for (let o of [0, 12]) {
        let e = i + (E - i) * o / 12, s = t[o].map((a, n) => {
          let r = gg.ledge + (sl(e) - gg.ledge) * n / 10;
          return [a, rg.point(e, r, I, new y()).addScaledVector(YB(rg.fn, e, r, I), -4e-3)];
        });
        m(B, "trim", QB(s));
      }
    }
    let C = [];
    for (let i = 0; i <= 16; i++) {
      let E = 0.38 + 0.62 * i / 16, t = UA.split, o = MQ(t, Math.min(E, 0.97));
      E < 0.97 && C.push(Rg.point(t, o, I, new y()).addScaledVector(YB(Rg.fn, t, o, I), -0.1));
    }
    for (let i = 0; i <= 16; i++) {
      let E = 0.02 + (gg.doorTop - 0.02) * i / 16;
      C.push(rg.point(UA.gSplit, E, I, new y()).addScaledVector(YB(rg.fn, UA.gSplit, E, I), -0.1));
    }
    let Q = C.map((i, E) => {
      let t = C[Math.min(C.length - 1, E + 1)].clone().sub(C[Math.max(0, E - 1)]).normalize(), o = kA(0, 0, 1), e = new y().crossVectors(t, o).normalize().multiplyScalar(-I);
      return { o: i, a: o, b: e };
    });
    m(B, "trim", ...Dk(Q, ck(0.022, 0.13, 8e-3).map(([i, E]) => [E, i])));
  }
  m(B, "trim", fA(0.17, 0.02, 0.09, 8e-3, kA(0, si(0, -0.35) - 6e-3, -0.35))), m(B, "dome", fA(0.13, 8e-3, 0.055, 3e-3, kA(0, si(0, -0.35) - 0.016, -0.35))), m(B, "trim", fA(0.22, 0.03, 0.12, 0.012, kA(0, si(0, 0.12) - 0.012, 0.12), 0.12)), m(B, "dome", fA(0.05, 6e-3, 0.035, 2e-3, kA(0.05, si(0, 0.12) - 0.028, 0.115), 0.12)), m(B, "dome", fA(0.05, 6e-3, 0.035, 2e-3, kA(-0.05, si(0, 0.12) - 0.028, 0.115), 0.12));
  for (let I of [1, -1]) m(B, "visor", fA(0.34, 0.022, 0.17, 0.01, kA(I * 0.39, si(I * 0.39, 0.1) - 0.016, 0.1), 0.1));
  m(B, "black", vC(9e-3, 9e-3, 0.06, kA(0, si(0, 0.22) - 0.03, 0.225), 0.5)), m(B, "black", fA(0.26, 0.068, 0.035, 0.016, kA(0, 1.345, 0.2), 0.12)), m(B, "mirror", fA(0.24, 0.056, 4e-3, 0.012, kA(0, 1.343, 0.181), 0.12));
}
function yR(B) {
  let A = (g) => -1.6 + 0.115 * Ig(0.56, 0.62, g);
  m(B, "shelf", wQ((g, C) => TI(g, C) - 0.012, 0.845, (g) => Math.min(A(g) - 0.01, kQ.R.zAtX(Math.min(g, 0.86)) - 4e-3), A, { nx: 36, nz: 5 }).outer);
  for (let g of [1, -1]) m(B, "speaker", vC(0.065, 0.065, 6e-3, kA(g * 0.47, TI(0.47, -1.73) - 9e-3, -1.73), 0, 0, 0, 28));
  for (let g of [1, -1]) {
    let C = V.archR + 0.06, Q = [];
    Q.push([V.axleR + C, uC]);
    for (let t = 0; t <= 24; t++) {
      let o = t / 24 * Math.PI;
      Q.push([V.axleR + Math.cos(o) * C, V.archY + Math.sin(o) * C]);
    }
    let i = [0.56, 0.8].map((t) => Q.map(([o, e]) => kA(g * t, e, o)));
    m(B, "carpet", QB(i, g < 0)), m(B, "carpet", QB(Q.map(([t, o]) => [kA(g * 0.56, Math.min(o, uC), t), kA(g * 0.56, o, t)]), g > 0));
    let E = [];
    for (let t = 0; t <= 6; t++) {
      let o = V.zDoorR0 - 5e-3 - t / 6 * 0.14, e = o - V.axleR, s = V.archY + Math.sqrt(Math.max(0, C * C - e * e));
      E.push([kA(g * 0.8, s, o), kA(g * 0.83, (s + TI(0.84, o)) / 2, o), kA(g * 0.84, TI(0.84, o) - 0.014, o)]);
    }
    m(B, "trim", QB(E, g < 0));
  }
}
var $r = 0.09;
function zr(B, A, I, g = 0) {
  let C = Cg(A), Q = MQ(C, I), i = Rg.point(C, Q, B, new y()), E = YB(Rg.fn, C, Q, B);
  return { p: i.addScaledVector(E, -($r + g)), n: E.clone().negate() };
}
function kR(B) {
  let A = B - V.axleR;
  return Math.abs(A) < V.archR ? V.archY + Math.sqrt(V.archR * V.archR - A * A) + 0.045 : V.yDoorBot;
}
function hl(B, A, I) {
  let g = {}, C = A ? V.zDoorSplit + 0.012 : V.zDoorR0 + 0.012, Q = A ? V.zHood - 0.012 : V.zDoorSplit - 0.012, i = Cg(C), E = Cg(Q);
  m(g, "doorTrim", bI(B, i, E, (u) => MQ(u, 0.87), 1, { offset: -($r + 4e-3), flip: true }).outer);
  let t = A ? C + 0.05 : Math.max(C + 0.05, -1.08), o = Q - 0.06;
  m(g, "doorInsert", bI(B, Cg(t), Cg(o), (u) => MQ(u, 0.71), (u) => MQ(u, 0.85), { offset: -($r + 6e-3), flip: true }).outer);
  let e = [], s = 18;
  for (let u = 0; u <= s; u++) {
    let q = C + (Q - C) * u / s, L = Cg(q), b = Rg.point(L, 1, B, new y()).addScaledVector(YB(Rg.fn, L, 1, B), -$r - 4e-3), W = eC - 0.044 - 0.024;
    e.push([b, kA(B * (Math.abs(b.x) - 4e-3), b.y + 0.045, q), kA(B * (W + 0.012), 1.035, q), kA(B * W, 1.05, q)]);
  }
  m(g, "doorTrim", QB(e, B < 0));
  let a = (u, q, L, b, W, j) => {
    let oA = [];
    for (let H = 0; H <= 10; H++) {
      let O = u + (q - u) * H / 10, { p: IA, n: _ } = zr(B, O, L, 2e-3);
      oA.push({ o: IA, a: _.setY(0).normalize(), b: kA(0, 1, 0) });
    }
    m(g, j, ...Dk(oA, ck(b, W, Math.min(0.014, W / 2 - 2e-3), 2)));
  }, n = A ? C + 0.1 : -1.02, r = A ? Q - 0.3 : Q - 0.12;
  a(n, r, 0.655, 0.075, 0.05, "doorTrim");
  let c = A ? C + 0.22 : -0.98, h = A ? Q - 0.1 : Q - 0.08;
  a(c, h, 0.44, 0.032, 0.04, "doorTrim");
  let D = zr(B, r - 0.07, 0.685, 0.06), l = D.n.clone().setY(0).normalize(), U = kA(0, 0, 1), S = kA(0, 1, 0);
  m(g, "black", qt(fA(0.05, 0.014, I ? 0.15 : 0.07, 6e-3, kA(0, 0, 0)), D.p, l, S, U));
  let k = I ? 4 : 1;
  for (let u = 0; u < k; u++) {
    let q = (u - (k - 1) / 2) * 0.032;
    m(g, "switch", qt(fA(0.024, 0.012, 0.018, 4e-3, kA(0, 8e-3, q), 0, 0, 0.3, 1), D.p, l, S, U));
  }
  let K = A ? Q - 0.14 : Q - 0.12, G = zr(B, K, 0.845, 4e-3), M = G.n.clone().setY(0).normalize();
  m(g, "black", qt(fA(0.012, 0.045, 0.12, 8e-3, kA(0, 0, 0)), G.p, M, S, U)), m(g, "chrome", qt(fA(0.012, 0.016, 0.09, 6e-3, kA(8e-3, 0, 5e-3)), G.p, M, S, U));
  let p = Q - 0.2, d = zr(B, p, 0.5, 3e-3), R = d.n.clone().setY(0).normalize();
  return m(g, "speaker", qt(vC(0.068, 0.068, 6e-3, kA(0, 0, 0), 0, 0, Math.PI / 2, 28), d.p, R, S, U)), m(g, "doorTrim", qt(new Xg(0.068, 5e-3, 6, 28).rotateY(Math.PI / 2), d.p, R, S, U)), g;
}
var KQ = { frontX: 0.42, frontZ: -0.38, rearZ: -1.16 };
function Dl(B) {
  let A = {}, I = KQ.frontZ, g = Math.sign(B);
  for (let s of [-0.19, 0.19]) m(A, "black", fA(0.032, 0.03, 0.54, 6e-3, kA(B + s, uC + 0.015, I)));
  m(A, "trim", fA(0.48, 0.1, 0.46, 0.02, kA(B, uC + 0.08, I))), m(A, "black", fA(0.018, 0.02, 0.1, 6e-3, kA(B + g * 0.25, uC + 0.1, I + 0.12)));
  let C = -0.07, Q = uC + 0.175, i = (s, a, n, r, c, h, D) => fA(s, a, n, r, kA(B + c, Q + h + -D * Math.sin(C), I + D), C);
  m(A, "seat", i(0.5, 0.11, 0.5, 0.045, 0, 0, 0)), m(A, "seat", i(0.09, 0.065, 0.46, 0.03, 0.205, 0.07, 0)), m(A, "seat", i(0.09, 0.065, 0.46, 0.03, -0.205, 0.07, 0)), m(A, "seatInsert", i(0.3, 0.014, 0.42, 6e-3, 0, 0.056, 0.01));
  let E = kA(B, uC + 0.22, I - 0.22), o = new TA().makeRotationX(-0.24).setPosition(E), e = (s) => s.applyMatrix4(o);
  m(A, "seat", e(fA(0.5, 0.58, 0.11, 0.045, kA(0, 0.3, -0.02)))), m(A, "seat", e(fA(0.09, 0.5, 0.07, 0.03, kA(0.205, 0.28, 0.045)))), m(A, "seat", e(fA(0.09, 0.5, 0.07, 0.03, kA(-0.205, 0.28, 0.045)))), m(A, "seatInsert", e(fA(0.3, 0.46, 0.014, 6e-3, kA(0, 0.3, 0.036)))), m(A, "trim", e(fA(0.46, 0.5, 0.012, 0.01, kA(0, 0.3, -0.078))));
  for (let s of [-0.07, 0.07]) m(A, "chrome", e(vC(55e-4, 55e-4, 0.09, kA(s, 0.625, -0.02))));
  return m(A, "seat", e(fA(0.27, 0.16, 0.1, 0.04, kA(0, 0.73, -0.015)))), A;
}
function Kk() {
  let B = {};
  m(B, "carpet", fA(1.08, 0.2, 0.15, 0.02, kA(0, uC + 0.1, -0.95 - 0.08))), m(B, "seat", fA(1.1, 0.12, -0.95 - -1.38 + 0.03, 0.05, kA(0, 0.585 - 0.06, (-0.95 + -1.38) / 2)));
  for (let E of [-0.36, 0, 0.36]) m(B, "seatInsert", fA(0.3, 0.014, 0.38, 6e-3, kA(E, 0.585 + 2e-3, (-0.95 + -1.38) / 2 + 0.01)));
  let C = kA(0, 0.585 - 0.03, -1.38 + 0.02), Q = new TA().makeRotationX(-0.38).setPosition(C), i = (E) => E.applyMatrix4(Q);
  m(B, "seat", i(fA(1.1, 0.48, 0.12, 0.05, kA(0, 0.25, -0.04))));
  for (let E of [-0.36, 0.36]) m(B, "seatInsert", i(fA(0.3, 0.38, 0.014, 6e-3, kA(E, 0.26, 0.024))));
  m(B, "seatInsert", i(fA(0.26, 0.38, 0.014, 6e-3, kA(0, 0.26, 0.024))));
  for (let E of [1, -1]) m(B, "seat", fA(0.22, 0.12, 0.3, 0.04, kA(E * 0.66, 0.93, -1.53), -0.3));
  return B;
}
function Gk() {
  let B = {};
  return DR(B), lR(B), SR(B), wR(B), yR(B), B;
}
var RA = (B, A, I) => new y(B, A, I);
function EB(B, A, I, g = 20) {
  let C = new VA(B, B, A, g);
  return C.rotateX(Math.PI / 2), C.translate(I.x, I.y, I.z), C;
}
function GQ(B, A, I, g, C = 16) {
  let Q = new VA(B, A, I, C);
  return Q.translate(g.x, g.y, g.z), Q;
}
function Ih(B, A, I) {
  return B.applyMatrix4(new TA().makeRotationZ(I).setPosition(A)), B;
}
var iB = 1.36, cl = RA(0.3, 0.79, 1.58), ll = RA(0.24, 0.84, 2.07);
function Fk() {
  let B = {};
  m(B, "engineDark", fA(0.36, 0.12, 0.62, 0.03, RA(0, 0.33, iB))), m(B, "engine", fA(0.42, 0.26, 0.66, 0.03, RA(0, 0.51, iB)));
  for (let C of [1, -1]) {
    let Q = -C * 0.75, i = RA(C * 0.2, 0.67, iB);
    m(B, "engine", Ih(fA(0.2, 0.13, 0.64, 0.02, RA(0, 0, 0)), i, Q)), m(B, "valveCover", Ih(fA(0.17, 0.07, 0.62, 0.025, RA(0, 0.1, 0)), i, Q));
    for (let t = 0; t < 4; t++) {
      let o = -0.225 + t * 0.15;
      m(B, "engineDark", Ih(fA(0.04, 0.045, 0.055, 0.01, RA(0, 0.155, o), 0, 0, 0, 1), i, Q)), m(B, "engineDark", Ih(new VA(9e-3, 9e-3, 0.05, 8).translate(0, 0.17, o + 0.035), i, Q));
    }
    let E = [0, 1, 2, 3].map((t) => RA(C * 0.33, 0.6, iB - 0.24 + t * 0.16));
    for (let t of E) m(B, "exhaustHot", cg([t, t.clone().add(RA(C * 0.04, -0.06, 0)), RA(C * 0.36, 0.44, iB - 0.05)], 0.018, 8));
    m(B, "exhaustHot", cg([RA(C * 0.36, 0.44, iB + 0.2), RA(C * 0.36, 0.44, iB - 0.1), RA(C * 0.3, 0.36, 1.25), RA(C * 0.24, 0.3, 1.25)], 0.028, 10));
    for (let t = 0; t < 4; t++) {
      let o = iB - 0.225 + t * 0.15;
      m(B, "intake", cg([RA(C * 0.1, 0.8, o), RA(C * 0.16, 0.8, o), RA(C * 0.19, 0.74, o)], 0.021, 10));
    }
  }
  m(B, "intake", fA(0.28, 0.1, 0.52, 0.04, RA(0, 0.8, iB))), m(B, "intake", fA(0.16, 0.03, 0.4, 0.012, RA(0, 0.855, iB - 0.02))), m(B, "chrome", EB(0.046, 0.08, RA(0, 0.8, iB + 0.3), 24)), m(B, "engineDark", EB(0.05, 0.02, RA(0, 0.8, iB + 0.35), 24));
  let A = GQ(0.026, 0.028, 0.022, RA(0, 0, 0), 20);
  A.applyMatrix4(new TA().makeRotationZ(-0.75).setPosition(cl)), m(B, "capYellow", A), m(B, "engineDark", cg([RA(-0.3, 0.45, 1.5), RA(-0.31, 0.62, 1.52), RA(-0.3, 0.72, 1.53)], 6e-3, 6)), m(B, "capYellow", new Xg(0.018, 5e-3, 6, 16).translate(-0.3, 0.745, 1.53)), m(B, "engine", fA(0.36, 0.36, 0.05, 0.03, RA(0, 0.52, 1.715)));
  let I = [[0, 0.38, 0.085], [0, 0.58, 0.06], [0.22, 0.72, 0.035], [-0.21, 0.42, 0.055], [-0.2, 0.67, 0.05], [0.12, 0.8, 0.03]];
  for (let [C, Q, i] of I) m(B, "pulley", EB(i, 0.03, RA(C, Q, 1.76), 28)), m(B, "chrome", EB(i * 0.35, 0.034, RA(C, Q, 1.76), 16));
  m(B, "alternator", EB(0.065, 0.14, RA(0.22, 0.72, 1.67), 24)), m(B, "engineDark", EB(0.06, 0.16, RA(-0.21, 0.42, 1.63), 24));
  let g = new DC([RA(0, 0.465, 1.76), RA(-0.2, 0.475, 1.76), RA(-0.265, 0.42, 1.76), RA(-0.25, 0.67, 1.76), RA(-0.1, 0.8, 1.76), RA(0.12, 0.83, 1.76), RA(0.255, 0.72, 1.76), RA(0.085, 0.4, 1.76)], true);
  return m(B, "engineDark", new nQ(g, 80, 6e-3, 5, true)), m(B, "hose", cg([RA(0.04, 0.66, 1.74), RA(0.1, 0.72, 1.86), RA(0.22, 0.76, 1.95), RA(0.3, 0.76, 2.02)], 0.022, 10)), m(B, "hose", cg([RA(-0.05, 0.42, 1.76), RA(-0.15, 0.4, 1.86), RA(-0.3, 0.42, 1.98), RA(-0.33, 0.45, 2.03)], 0.022, 10)), B;
}
function pk() {
  let B = {};
  m(B, "radCore", fA(0.66, 0.44, 0.04, 4e-3, RA(0, 0.6, 2.07)));
  for (let I of [1, -1]) m(B, "engineDark", fA(0.06, 0.48, 0.06, 0.012, RA(I * 0.36, 0.6, 2.07)));
  m(B, "engineDark", fA(0.74, 0.04, 0.05, 0.01, RA(0, 0.84, 2.07))), m(B, "engineDark", fA(0.74, 0.03, 0.05, 0.01, RA(0, 0.365, 2.07))), m(B, "engineDark", EB(0.022, 0.05, RA(0.33, 0.76, 2.07 - 0.04), 12)), m(B, "engineDark", EB(0.022, 0.05, RA(-0.33, 0.45, 2.07 - 0.04), 12)), m(B, "chrome", GQ(0.024, 0.026, 0.02, ll, 20)), m(B, "engineDark", fA(0.6, 0.42, 0.05, 0.02, RA(0, 0.6, 2.07 - 0.055)));
  for (let I of [-0.145, 0.145]) {
    m(B, "black", EB(0.13, 0.02, RA(I, 0.6, 2.07 - 0.07), 28));
    for (let g = 0; g < 7; g++) {
      let C = g / 7 * Math.PI * 2, Q = fA(0.1, 0.035, 6e-3, 2e-3, RA(0, 0, 0), 0, 0, 0, 1);
      Q.applyMatrix4(new TA().makeRotationZ(C).multiply(new TA().makeTranslation(0.065, 0, 0)).multiply(new TA().makeRotationX(0.4))), Q.translate(I, 0.6, 2.07 - 0.09), m(B, "engineDark", Q);
    }
    m(B, "engineDark", EB(0.035, 0.05, RA(I, 0.6, 2.07 - 0.1), 16));
  }
  return B;
}
function Jk() {
  let B = {}, A = RA(-0.46, 0.625, 1.86);
  return m(B, "battery", fA(0.26, 0.17, 0.17, 8e-3, A)), m(B, "batteryTop", fA(0.262, 0.012, 0.172, 4e-3, A.clone().add(RA(0, 0.087, 0)))), m(B, "batteryLabel", fA(0.2, 0.08, 2e-3, 1e-3, A.clone().add(RA(0, 0.01, -0.086)))), m(B, "red", GQ(0.012, 0.014, 0.022, A.clone().add(RA(0.09, 0.1, 0.05)), 12)), m(B, "black", GQ(0.012, 0.014, 0.022, A.clone().add(RA(-0.09, 0.1, 0.05)), 12)), m(B, "engineDark", cg([A.clone().add(RA(0.09, 0.11, 0.05)), A.clone().add(RA(0.14, 0.14, 0.1)), RA(-0.2, 0.7, 1.72)], 8e-3, 6)), B;
}
function Nk() {
  let B = {};
  m(B, "engineDark", EB(0.12, 0.1, RA(0.38, 0.72, V.zHood + 0.06), 32)), m(B, "chrome", EB(0.03, 0.14, RA(0.38, 0.72, V.zHood + 0.18), 16)), m(B, "reservoir", fA(0.08, 0.06, 0.07, 0.015, RA(0.38, 0.78, V.zHood + 0.2))), m(B, "capYellow", GQ(0.018, 0.018, 0.012, RA(0.38, 0.815, V.zHood + 0.2), 14)), m(B, "reservoir", fA(0.1, 0.13, 0.16, 0.02, RA(0.5, 0.74, 1.88))), m(B, "engineDark", GQ(0.024, 0.024, 0.02, RA(0.5, 0.815, 1.88), 14)), m(B, "reservoir", fA(0.12, 0.15, 0.13, 0.02, RA(0.47, 0.72, 1.05))), m(B, "capBlue", GQ(0.022, 0.022, 0.02, RA(0.47, 0.805, 1.05), 14)), m(B, "engineDark", fA(0.16, 0.08, 0.22, 0.015, RA(-0.5, 0.82, 1.08))), m(B, "engineDark", fA(0.2, 0.15, 0.28, 0.025, RA(-0.48, 0.72, 1.6))), m(B, "engineDark", cg([RA(-0.38, 0.74, 1.6), RA(-0.2, 0.8, 1.66), RA(-0.05, 0.8, 1.7), RA(0, 0.8, 1.7)], 0.045, 14));
  for (let A of [1, -1]) m(B, "engineDark", GQ(0.035, 0.035, 0.03, RA(A * 0.66, 0.89, V.axleF), 16));
  m(B, "chrome", fA(0.06, 0.04, 0.03, 8e-3, RA(0, TI(0, 2.1) - 0.14, 2.11)));
  for (let A of [1, -1]) m(B, "engineDark", cg([RA(A * 0.57, 0.83, 1), RA(A * 0.58, 0.83, 1.4), RA(A * 0.57, 0.8, 1.95)], 0.01, 6));
  return B;
}
function dk() {
  let B = {};
  for (let [A, I] of [[0.36, 0.55], [-0.12, 0.5]]) {
    let g = RA(A, TI(A, 0.84) + 0.02, 0.86), C = RA(A - I, TI(A - I, 0.84) + 0.03, 0.8);
    m(B, "black", cg([g, g.clone().lerp(C, 0.5).add(RA(0, 0.02, -0.01)), C], 6e-3, 6));
    let Q = fA(0.5, 0.012, 0.018, 4e-3, RA(0, 0, 0));
    Q.translate((g.x + C.x) / 2 - 0.05, C.y - 4e-3, C.z - 0.02), m(B, "black", Q), m(B, "black", GQ(0.016, 0.018, 0.02, g, 12));
  }
  return B;
}
var tB = ["door_fl", "door_fr", "door_rl", "door_rr", "hood", "trunk", "wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr", "engine", "battery", "radiator", "headlight_l", "headlight_r", "bumper_f", "bumper_r", "seat_d", "seat_p", "seat_r", "fender_fl", "fender_fr", "windshield", "window_r", "taillight_l", "taillight_r"], JI = (B, A, I) => new y(B, A, I), QC = { door_fl: JI(0.95, 0.62, V.zHood - 0.02), door_fr: JI(-0.95, 0.62, V.zHood - 0.02), door_rl: JI(0.955, 0.62, V.zDoorSplit - 0.02), door_rr: JI(-0.955, 0.62, V.zDoorSplit - 0.02), hood: JI(0, TI(0, V.zHood) - 0.03, V.zHood + 0.03), trunk: JI(0, TI(0, V.zLid) - 0.03, V.zLid - 0.03), wheel_fl: JI(V.track, V.wheelR, V.axleF), wheel_fr: JI(-V.track, V.wheelR, V.axleF), wheel_rl: JI(V.track, V.wheelR, V.axleR), wheel_rr: JI(-V.track, V.wheelR, V.axleR), engine: JI(0, 0.36, 1.4), battery: JI(-0.46, 0.54, 1.86), radiator: JI(0, 0.6, 2.07), headlight_l: JI(0.7, 0.7, 2.2), headlight_r: JI(-0.7, 0.7, 2.2), bumper_f: JI(0, 0.42, 2.3), bumper_r: JI(0, 0.46, -2.7), seat_d: JI(KQ.frontX, V.yFloor, KQ.frontZ), seat_p: JI(-KQ.frontX, V.yFloor, KQ.frontZ), seat_r: JI(0, V.yFloor, KQ.rearZ), fender_fl: JI(0.9, 0.72, 1.45), fender_fr: JI(-0.9, 0.72, 1.45), windshield: JI(0, 1.2, 0.5), window_r: JI(0, 1.24, -1.55), taillight_l: JI(0.7, 0.79, -2.68), taillight_r: JI(-0.7, 0.79, -2.68) };
// hinge / attachment pivots of the new sedan
Object.assign(QC, LEGACY_PIVOTS);
function Tt(B) {
  let A = new vI(B), I = ["#b8ab96", "#a9adb0", "#e8e6df", "#1d1f22", "#2f4a3c", "#5a1f24", "#26344f", "#8a7a55", "#5f6468", "#c9c3b4"], g = ["#2a2b2d", "#3b3631", "#5a5046", "#28303a"], C = "ABEKMHOPCTYX", Q = `${C[A.int(0, 11)]} ${A.int(100, 999)} ${C[A.int(0, 11)]}${C[A.int(0, 11)]}`;
  return { paint: A.pick(I), rust: A.range(0.04, 0.3), dust: A.range(0.12, 0.45), seat: A.pick(g), interior: A.pick(["#2c2d2f", "#3f3b37", "#5b554c"]), plate: Q, seed: B };
}
var Rk = /* @__PURE__ */ new WeakMap();
function mk(B, A, I) {
  let g = Rk.get(B);
  g || Rk.set(B, g = /* @__PURE__ */ new Map());
  let C = g.get(A);
  return C || g.set(A, C = I()), C;
}
var lI = (B) => new oI(B);
function gh(B, A) {
  let I = new nA(B);
  return I.multiplyScalar(A), "#" + I.getHexString();
}
function Is(B, A, I) {
  return mk(B, A, () => {
    let g = I().clone();
    return g.side = OI, g;
  });
}
function IQ(B, A) {
  let { mats: I, look: g } = A, C = (Q, i) => mk(I, Q, i);
  switch (B) {
    case "paint":
    case "paintIn":
      return A.paint;
    case "black":
      return I.plasticBlack;
    case "blackGloss":
      return C("blackGloss", () => lI({ color: 526602, roughness: 0.12, metalness: 0.1 }));
    case "rubber":
    case "hose":
      return I.rubber;
    case "glass":
    case "lens":
      return I.glass;
    case "chrome":
      return I.chrome;
    case "mirror":
      return C("mirror", () => lI({ color: 14673130, roughness: 0.02, metalness: 1 }));
    case "grille":
      return C("grille", () => lI({ color: 789517, roughness: 0.55, side: OI }));
    case "housing":
      return C("housing", () => lI({ color: 2500651, roughness: 0.45, side: OI }));
    case "lampHousing":
      return C("lampHousing", () => lI({ color: 13225168, roughness: 0.3, metalness: 0.7, side: OI }));
    case "tailRib":
      return C("tailRib", () => lI({ color: 3802629, roughness: 0.35 }));
    case "under":
      return I.painted("#1f1d1b", 0.55, 0.9, true);
    case "pad":
      return C("pad", () => lI({ color: 2763305, roughness: 1, map: I.tex.fabric, normalMap: I.tex.fabricNormal, side: OI }));
    case "liner":
      return C("liner", () => lI({ color: 1118481, roughness: 0.95, side: OI }));
    case "carpet":
      return Is(I, "carpet2s", () => I.carpet);
    case "mat":
      return C("mat", () => lI({ color: 1381653, roughness: 0.9 }));
    case "doorIn":
      return I.vinyl(g.interior, 0.7);
    case "doorTrim":
    case "console":
      return Is(I, "vin2s:" + g.interior, () => I.vinyl(gh(g.interior, 0.72), 0.6));
    case "doorInsert":
      return I.fabric(gh(g.seat, 1.15));
    case "trim":
      return Is(I, "trim2s:" + g.interior, () => I.vinyl(g.interior, 0.62));
    case "dash":
      return I.vinyl("#26272a", 0.78);
    case "dashD":
      return Is(I, "dashD", () => I.vinyl("#26272a", 0.78));
    case "wood":
      return C("wood", () => lI({ map: nk(), roughness: 0.25, metalness: 0 }));
    case "armrest":
      return I.vinyl(gh(g.interior, 0.85), 0.5);
    case "knob":
      return C("knob", () => lI({ color: 1842206, roughness: 0.4 }));
    case "switch":
      return C("switch", () => lI({ color: 986896, roughness: 0.5 }));
    case "red":
      return C("red", () => lI({ color: 11540496, roughness: 0.4 }));
    case "headliner":
      return Is(I, "headliner", () => I.fabric("#8e8a83"));
    case "visor":
      return I.fabric("#8e8a83");
    case "shelf":
      return I.fabric("#1e1e1f");
    case "speaker":
      return C("speaker", () => lI({ map: ak(), roughness: 0.8 }));
    case "seat":
      return I.fabric(g.seat);
    case "seatInsert":
      return I.fabric(gh(g.seat, 1.25));
    case "wheelRim":
      return I.vinyl("#19191a", 0.48);
    case "wheelSpoke":
      return C("wheelSpoke", () => lI({ color: 2105378, roughness: 0.5 }));
    case "engine":
      return I.painted("#6a6d70", 0.25, 0.55);
    case "engineDark":
      return C("engineDark", () => lI({ color: 1776412, roughness: 0.7 }));
    case "valveCover":
      return C("valveCover", () => lI({ color: 2895410, roughness: 0.32, metalness: 0.3 }));
    case "intake":
      return C("intake", () => lI({ color: 3882305, roughness: 0.6 }));
    case "exhaustHot":
      return I.painted("#4c3c31", 0.7, 0.85);
    case "pulley":
      return C("pulley", () => lI({ color: 7106419, roughness: 0.4, metalness: 0.8 }));
    case "alternator":
      return C("alternator", () => lI({ color: 10132640, roughness: 0.35, metalness: 0.8 }));
    case "capYellow":
      return C("capYellow", () => lI({ color: 14725152, roughness: 0.4 }));
    case "capBlue":
      return C("capBlue", () => lI({ color: 2117824, roughness: 0.4 }));
    case "reservoir":
      return C("reservoir", () => lI({ color: 14210248, roughness: 0.5 }));
    case "radCore":
      return C("radCore", () => lI({ map: rk(), roughness: 0.7, metalness: 0.4 }));
    case "battery":
      return C("battery", () => lI({ color: 1447446, roughness: 0.6 }));
    case "batteryTop":
      return C("batteryTop", () => lI({ color: 2368548, roughness: 0.6 }));
    case "batteryLabel":
      return C("batteryLabel", () => lI({ map: sk(["POWER", "12V  70Ah  640A"], "#b8261a", "#ffffff"), roughness: 0.5 }));
    case "frame":
      return I.painted("#1b1b1b", 0.45, 0.65);
    case "susp":
      return C("susp", () => lI({ color: 2763307, roughness: 0.6, metalness: 0.4 }));
    case "spring":
      return C("spring", () => lI({ color: 9050644, roughness: 0.45, metalness: 0.3 }));
    case "exhaust":
      return I.painted("#595956", 0.65, 0.7);
    case "tire":
      return I.tire;
    case "rim":
      return C("rim", () => lI({ color: 1842463, roughness: 0.38, metalness: 0.5, side: OI }));
    case "disc":
      return C("disc", () => lI({ color: 7828076, roughness: 0.55, metalness: 0.8 }));
    case "caliper":
      return C("caliper", () => lI({ color: 2829101, roughness: 0.5, metalness: 0.4 }));
    case "gate":
      return C("gate", () => lI({ map: ek(), roughness: 0.5 }));
    case "lamp":
      return A.lamp ?? C("lampOff", () => lI({ color: 14342874, roughness: 0.22, metalness: 1 }));
    case "indicator":
      return A.lamps?.indicator ?? C("indOff", () => lI({ color: 16751146, roughness: 0.2, transparent: true, opacity: 0.85 }));
    case "tail":
      return A.lamps?.tail ?? C("tailOff", () => lI({ color: 11014156, roughness: 0.25, transparent: true, opacity: 0.9 }));
    case "reverse":
      return A.lamps?.reverse ?? C("revOff", () => lI({ color: 15132390, roughness: 0.2, transparent: true, opacity: 0.7 }));
    case "dome":
      return A.car?.dome ?? I.flat("#e8e2d0", 0.4);
    case "face":
      return A.car.face;
    case "needle":
      return A.car.needle;
    case "screen":
      return A.car.screen;
    case "plate":
      return C("plate:" + g.plate, () => lI({ map: ok(g.plate), roughness: 0.55, metalness: 0.2 }));
    default:
      return I.plasticBlack;
  }
}
function MR(B) {
  let A = B.index ? B.toNonIndexed() : B.clone();
  A.attributes.uv || A.setAttribute("uv", new XA(new Float32Array(A.attributes.position.count * 2), 2)), A.attributes.normal || A.computeVertexNormals();
  for (let I of Object.keys(A.attributes)) ["position", "normal", "uv"].includes(I) || A.deleteAttribute(I);
  return A;
}
var uk = /* @__PURE__ */ new WeakMap();
function qk(B, A) {
  let I = uk.get(B);
  I || uk.set(B, I = /* @__PURE__ */ new Map());
  let g = I.get(A);
  return g || I.set(A, g = Wg(B[A].map(MR))), g;
}
var UR = /* @__PURE__ */ new Set(["paint", "paintIn", "black", "blackGloss", "rubber", "chrome", "grille", "under", "liner", "frame", "susp", "spring", "exhaust", "tire", "rim", "housing", "lampHousing", "engine", "engineDark", "intake", "valveCover"]);
function FQ(B, A, I) {
  let g = [];
  for (let C of Object.keys(B)) {
    if (!B[C].length) continue;
    let Q = new cA(qk(B, C), IQ(C, A));
    Q.castShadow = UR.has(C), Q.receiveShadow = true, I && Q.position.copy(I).negate(), Q.userData.role = C, (C === "glass" || C === "lens") && (Q.renderOrder = 2), g.push(Q);
  }
  return g;
}
var fk = /* @__PURE__ */ new Map();
function gs(...B) {
  let A = {};
  for (let I of B) for (let [g, C] of Object.entries(I)) m(A, g, ...C);
  return A;
}
function KR() {
  let B = {}, A = vr(zi, 0.09);
  return m(B, "pad", Ei(ii((I, g) => TI(I, g) - 0.036, V.zHood + 0.08, A.tipF - 0.06, (I) => A.xAtZ(I), { nz: 30, nx: 30 }).outer)), B;
}
function GR(B) {
  let A = {};
  return m(A, "indicator", bI(B, Cg(1.7), Cg(1.82), Bg(0.61), Bg(0.645), { offset: 2e-3 }).outer), m(A, "black", ...jr(B, V.zHood + 0.012, 0.99)), A;
}
function FR() {
  let B = gk();
  return { tire: [B.tire], rim: [B.rim], chrome: [B.cap, B.nuts] };
}
function Hk(B) {
  let A = fk.get(B);
  if (A) return A;
  const np = legacyPart(B);
  if (np) return fk.set(B, np), np;
  let I = Bl().parts, g = B.endsWith("l") || B === "seat_d" ? 1 : -1;
  switch (B) {
    case "door_fl":
    case "door_fr":
      A = gs(I[B], il(g, true), hl(g, true, g > 0));
      break;
    case "door_rl":
    case "door_rr":
      A = gs(I[B], il(g, false), hl(g, false, false));
      break;
    case "hood":
      A = gs(I.hood, KR());
      break;
    case "fender_fl":
    case "fender_fr":
      A = gs(I[B], GR(g));
      break;
    case "headlight_l":
    case "headlight_r":
      A = Xy(g);
      break;
    case "taillight_l":
    case "taillight_r":
      A = zy(g);
      break;
    case "wheel_fl":
    case "wheel_fr":
    case "wheel_rl":
    case "wheel_rr":
      A = FR();
      break;
    case "engine":
      A = Fk();
      break;
    case "radiator":
      A = pk();
      break;
    case "battery":
      A = Jk();
      break;
    case "seat_d":
      A = Dl(KQ.frontX);
      break;
    case "seat_p":
      A = Dl(-KQ.frontX);
      break;
    case "seat_r":
      A = Kk();
      break;
    default:
      A = I[B] ?? {};
  }
  return fk.set(B, A), A;
}
var pR = { door_fl: { axis: JI(0, 1, 0), open: -1.12 }, door_rl: { axis: JI(0, 1, 0), open: -1.08 }, door_fr: { axis: JI(0, 1, 0), open: 1.12 }, door_rr: { axis: JI(0, 1, 0), open: 1.08 }, hood: { axis: JI(1, 0, 0), open: -1 }, trunk: { axis: JI(1, 0, 0), open: 1.2 } };
function JR() {
  return { tail: lI({ color: 11014156, emissive: 16718346, emissiveIntensity: 0, roughness: 0.25, transparent: true, opacity: 0.92 }), reverse: lI({ color: 15132390, emissive: 16777215, emissiveIntensity: 0, roughness: 0.2, transparent: true, opacity: 0.75 }), indicator: lI({ color: 16751146, emissive: 16747008, emissiveIntensity: 0, roughness: 0.2, transparent: true, opacity: 0.88 }) };
}
var Sl = null, NR = null;
function dR() {
  return Sl ??= legacyDisc();
}
function RR() {
  return NR ??= legacyCaliper();
}
function Cs(B, A, I) {
  let g = QC[B], C = new WA();
  C.name = B;
  let Q = je(A, I.paint, I.rust, I.dust), i = { mats: A, look: I, paint: Q }, E = { root: C, size: new y(), center: new y() }, t = Hk(B);
  if ((t.paint || t.paintIn) && (E.paint = Q), B.startsWith("headlight") && (i.lamp = E.lamp = lI({ color: 14342874, roughness: 0.22, metalness: 1, emissive: 16773852, emissiveIntensity: 0 })), (B.startsWith("taillight") || B.startsWith("headlight") || B.startsWith("fender")) && (i.lamps = E.lamps = JR()), B.startsWith("wheel")) {
    let s = new WA();
    for (let c of FQ(t, i)) s.add(c);
    C.add(s), C.userData.spin = s;
    let a = B.endsWith("r") ? -1 : 1, n = new cA(dR(), IQ("disc", i)), r = new cA(RR(), IQ("caliper", i));
    n.scale.x = r.scale.x = a, C.add(n, r);
  } else for (let s of FQ(t, i, g)) C.add(s);
  let o = pR[B];
  o && (E.hinge = { axis: o.axis.clone(), open: o.open });
  let e = new Jg().setFromObject(C);
  return e.getSize(E.size), e.getCenter(E.center), E;
}
var uR = null;
function fR() {
  return uR ??= legacyShell();
}
var GC = { z0: -1.88, z1: -1.73, y0: 0.765, y1: 0.905 };
function YR() {
  let B = {}, A = bI(1, Cg(GC.z0), Cg(GC.z1), Bg(GC.y0), Bg(GC.y1), { thickness: 0.03 });
  return m(B, "grille", A.inner, A.edge), B;
}
function LR() {
  return legacyFuelDoor();
}
function Tk(B, A, I = []) {
  let g = new WA();
  g.name = "car";
  let C = new WA(), Q = new WA(), i = new WA();
  g.add(Q, C), C.add(i);
  let E = je(B, A.paint, A.rust, A.dust), t = lI({ map: ol(), emissive: 16777215, emissiveMap: ol(), emissiveIntensity: 0, roughness: 0.4 }), o = lI({ color: 16734750, emissive: 16730640, emissiveIntensity: 0.2, roughness: 0.4 }), e = tk(), s = lI({ color: 0, emissive: 16777215, emissiveMap: e.tex, emissiveIntensity: 0, roughness: 0.3 }), a = { brake: lI({ color: 6948870, emissive: 16718346, emissiveIntensity: 0, roughness: 0.3 }), dome: lI({ color: 15262416, emissive: 16773590, emissiveIntensity: 0, roughness: 0.4 }), dash: lI({ color: 1118481, emissive: 16747066, emissiveIntensity: 0, roughness: 0.4 }) }, n = { mats: B, look: A, paint: E, car: { ...a, face: t, needle: o, screen: s } };
  for (let tA of FQ(fR(), n)) C.add(tA);
  for (let tA of FQ(Bk(), n)) Q.add(tA);
  void Ak;
  C.add(new cA(fA(0.32, 0.022, 0.03, 8e-3, JI(0, 1.096, -2.655)), a.brake));
  let c = lk(), h = new WA();
  new TA().makeBasis(c.x, c.y, c.z).setPosition(c.o).decompose(h.position, h.quaternion, h.scale), i.add(h), h.add(new cA(new PI(XI.w, XI.h), t));
  let D = (tA, MA, KA) => {
    let LA = new WA();
    return LA.position.set(tA[0], tA[1], 4e-3), LA.add(new cA(new PI(KA, MA).translate(0, MA / 2 - MA * 0.12, 0), o)), LA.add(new cA(new VC(KA * 2.2, 16).translate(0, 0, 1e-3), IQ("knob", n))), h.add(LA), LA;
  }, l = D(XI.speed, XI.bigR * 0.95, 32e-4), U = D(XI.tach, XI.bigR * 0.95, 32e-4), S = D(XI.fuel, XI.smallR * 0.95, 22e-4), k = D(XI.temp, XI.smallR * 0.95, 22e-4), K = (tA, MA, KA) => {
    let LA = lI({ color: 328965, emissive: KA, emissiveMap: el(tA), emissiveIntensity: 0, transparent: true, alphaMap: el(tA) }), hI = new cA(new PI(0.011, 0.011), LA);
    return hI.position.set(MA[0], MA[1], 2e-3), h.add(hI), LA;
  }, G = { oil: K("oil", [XI.tach[0] - 0.012, XI.tach[1] + 0.014], 16722458), batt: K("batt", [XI.tach[0] + 0.012, XI.tach[1] + 0.014], 16722458), beam: K("beam", [XI.speed[0] - 0.012, XI.speed[1] + 0.014], 3832575), hand: K("hand", [XI.speed[0] + 0.012, XI.speed[1] + 0.014], 16722458) }, M = Ek();
  Lt(M, 0);
  let p = new cA(new PI(0.034, 85e-4), lI({ color: 0, emissive: 16777215, emissiveMap: M.tex, emissiveIntensity: 0.9 }));
  p.position.set(XI.speed[0], XI.speed[1] - 0.024, 2e-3), h.add(p);
  let d = wk(), R = new WA();
  R.position.copy(rl.hub);
  let u = rl.dir.clone().normalize(), q = JI(0, u.z * -1, u.y).normalize();
  q.y < 0 && q.negate(), new TA().makeBasis(new y().crossVectors(q, u), q, u).decompose(new y(), R.quaternion, new y()), i.add(R);
  let L = new WA();
  R.add(L);
  for (let tA of FQ(d.wheel, n)) L.add(tA);
  for (let tA of FQ(d.fixed, n)) R.add(tA);
  let b = new WA();
  b.position.copy(d.keyPos), b.quaternion.setFromUnitVectors(JI(0, 0, 1), JI(1, 0, 0));
  for (let tA of FQ(yk(), n)) b.add(tA);
  R.add(b);
  let W = new cA(fA(0.2, 0.105, 0.02, 8e-3, JI(0, 0.83, 0.3)), IQ("switch", n));
  i.add(W);
  let j = new cA(new PI(0.12, 0.032), s);
  j.rotation.set(-0.18, Math.PI, 0, "YXZ"), j.position.set(0, 0.8706, 0.275), i.add(j);
  for (let tA of [-0.078, 0.078]) {
    let MA = new cA(new VA(0.014, 0.015, 0.016, 20).rotateX(Math.PI / 2), IQ("knob", n));
    MA.position.set(tA, 0.845, 0.284), i.add(MA);
  }
  for (let tA = 0; tA < 6; tA++) i.add(new cA(fA(0.022, 0.012, 6e-3, 3e-3, JI(-0.0675 + tA * 0.027, 0.803, 0.288)), IQ("knob", n)));
  mt(e, 94.2, false);
  let oA = new WA();
  oA.position.copy(Ht);
  for (let tA of FQ(Mk(), n)) oA.add(tA);
  i.add(oA);
  let H = new cA(new PI(0.03, 0.06).rotateX(-Math.PI / 2), IQ("gate", n));
  H.position.set(-0.03, Ht.y + 3e-3, Ht.z), i.add(H);
  let O = new WA();
  O.position.copy(kk);
  for (let tA of FQ(Uk(), n)) O.add(tA);
  i.add(O);
  let IA = Sk(), _ = new WA();
  _.position.copy(IA.hinge);
  let gA = IQ("dashD", n);
  for (let tA of IA.geo) _.add(new cA(tA, gA));
  i.add(_);
  let DA = LR(), dA = new WA();
  dA.position.copy(DA.hinge);
  for (let tA of DA.door) {
    let MA = new cA(tA, E);
    MA.position.copy(DA.hinge).negate(), dA.add(MA);
  }
  C.add(dA), C.add(new cA(DA.cap, B.plasticBlack));
  let zA = new cA(fA(0.14, 0.03, 0.08, 4e-3, JI(0, 0, 0)), new pC({ visible: false }));
  zA.position.set(0, 1.47, -0.35), i.add(zA);
  let X = new WA();
  X.position.set(0.03, 1.268, 0.165), X.add(new cA(new PI(0.05, 0.07).translate(0, -0.075, 0), lI({ color: 3115578, roughness: 0.8, side: OI }))), X.add(new cA(new VA(8e-4, 8e-4, 0.04).translate(0, -0.02, 0), B.plasticBlack)), i.add(X);
  let BA = { root: g, body: C, frame: Q, paint: E, parts: {}, steering: L, gauges: { speed: l, tach: U, fuel: S, temp: k, lights: G, odo: M, faceMat: t, needleMat: o }, lamps: a, radio: { body: W, display: e, screen: s }, key: b, gearLever: oA, handbrake: O, glovebox: _, fuelCap: dA, fuelNeck: DA.neck, dome: zA, interiorGroup: i, freshener: X, look: A };
  for (let tA of tB) {
    if (I.includes(tA)) continue;
    let MA = Cs(tA, B, A);
    MA.root.position.copy(QC[tA]);
    let KA = MA.root.userData.spin;
    KA && (KA.userData.baseYaw = tA.endsWith("r") ? Math.PI : 0, KA.rotation.set(0, KA.userData.baseYaw, 0, "YXZ")), g.add(MA.root), BA.parts[tA] = MA;
  }
  return BA;
}
var Yk = /* @__PURE__ */ new Map(), Lk = new pC({ color: 11069183, transparent: true, opacity: 0.28, depthWrite: false });
function bk(B) {
  let A = Yk.get(B);
  if (A) return A;
  A = new WA();
  let I = Hk(B), g = B.startsWith("wheel");
  for (let C of Object.keys(I)) {
    if (!I[C].length) continue;
    let Q = new cA(qk(I, C), Lk);
    g ? B.endsWith("r") && (Q.rotation.y = Math.PI) : Q.position.copy(QC[B]).negate(), Q.renderOrder = 5, A.add(Q);
  }
  return A.userData.mat = Lk, Yk.set(B, A), A;
}
var wl = { oil: cl, radiator: ll };
var pQ = { door_fl: "door_fl", door_fr: "door_fr", door_rl: "door_rl", door_rr: "door_rr", hood: "hood", trunk: "trunk", wheel_fl: "wheel", wheel_fr: "wheel", wheel_rl: "wheel", wheel_rr: "wheel", engine: "engine", battery: "battery", radiator: "radiator", headlight_l: "headlight", headlight_r: "headlight", bumper_f: "bumper_f", bumper_r: "bumper_r", seat_d: "seat_f", seat_p: "seat_f", seat_r: "seat_r", fender_fl: "fender_l", fender_fr: "fender_r", windshield: "windshield", window_r: "window_r", taillight_l: "taillight", taillight_r: "taillight" }, Ch = { door_fl: "door_fl", door_fr: "door_fr", door_rl: "door_rl", door_rr: "door_rr", hood: "hood", trunk: "trunk", wheel: "wheel_fl", engine: "engine", battery: "battery", radiator: "radiator", headlight: "headlight_l", bumper_f: "bumper_f", bumper_r: "bumper_r", seat_f: "seat_d", seat_r: "seat_r", fender_l: "fender_fl", fender_r: "fender_fr", windshield: "windshield", window_r: "window_r", taillight: "taillight_l" }, JQ = { door_fl: { mass: 25, bolted: true, painted: true, heavy: false }, door_fr: { mass: 25, bolted: true, painted: true, heavy: false }, door_rl: { mass: 22, bolted: true, painted: true, heavy: false }, door_rr: { mass: 22, bolted: true, painted: true, heavy: false }, hood: { mass: 17, bolted: true, painted: true, heavy: false }, trunk: { mass: 13, bolted: true, painted: true, heavy: false }, wheel: { mass: 21, bolted: true, painted: false, heavy: false }, engine: { mass: 190, bolted: true, painted: false, heavy: true }, battery: { mass: 18, bolted: false, painted: false, heavy: false }, radiator: { mass: 8, bolted: true, painted: false, heavy: false }, headlight: { mass: 2.5, bolted: false, painted: false, heavy: false }, bumper_f: { mass: 10, bolted: true, painted: true, heavy: false }, bumper_r: { mass: 10, bolted: true, painted: true, heavy: false }, seat_f: { mass: 18, bolted: true, painted: false, heavy: false }, seat_r: { mass: 24, bolted: true, painted: false, heavy: false }, fender_l: { mass: 8, bolted: true, painted: true, heavy: false }, fender_r: { mass: 8, bolted: true, painted: true, heavy: false }, windshield: { mass: 14, bolted: true, painted: false, heavy: false }, window_r: { mass: 10, bolted: true, painted: false, heavy: false }, taillight: { mass: 2, bolted: false, painted: false, heavy: false } }, ai = 3.5, ni = 60, yl = 1;
function mR() {
  return yl++;
}
function Ok(B) {
  yl <= B && (yl = B + 1);
}
function kl(B, A, I = {}) {
  let g = { id: mR(), kind: B, cond: A, ...I };
  return B === "engine" && g.oil === void 0 && (g.oil = ai * 0.8), B === "radiator" && g.coolant === void 0 && (g.coolant = NQ * 0.9), B === "battery" && g.charge === void 0 && (g.charge = 0.8), g;
}
var xk = ["fender_fl", "fender_fr", "windshield", "window_r", "taillight_l", "taillight_r"];
function Bh(B) {
  if (xk.some((C) => C in B)) return B;
  let A = Object.values(B).filter(Boolean), I = A.length ? A.reduce((C, Q) => C + Q.cond, 0) / A.length : 0.6, g = { ...B };
  for (let C of xk) g[C] = kl(pQ[C], I);
  return g;
}
var Ml = { asphalt: { mu: 1.05, rr: 0.014, lat: 9 }, sand: { mu: 0.72, rr: 0.07, lat: 5.5 }, hard: { mu: 0.95, rr: 0.018, lat: 8 } }, Bs = 0.3, Ul = 0.07, qR = 36e3, HR = 2600, TR = 3800, bR = 9500, xR = 5200, OR = 0.07, Qh = V.wheelR, vR = V.axleF - V.axleR, Kl = [-2.4, 0, 2.84, 1.55, 1, 0.7], Gl = 3.27, Fl = 700, IE = 5800, PR = new y(), ZR = new y(), Qs = new nI();
function vk(B) {
  let A = (B - 3400) / 3e3;
  return 390 * yI(1 - 0.4 * A * A, 0.35, 1);
}
var _R = 1, bt = class {
  constructor(A, I, g, C, Q, i, E) {
    this.physics = A;
    this.mats = I;
    this.fn = g;
    this.look = C;
    let t = tB.filter((n) => !Q[n]);
    this.visual = Tk(I, C, t), this.parts = { ...Q };
    for (let n of tB) {
      let r = this.parts[n], c = this.visual.parts[n];
      r && c && this.applyPartLook(c, r), r?.kind === "wheel" && c && this.orientWheel(n, c);
    }
    for (let n of ["door_fl", "door_fr", "door_rl", "door_rr", "hood", "trunk"]) this.hinge[n] = { t: 0, target: 0 };
    let o = new nI().setFromAxisAngle(new y(0, 1, 0), E);
    this.body = A.world.createRigidBody(_I.RigidBodyDesc.dynamic().setTranslation(i.x, i.y, i.z).setRotation({ x: o.x, y: o.y, z: o.z, w: o.w }).setLinearDamping(0.02).setAngularDamping(0.15).setCcdEnabled(true).setCanSleep(true)), this.buildColliders(), this.updateMass();
    let e = (n, r) => new y(n, 0.53, r), s = (n, r, c, h) => ({ slot: n, hp: e(r, c), front: h, left: r > 0, comp: 0, prevComp: 0, len: Bs, contact: false, cp: new y(), n: new y(0, 1, 0), omega: 0, rot: 0, load: 0, slip: 0, surface: "sand" }), a = V.track;
    this.wheels = [s("wheel_fl", a, V.axleF, true), s("wheel_fr", -a, V.axleF, true), s("wheel_rl", a, V.axleR, false), s("wheel_rr", -a, V.axleR, false)], this.curPos.copy(i), this.prevPos.copy(i), this.curQuat.copy(o), this.prevQuat.copy(o), this.visual.root.position.copy(i), this.visual.root.quaternion.copy(o), this.visual.root.userData.car = this;
    for (let n of tB) {
      let r = this.visual.parts[n];
      r && (r.root.userData.slot = n);
    }
    this.visual.key.userData.control = "key", this.visual.radio.body.userData.control = "radio", this.visual.glovebox.userData.control = "glovebox", this.visual.fuelCap.userData.control = "fuelcap", this.visual.fuelCap.traverse((n) => n.userData.control = "fuelcap"), this.visual.dome.userData.control = "dome", this.visual.glovebox.traverse((n) => n.userData.control = "glovebox"), this.visual.key.traverse((n) => n.userData.control = "key"), this.visual.body.userData.control = "body";
  }
  physics;
  mats;
  fn;
  id = _R++;
  visual;
  body;
  cols = {};
  parts = {};
  hinge = {};
  fuel = { petrol: 10, diesel: 0, water: 0 };
  capsOpen = { fuel: false, oil: false, radiator: false };
  running = false;
  ignition = false;
  cranking = false;
  crankTime = 0;
  crankNeed = 1;
  rpm = 0;
  temp = 25;
  gear = 0;
  auto = true;
  shiftTimer = 0;
  shiftTarget = 0;
  revHold = 0;
  steerAngle = 0;
  throttle = 0;
  brake = 0;
  handbrake = true;
  lights = 0;
  horn = false;
  radioOn = false;
  radioFreq = 94.2;
  radioStation = "";
  domeMode = 0;
  domeLight = null;
  odometer = 0;
  speed = 0;
  wheels = [];
  misfire = 0;
  wheelspin = 0;
  skid = 0;
  onSand = 0;
  events = [];
  driverSeated = false;
  isPlayerCar = false;
  dead = false;
  gloveboxOpen = false;
  wet = 0;
  prevPos = new y();
  prevQuat = new nI();
  curPos = new y();
  curQuat = new nI();
  headL = null;
  headR = null;
  blink = 0;
  enabled = true;
  worldX = 0;
  worldZ = 0;
  accel = new y();
  lastVel = new y();
  electricsKilled = 0;
  look;
  spawnKey = null;
  modified = false;
  cuboid(A, I, g, C, Q, i, E) {
    let t = _I.ColliderDesc.cuboid(I, g, C).setTranslation(Q, i, E).setDensity(0).setFriction(0.6).setCollisionGroups(fB.car);
    A === "floor" && t.setActiveEvents(_I.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(9e3);
    let o = this.physics.world.createCollider(t, this.body);
    return this.physics.setOwner(o, { kind: "car", car: this, part: A }), this.cols[A] = o, o;
  }
  buildColliders() {
    let A = V;
    this.cuboid("floor", 0.9, 0.04, 2.45, 0, 0.26, -0.22), this.cuboid("bay", 0.6, 0.31, 0.62, 0, 0.62, 1.47), this.cuboid("fender_l", 0.17, 0.2, 0.62, 0.79, 0.72, 1.47), this.cuboid("fender_r", 0.17, 0.2, 0.62, -0.79, 0.72, 1.47), this.cuboid("nose", 0.86, 0.21, 0.13, 0, 0.62, 2.2), this.cuboid("tside_l", 0.04, 0.26, 0.42, 0.92, 0.72, -2.38), this.cuboid("tside_r", 0.04, 0.26, 0.42, -0.92, 0.72, -2.38), this.cuboid("trear", 0.9, 0.22, 0.05, 0, 0.66, -2.76), this.cuboid("tfloor", 0.86, 0.04, 0.42, 0, 0.44, -2.36), this.cuboid("qside_l", 0.05, 0.26, 0.24, 0.92, 0.72, -1.72), this.cuboid("qside_r", 0.05, 0.26, 0.24, -0.92, 0.72, -1.72), this.cuboid("roof", 0.72, 0.03, 0.74, 0, A.roofY + 0.01, (A.zWS1 + A.zRW1) / 2), this.cuboid("pillar_fl", 0.035, 0.24, 0.04, 0.8, 1.22, 0.46), this.cuboid("pillar_fr", 0.035, 0.24, 0.04, -0.8, 1.22, 0.46), this.cuboid("pillar_bl", 0.035, 0.26, 0.05, 0.82, 1.2, A.zDoorSplit), this.cuboid("pillar_br", 0.035, 0.26, 0.05, -0.82, 1.2, A.zDoorSplit), this.cuboid("pillar_rl", 0.05, 0.24, 0.1, 0.78, 1.22, -1.48), this.cuboid("pillar_rr", 0.05, 0.24, 0.1, -0.78, 1.22, -1.48), this.cuboid("bulk", 0.84, 0.3, 0.04, 0, 0.72, -1.68), this.cuboid("firewall", 0.84, 0.3, 0.03, 0, 0.64, A.zHood), this.cuboid("dash", 0.84, 0.1, 0.2, 0, 0.92, 0.56), this.refreshPartColliders();
  }
  setCol(A, I, g) {
    let C = this.cols[A];
    I && !C ? g() : !I && C && (this.physics.owners.delete(C.handle), this.physics.world.removeCollider(C, true), delete this.cols[A]);
  }
  refreshPartColliders() {
    let A = this.parts, I = V, g = (t) => !!A[t] && (this.hinge[t]?.t ?? 0) < 0.1, C = (I.zDoorSplit + I.zHood) / 2, Q = (I.zHood - I.zDoorSplit) / 2, i = (I.zDoorR0 + I.zDoorSplit) / 2, E = (I.zDoorSplit - I.zDoorR0) / 2;
    this.setCol("door_fl", g("door_fl"), () => this.cuboid("door_fl", 0.04, 0.3, Q, 0.92, 0.66, C)), this.setCol("door_rl", g("door_rl"), () => this.cuboid("door_rl", 0.04, 0.3, E, 0.92, 0.66, i)), this.setCol("door_fr", g("door_fr"), () => this.cuboid("door_fr", 0.04, 0.3, Q, -0.92, 0.66, C)), this.setCol("door_rr", g("door_rr"), () => this.cuboid("door_rr", 0.04, 0.3, E, -0.92, 0.66, i)), this.setCol("tlid", g("trunk"), () => this.cuboid("tlid", 0.84, 0.02, 0.4, 0, 0.99, -2.36)), this.setCol("bumper_f", !!A.bumper_f, () => this.cuboid("bumper_f", 0.84, 0.12, 0.06, 0, 0.44, 2.37)), this.setCol("bumper_r", !!A.bumper_r, () => this.cuboid("bumper_r", 0.86, 0.12, 0.06, 0, 0.5, -2.8)), this.setCol("seat_d", !!A.seat_d, () => this.cuboid("seat_d", 0.25, 0.08, 0.25, 0.42, 0.44, -0.38)), this.setCol("seat_p", !!A.seat_p, () => this.cuboid("seat_p", 0.25, 0.08, 0.25, -0.42, 0.44, -0.38)), this.setCol("seat_r", !!A.seat_r, () => this.cuboid("seat_r", 0.56, 0.08, 0.22, 0, 0.5, -1.16));
  }
  updateMass() {
    let A = 1100;
    for (let g of tB) {
      let C = this.parts[g];
      C && (A += JQ[C.kind].mass);
    }
    A += (this.fuel.petrol + this.fuel.diesel + this.fuel.water) * 0.75;
    let I = this.parts.engine ? 0.14 : -0.06;
    this.body.setAdditionalMassProperties(A, { x: 0, y: 0.5, z: I }, { x: A * 1.9, y: A * 2, z: A * 0.42 }, { x: 0, y: 0, z: 0, w: 1 }, true);
  }
  applyPartLook(A, I) {
    A.paint && I.paint ? Tr(A.paint, I.paint, I.rust ?? 0.3, this.look.dust) : A.paint && (A.paint.userData.rust.value = I.rust ?? this.look.rust);
  }
  orientWheel(A, I) {
    let g = I.root.userData.spin;
    g && (g.userData.baseYaw = A.endsWith("r") ? Math.PI : 0);
  }
  detach(A) {
    let I = this.parts[A], g = this.visual.parts[A];
    return !I || !g ? null : (this.visual.root.remove(g.root), delete this.parts[A], delete this.visual.parts[A], delete g.root.userData.slot, this.modified = true, (A.startsWith("door") || A === "hood" || A === "trunk") && (this.hinge[A] = { t: 0, target: 0 }), g.root.quaternion.identity(), A === "engine" && this.running && this.stall(), this.refreshPartColliders(), this.updateMass(), this.body.wakeUp(), { state: I, visual: g });
  }
  detachAndDiscard(A) {
    let I = this.modified;
    this.detach(A), this.modified = I;
  }
  canAttach(A, I) {
    return !this.parts[A] && pQ[A] === I;
  }
  attach(A, I, g) {
    return this.parts[A] ? false : (g && g.root.name !== A && (g = void 0), g || (g = Cs(A, this.mats, { ...this.look, paint: I.paint ?? this.look.paint, rust: I.rust ?? this.look.rust })), this.applyPartLook(g, I), g.root.position.copy(QC[A]), g.root.quaternion.identity(), g.root.visible = true, this.visual.root.add(g.root), this.visual.parts[A] = g, this.parts[A] = I, g.root.userData.slot = A, this.modified = true, I.kind === "wheel" && this.orientWheel(A, g), this.refreshPartColliders(), this.updateMass(), this.body.wakeUp(), true);
  }
  toggleHinge(A) {
    let I = this.hinge[A];
    return !I || !this.parts[A] ? false : (I.target = I.target > 0.5 ? 0 : 1, I.target > 0.5);
  }
  isOpen(A) {
    return (this.hinge[A]?.target ?? 0) > 0.5;
  }
  get fuelTotal() {
    return this.fuel.petrol + this.fuel.diesel + this.fuel.water;
  }
  addFuel(A, I) {
    let g = ni - this.fuelTotal, C = Math.min(g, I);
    return C <= 0 ? 0 : (A === "oil" ? this.fuel.water += C * 0.5 : this.fuel[A] += C, C);
  }
  get battery() {
    return this.parts.battery;
  }
  get charge() {
    return this.parts.battery ? (this.parts.battery.charge ?? 0) * (0.3 + 0.7 * this.parts.battery.cond) : 0;
  }
  drain(A) {
    let I = this.parts.battery;
    I && (I.charge = ZI((I.charge ?? 0) - A));
  }
  stall() {
    this.running && this.events.push({ type: "stall" }), this.running = false;
  }
  setIgnition(A) {
    this.ignition = A, A || (this.stall(), this.cranking = false);
  }
  setCrank(A) {
    if (A && !this.ignition && (this.ignition = true), A && !this.cranking && !this.running) {
      this.crankTime = 0;
      let I = this.parts.engine, g = this.temp < 20 ? 0.6 : 0;
      this.crankNeed = 0.35 + (I ? (1 - I.cond) * 1.6 : 0) + g + Math.random() * 0.5, (this.charge < 0.18 || !this.parts.battery) && this.events.push({ type: "crank_fail" });
    }
    this.cranking = A && !this.running;
  }
  engineCanRun() {
    let A = this.parts.engine;
    if (!A || A.cond <= 0.01 || this.dead || (A.oil ?? 0) <= 0.02) return false;
    let I = this.fuel.petrol, g = this.fuelTotal;
    return !(I < 0.02 || g > 0 && I / g < 0.55);
  }
  get fuelQuality() {
    let A = this.fuelTotal;
    return A > 0 ? this.fuel.petrol / A : 0;
  }
  updateEngine(A, I, g, C) {
    let Q = this.parts.engine, i = this.parts.radiator, E = this.charge;
    this.electricsKilled > 0 && (this.electricsKilled -= A), this.cranking && !this.running && (E > 0.15 && this.parts.battery && Q && (Q.oil ?? 0) > 0.02 ? (this.drain(A * 6e-3), this.rpm = Ag(this.rpm, 180 + 160 * E, 1 - Math.exp(-A * 8)), this.crankTime += A * yI(E * 1.3, 0.3, 1), this.crankTime > this.crankNeed && (this.engineCanRun() && this.electricsKilled <= 0 ? (this.running = true, this.cranking = false, this.rpm = 1300, this.events.push({ type: "start" })) : this.crankTime > this.crankNeed + 5 && (this.crankTime = this.crankNeed * 0.5))) : this.rpm = KI(this.rpm, 0, 6, A));
    let t = 0, o = Kl[this.gear + 1] * Gl;
    if (this.running) {
      if (!this.ignition || !this.engineCanRun() || this.electricsKilled > 0) return !this.engineCanRun() && this.fuel.petrol < 0.02 && this.events.push({ type: "no_fuel" }), this.stall(), 0;
      let a = this.fuelQuality, n = Q.cond, r = ZI((Q.oil ?? 0) / 1);
      this.misfire = ZI((1 - n) * 0.5 + (1 - a) * 1.6 + (this.temp > 118 ? 0.3 : 0));
      let c = Math.random() < this.misfire * A * 6;
      c && Math.random() < 0.15 && this.events.push({ type: "backfire" });
      let h = I * (c ? 0.2 : 1), D = (0.45 + 0.55 * n) * (0.7 + 0.3 * r) * (this.temp > 125 ? 0.6 : 1), l = this.shiftTimer > 0;
      if (this.gear === 0 || l) {
        let M = Fl + h * (IE - Fl) * 0.95;
        this.rpm = KI(this.rpm, M, h > 0.05 ? 3.5 : 2.2, A);
      } else {
        let M = Math.abs(g * o) * (30 / Math.PI), p = 1250;
        if (M < p) {
          let d = Math.max(Fl, 1e3 + h * 1800);
          this.rpm = KI(this.rpm, d, 4, A);
          let R = 0.35 + 0.65 * ZI(M / p), u = this.auto ? 34 : 18;
          t = (vk(this.rpm) * h * D + u * (1 - h)) * R;
        } else {
          this.rpm = M;
          let d = (18 + this.rpm * 8e-3) * (1 - h);
          t = vk(this.rpm) * h * D - d;
        }
        this.rpm > IE && (this.revHold = 0.08), this.revHold > 0 && (this.revHold -= A, t = Math.min(t, 0)), t *= o * 0.9;
      }
      this.rpm = yI(this.rpm, 500, IE + 300), this.rpm < 520 && this.gear !== 0 && Math.abs(g) < 0.5 && !this.auto && this.stall();
      let k = (1.2 + h * this.rpm / IE * 30 + this.rpm / IE * 5) / 3600 * A, K = this.fuelTotal;
      if (K > 0) {
        let M = Math.min(1, k / K);
        this.fuel.petrol -= this.fuel.petrol * M, this.fuel.diesel -= this.fuel.diesel * M, this.fuel.water -= this.fuel.water * M * 0.5;
      }
      Q.oil = Math.max(0, (Q.oil ?? 0) - A * (12e-7 * this.rpm + (n < 0.3 ? 8e-5 : 0)));
      let G = A * 4e-7 * this.rpm;
      if ((Q.oil ?? 0) < 0.8 && (G += A * 6e-4 * (1 - (Q.oil ?? 0) / 0.8)), this.temp > 122 && (G += A * 25e-4 * (this.temp - 122) / 10), this.rpm > IE - 200 && (G += A * 2e-4), Q.cond = Math.max(0, Q.cond - G), Q.cond <= 0.01 && (this.events.push({ type: "seized" }), this.stall()), this.parts.battery && this.rpm > 1100) {
        let M = this.parts.battery;
        M.charge = ZI((M.charge ?? 0) + A * 12e-4 * (1.1 - (M.charge ?? 0)));
      }
    } else this.cranking || (this.rpm = KI(this.rpm, 0, 3, A));
    this.ignition && !this.running && this.drain(A * 2e-5), this.lights > 0 && this.drain(A * (this.running ? 8e-5 : 7e-4)), this.radioOn && this.ignition && this.drain(A * (this.running ? 0 : 15e-5));
    let e = this.running ? (0.35 + 0.65 * (this.rpm / IE) * (0.4 + this.throttle * 0.6)) * 2.1 : 0, s = 4e-3;
    if (i) {
      let a = ZI((i.coolant ?? 0) / NQ), n = (0.25 + 0.75 * i.cond) * Math.min(1, a * 1.4), r = 0.15 + ZI(Math.abs(this.speed) / 30) * 0.85, c = this.temp > 98 && this.running && this.charge > 0.05 ? 0.5 : 0, h = Fg(82, 92, this.temp);
      s += n * (r + c) * 0.09 * (0.25 + 0.75 * h), this.temp > 112 && (i.coolant ?? 0) > 0 && (i.coolant = Math.max(0, (i.coolant ?? 0) - A * 4e-3 * (this.temp - 110))), i.cond < 0.3 && (i.coolant = Math.max(0, (i.coolant ?? 0) - A * 6e-4 * (1 - i.cond)));
    }
    return this.temp += (e - (this.temp - C) * s) * A, this.temp > 130 && this.running && Math.random() < A * 0.2 && this.events.push({ type: "overheat" }), t;
  }
  shift(A) {
    if (this.shiftTimer > 0) return;
    let I = yI(this.gear + A, -1, 4);
    I !== this.gear && (I === -1 && this.speed > 1.5 || (this.shiftTarget = I, this.shiftTimer = 0.22, this.events.push({ type: "shift" })));
  }
  fixedUpdate(A, I, g) {
    if (!this.enabled) return;
    this.prevPos.copy(this.curPos), this.prevQuat.copy(this.curQuat);
    let C = this.body, Q = C.translation(), i = C.rotation(), E = ZR.set(Q.x, Q.y, Q.z);
    Qs.set(i.x, i.y, i.z, i.w);
    let t = new y(0, 1, 0).applyQuaternion(Qs), o = new y(0, 0, 1).applyQuaternion(Qs), e = C.linvel(), s = new y(e.x, e.y, e.z);
    this.accel.copy(s).sub(this.lastVel).divideScalar(A), this.lastVel.copy(s), this.speed = s.dot(o);
    let a = Math.abs(this.speed);
    this.odometer += a * A / 1e3;
    let n = 0, r = 0, c = this.driverSeated && !!this.parts.seat_d;
    c && (this.auto ? (this.gear >= 1 || this.gear === 0 ? (n = I.throttle, r = I.brake, I.throttle > 0.05 && this.gear === 0 && this.running && (this.gear = 1), I.brake > 0.1 && I.throttle < 0.05 && this.speed < 0.6 && this.running && (this.revHold = 0, this.speed < 0.3 && (this.gear = -1))) : this.gear === -1 && (n = I.brake, r = I.throttle, I.throttle > 0.1 && this.speed > -0.6 && (this.gear = 1)), !this.running && this.gear !== 0 && (this.gear = 0)) : (n = I.throttle, r = I.brake), this.handbrake = I.handbrake ? true : this.handbrake && I.throttle < 0.1), this.throttle = n, this.brake = r, this.shiftTimer > 0 && (this.shiftTimer -= A, this.shiftTimer <= 0 && (this.gear = this.shiftTarget));
    let h = Ag(0.62, 0.075, Math.pow(ZI(a / 30), 0.65)), D = c ? I.steer * h : this.steerAngle, l = Math.abs(D) > Math.abs(this.steerAngle) ? 2.4 : 4;
    this.steerAngle += yI(D - this.steerAngle, -l * A, l * A);
    let U = this.wheels.filter((H) => !H.front && this.parts[H.slot]), S = 0;
    for (let H of U) S += H.omega;
    S = U.length ? S / U.length : 0;
    let k = this.updateEngine(A, n, S, g);
    if (this.auto && this.running && this.shiftTimer <= 0 && this.gear >= 1) {
      let H = Math.abs(S * Kl[this.gear + 1] * Gl) * (30 / Math.PI), O = 2500 + 2900 * n, IA = 1150 + 1e3 * n;
      H > O && this.gear < 4 ? this.shift(1) : H < IA && this.gear > 1 && this.shift(-1);
    }
    let K = C.worldCom(), G = new y(K.x, K.y, K.z), M = C.angvel(), p = new y(M.x, M.y, M.z), d = C.mass(), R = t.clone().negate(), u = 0, q = 0, L = 0, b = 0, W = [];
    for (let H of this.wheels) {
      let O = this.parts[H.slot];
      if (H.prevComp = H.comp, !O) {
        H.contact = false, H.comp = 0, W.push(0);
        continue;
      }
      let IA = O.flat ? Qh - 0.07 : Qh, _ = H.hp.clone().applyQuaternion(Qs).add(E), gA = this.physics.castRay(_, R, Bs + IA, fB.wheelRay, C);
      if (gA && gA.timeOfImpact > 0) if (H.contact = true, H.len = Math.max(Ul, gA.timeOfImpact - IA), H.comp = Bs - H.len, H.cp.copy(R).multiplyScalar(gA.timeOfImpact).add(_), H.n.set(gA.normal.x, gA.normal.y, gA.normal.z), this.physics.ownerOf(gA.collider)?.kind === "terrain") {
        let dA = H.cp.x + this.physics.originX, zA = H.cp.z + this.physics.originZ;
        H.surface = this.fn.onRoad(dA, zA, 0.1) ? "asphalt" : "sand";
      } else H.surface = "hard";
      else H.contact = false, H.len = Bs, H.comp = 0;
      W.push(H.comp);
    }
    for (let H = 0; H < 4; H++) {
      let O = this.wheels[H], IA = this.parts[O.slot];
      if (!IA) continue;
      let _ = IA.flat ? Qh - 0.07 : Qh;
      if (!O.contact) {
        !O.front && this.running && this.gear !== 0 ? O.omega = KI(O.omega, this.rpm / (Kl[this.gear + 1] * Gl) * (Math.PI / 30), 3, A) : O.omega = KI(O.omega, 0, 0.5, A), O.front === false && r > 0 && (O.omega = KI(O.omega, 0, 8, A)), O.rot += O.omega * A;
        continue;
      }
      b++;
      let gA = (O.comp - O.prevComp) / A, DA = qR * O.comp + (gA > 0 ? HR : TR) * gA;
      O.len <= Ul + 1e-3 && (DA += 6e4 * Math.max(0, Ul + 0.01 - O.len) + 4e3 * Math.max(0, gA));
      let dA = W[H ^ 1];
      DA += (O.front ? bR : xR) * (O.comp - dA), DA = Math.max(0, DA), O.load = DA;
      let zA = O.hp.clone().applyQuaternion(Qs).add(E);
      C.applyImpulseAtPoint({ x: t.x * DA * A, y: t.y * DA * A, z: t.z * DA * A }, { x: zA.x, y: zA.y, z: zA.z }, true);
      let X = O.front ? this.steerAngle * (1 + (O.left === this.steerAngle > 0 ? 0.08 : -0.06)) : 0, BA = o.clone().applyAxisAngle(t, X);
      BA.addScaledVector(O.n, -BA.dot(O.n)).normalize();
      let tA = new y().crossVectors(O.n, BA).normalize(), MA = O.cp.clone().sub(G), KA = new y().crossVectors(p, MA).add(s), LA = KA.dot(BA), hI = KA.dot(tA), sA = Ml[O.surface], lA = 0.75 + 0.25 * IA.cond, SA = sA.mu * lA * (IA.flat ? 0.6 : 1) * (1 - (O.surface === "sand" ? 0.08 : 0.32) * this.wet), wA = Math.min(DA, 9e3), JA = d / 4, GA = 0;
      !O.front && U.length && (GA += k / U.length / _);
      let pA = !O.front && this.handbrake, vA = (O.front ? 5400 : 3400) * r + (pA ? 6500 : 0);
      if (vA > 0) {
        let aA = Math.abs(LA) * JA / A;
        GA -= Hn(LA) * Math.min(vA, aA);
      }
      let II = sA.rr * wA * ZI(Math.abs(LA) / 0.6) * (IA.flat ? 3 : 1);
      GA -= Hn(LA) * II;
      let T = Math.atan2(hI, Math.max(Math.abs(LA), 2.2)), RI = SA * (pA ? 0.45 : 1), UI = O.surface === "sand" ? Fg(9, 22, Math.abs(hI)) * 2.2 : 0;
      RI += UI;
      let f = -RI * wA * yI(T * sA.lat, -1, 1), F = (SA + UI) * wA, Z = Math.hypot(GA, f), z = false;
      if (Z > F && Z > 0) {
        let aA = F / Z;
        Math.abs(GA) > F * 0.95 && !O.front && (q += Math.abs(GA) / F - 0.9), GA *= aA, f *= aA, z = true;
      }
      (Math.abs(hI) > 1.2 || z && a > 3) && (u += Math.min(1, Math.abs(hI) / 4 + (pA && a > 3 ? 0.5 : 0))), O.surface === "sand" && L++;
      let iA = BA.clone().multiplyScalar(GA).addScaledVector(tA, f), FA = O.cp.clone().addScaledVector(t, OR * (1 - UI));
      C.applyImpulseAtPoint({ x: iA.x * A, y: iA.y * A, z: iA.z * A }, { x: FA.x, y: FA.y, z: FA.z }, true);
      let YA = LA / _;
      !O.front && Math.abs(k) / Math.max(1, U.length) / _ > F * 1.05 && this.running ? O.omega = KI(O.omega, YA + Hn(k) * 18, 4, A) : (O.front ? r > 0.95 : pA) && Math.abs(LA) > 1 && vA > F * 1.2 ? O.omega = KI(O.omega, 0, 20, A) : O.omega = YA, O.rot += O.omega * A, O.slip = Math.abs(T);
    }
    this.skid = KI(this.skid, ZI(u / 2), 10, A), this.wheelspin = KI(this.wheelspin, ZI(q), 8, A), this.onSand = b ? L / b : this.onSand;
    let j = 0.5 * 1.2 * 0.42 * 1.95, oA = s.length();
    if (oA > 0.1 && C.applyImpulse({ x: -s.x * oA * j * A, y: -s.y * oA * j * A, z: -s.z * oA * j * A }, true), b >= 3 && a > 3) {
      let H = p.dot(t), IA = (this.onSand > 0.5 ? Ml.sand.mu : Ml.asphalt.mu) * 9.81 * 0.9 / Math.max(a, 1), _ = this.speed * Math.tan(this.steerAngle) / vR;
      _ = yI(_, -IA, IA);
      let gA = H - _;
      if (Math.sign(gA) === Math.sign(H) || Math.abs(H) < 0.05) {
        let DA = this.handbrake ? 0.15 : 0.6, dA = -gA * d * DA * A;
        C.applyTorqueImpulse({ x: t.x * dA, y: t.y * dA, z: t.z * dA }, true);
      }
    }
    if (b >= 3 && this.handbrake && a < 0.3 && n < 0.05) {
      let H = PR.set(0, 0, 0);
      for (let gA of this.wheels) gA.contact && H.add(gA.n);
      H.normalize();
      let O = -9.81 * H.y, IA = d * A;
      C.applyImpulse({ x: O * H.x * IA, y: (9.81 + O * H.y) * IA, z: O * H.z * IA }, true);
      let _ = C.linvel();
      C.setLinvel({ x: _.x * 0.8, y: _.y, z: _.z * 0.8 }, false);
    }
  }
  postStep() {
    let A = this.body.translation(), I = this.body.rotation();
    this.curPos.set(A.x, A.y, A.z), this.curQuat.set(I.x, I.y, I.z, I.w), this.worldX = A.x + this.physics.originX, this.worldZ = A.z + this.physics.originZ;
  }
  shiftOrigin(A, I) {
    this.curPos.x -= A, this.curPos.z -= I, this.prevPos.x -= A, this.prevPos.z -= I;
  }
  get position() {
    return this.curPos;
  }
  get quaternion() {
    return this.curQuat;
  }
  render(A, I, g) {
    let C = this.visual.root;
    C.position.lerpVectors(this.prevPos, this.curPos, I), C.quaternion.slerpQuaternions(this.prevQuat, this.curQuat, I);
    for (let K of Object.keys(this.hinge)) {
      let G = this.hinge[K], M = this.visual.parts[K];
      if (!M || !M.hinge) continue;
      let p = G.t;
      if (G.t = KI(G.t, G.target, G.target > G.t ? 7 : 9, A), Math.abs(G.t - G.target) < 2e-3 && (G.t = G.target), p !== G.t) {
        let d = G.t < 1 ? 1 - Math.pow(1 - G.t, 2) : 1;
        M.root.setRotationFromAxisAngle(M.hinge.axis, M.hinge.open * d), p < 0.1 != G.t < 0.1 && this.refreshPartColliders();
      }
    }
    for (let K of this.wheels) {
      let G = this.visual.parts[K.slot];
      if (!G) continue;
      let M = K.hp.y - (K.contact ? K.len : Bs);
      G.root.position.set(K.hp.x, M, K.hp.z), G.root.rotation.set(0, K.front ? this.steerAngle : 0, 0);
      let p = G.root.userData.spin;
      p && p.rotation.set(K.rot * (p.userData.baseYaw ? -1 : 1), p.userData.baseYaw ?? 0, 0, "YXZ");
    }
    let Q = this.visual;
    Q.steering.rotation.z = this.steerAngle * 7.5;
    let i = this.gear === -1 ? 0.14 : this.gear === 0 ? this.handbrake && !this.running ? 0.28 : 0 : -0.14;
    Q.gearLever.rotation.x = KI(Q.gearLever.rotation.x, i, 14, A), Q.gearLever.rotation.z = KI(Q.gearLever.rotation.z, !this.auto && this.gear > 0 ? 0.12 : 0, 10, A), Q.handbrake.rotation.x = KI(Q.handbrake.rotation.x, this.handbrake ? -0.42 : 0, 12, A), Q.key.rotation.z = this.cranking ? -1.2 : this.ignition ? -0.7 : 0, Q.glovebox.rotation.x = KI(Q.glovebox.rotation.x, this.gloveboxOpen ? -1.05 : 0, 8, A), Q.fuelCap.rotation.y = KI(Q.fuelCap.rotation.y, this.capsOpen.fuel ? -1.7 : 0, 9, A);
    let E = Math.abs(this.speed) * 3.6, t = this.ignition && this.charge > 0.02 && this.electricsKilled <= 0, o = Q.gauges;
    o.speed.rotation.z = KI(o.speed.rotation.z, BB.big(t ? ZI(E / 220) : 0), 10, A), o.tach.rotation.z = KI(o.tach.rotation.z, BB.big(t ? ZI(this.rpm / 7e3) : 0), 12, A), o.fuel.rotation.z = KI(o.fuel.rotation.z, BB.small(t ? ZI(this.fuelTotal / ni) : 0), 3, A), o.temp.rotation.z = KI(o.temp.rotation.z, BB.small(t ? ZI((this.temp - 40) / 90) : 0), 3, A), Lt(o.odo, this.odometer);
    let e = o.lights, s = this.parts.engine;
    e.oil.emissiveIntensity = t && (!this.running || !s || (s.oil ?? 0) < 0.6) ? 2.5 : 0, e.batt.emissiveIntensity = t && (!this.running || this.charge < 0.2) ? 2.5 : 0, e.beam.emissiveIntensity = t && this.lights === 2 ? 2.5 : 0, e.hand.emissiveIntensity = t && this.handbrake ? 2.5 : 0;
    let a = this.lights > 0 && this.charge > 0.02 && this.electricsKilled <= 0;
    o.faceMat.emissiveIntensity = t ? g > 0.3 || a ? 0.75 : 0.35 : 0, o.needleMat.emissiveIntensity = t ? 1.4 : 0.1, mt(Q.radio.display, this.radioFreq, t && this.radioOn, this.radioStation), Q.radio.screen.emissiveIntensity = t && this.radioOn ? 1.1 : 0;
    let n = ZI(this.charge * 4) * (this.running ? 1 : 0.8), r = Q.parts.headlight_l, c = Q.parts.headlight_r, h = (K, G) => K && G && G.cond > 0.05 && a ? (this.lights === 2 ? 14 : 8) * n : 0;
    r?.lamp && (r.lamp.emissiveIntensity = h(r, this.parts.headlight_l)), c?.lamp && (c.lamp.emissiveIntensity = h(c, this.parts.headlight_r));
    let D = this.brake > 0.05 && t;
    for (let K of ["taillight_l", "taillight_r"]) {
      let G = Q.parts[K];
      !G?.lamps || !this.parts[K] || this.parts[K].cond < 0.05 || (G.lamps.tail.emissiveIntensity = D ? 5 * n : a ? 1.6 * n : 0, G.lamps.reverse.emissiveIntensity = t && this.gear === -1 ? 3.5 : 0);
    }
    Q.lamps.brake.emissiveIntensity = D ? 5 * n : 0, this.blink += A;
    let l = Math.max(this.hinge.door_fl?.t ?? 0, this.hinge.door_fr?.t ?? 0, this.hinge.door_rl?.t ?? 0, this.hinge.door_rr?.t ?? 0) > 0.2, U = this.charge > 0.05 && this.electricsKilled <= 0 && (this.domeMode === 1 || this.domeMode === 0 && l && g > 0.3);
    if (Q.lamps.dome.emissiveIntensity = U ? 2.2 : 0, U && this.isPlayerCar && !this.domeLight && (this.domeLight = MB(new hQ(16771528, 0, 3.2, 1.6)), this.domeLight.position.set(0, V.roofY - 0.1, -0.4), Q.root.add(this.domeLight)), this.domeLight && (this.domeLight.intensity = U ? 1.6 : 0, this.domeLight.visible = U), this.headL && this.headR) {
      let K = h(r, this.parts.headlight_l) > 0 ? (this.lights === 2 ? 110 : 55) * n : 0, G = h(c, this.parts.headlight_r) > 0 ? (this.lights === 2 ? 110 : 55) * n : 0;
      this.headL.intensity = K, this.headR.intensity = G, this.headL.visible = K > 0, this.headR.visible = G > 0, this.headL.distance = this.headR.distance = this.lights === 2 ? 95 : 60;
      let M = this.lights === 2 ? 0 : -0.06;
      this.headL.target.position.set(0.9, 0.6 + M * 40, 40), this.headR.target.position.set(-0.9, 0.6 + M * 40, 40);
    }
    let S = Q.freshener, k = this.accel.clone().applyQuaternion(this.curQuat.clone().invert());
    S.rotation.z = KI(S.rotation.z, yI(k.x * 0.05, -0.6, 0.6), 3, A), S.rotation.x = KI(S.rotation.x, yI(-k.z * 0.04, -0.5, 0.5), 3, A);
  }
  enableHeadlightLights(A) {
    if (A && !this.headL) {
      let I = (g) => {
        let C = new Ji(16773336, 0, 70, 0.56, 0.5, 1.25);
        return C.position.set(g, 0.7, 2.3), C.target.position.set(g * 1.3, 0.3, 30), this.visual.root.add(C, C.target), C;
      };
      this.headL = I(0.68), this.headR = I(-0.68);
    } else !A && this.headL && (this.visual.root.remove(this.headL, this.headL.target, this.headR, this.headR.target), this.headL.dispose(), this.headR.dispose(), this.headL = this.headR = null);
  }
  applyImpact(A, I) {
    let g = [], C = yI((I - 9e3) / 6e4, 0, 0.6);
    if (C <= 0) return g;
    for (let Q of tB) {
      let i = this.parts[Q];
      if (!i) continue;
      let E = QC[Q].distanceTo(A);
      if (E > 1.3) continue;
      let t = C * (1 - E / 1.3) * (Q === "engine" ? 0.35 : Q.startsWith("seat") ? 0.1 : 1);
      i.cond = Math.max(0, i.cond - t), i.kind === "wheel" && t > 0.2 && Math.random() < 0.3 && (i.flat = true), i.cond <= 0.02 && ["bumper_f", "bumper_r", "hood", "trunk", "door_fl", "door_fr", "door_rl", "door_rr", "headlight_l", "headlight_r", "taillight_l", "taillight_r", "fender_fl", "fender_fr"].includes(Q) && I > 22e3 && g.push(Q);
    }
    return g;
  }
  anchor(A) {
    switch (A) {
      case "fuel":
        return this.visual.fuelNeck.clone();
      case "oil":
        return wl.oil.clone();
      case "radiator":
        return wl.radiator.clone();
      case "driver":
        return new y(0.42, 1.2, -0.46);
      case "passenger":
        return new y(-0.42, 1.2, -0.46);
      case "exhaust":
        return new y(-0.44, 0.27, -2.92);
      default:
        return new y();
    }
  }
  localToWorld(A, I = new y()) {
    return I.copy(A).applyQuaternion(this.visual.root.quaternion).add(this.visual.root.position);
  }
  worldToLocal(A, I = new y()) {
    return I.copy(A).sub(this.visual.root.position).applyQuaternion(this.visual.root.quaternion.clone().invert());
  }
  dispose() {
    this.enableHeadlightLights(false), this.domeLight && (this.domeLight.parent?.remove(this.domeLight), this.domeLight.dispose(), this.domeLight = null), this.physics.removeBody(this.body), this.visual.root.parent?.remove(this.visual.root);
  }
  serialize() {
    let A = this.body.translation(), I = this.body.rotation();
    return { look: this.look, parts: this.parts, fuel: this.fuel, odo: this.odometer, temp: this.temp, pos: [A.x + this.physics.originX, A.y, A.z + this.physics.originZ], rot: [I.x, I.y, I.z, I.w], lights: this.lights, radio: [this.radioOn, this.radioFreq], hinge: Object.fromEntries(Object.entries(this.hinge).map(([g, C]) => [g, C.target])), dead: this.dead, auto: this.auto };
  }
};
function xt(B = 0.8, A = Math.random) {
  let I = {}, g = 1e3 + Math.floor(A() * 1e6);
  for (let C of tB) {
    let Q = pQ[C], i = yI(B + (A() - 0.5) * 0.3, 0.05, 1), E = { id: g++, kind: Q, cond: i };
    Q === "engine" && (E.oil = ai * (0.5 + A() * 0.45)), Q === "radiator" && (E.coolant = NQ * (0.4 + A() * 0.6)), Q === "battery" && (E.charge = 0.5 + A() * 0.5), I[C] = E;
  }
  return I;
}
var WR = new y(0, 1, 0), ih = class {
  constructor(A) {
    this.c = A;
    A.fn.padProvider = (I) => this.plan(I).map((g) => this.padOf(g));
  }
  c;
  plans = /* @__PURE__ */ new Map();
  built = /* @__PURE__ */ new Map();
  collected = /* @__PURE__ */ new Set();
  wreckState = /* @__PURE__ */ new Map();
  pumpFuel = /* @__PURE__ */ new Map();
  doorState = /* @__PURE__ */ new Map();
  originX = 0;
  originZ = 0;
  buildQueue = [];
  night = 0;
  time = 0;
  padOf(A) {
    let I = wc[A.type];
    return { x: A.x, z: A.z, hw: I.hw, hd: I.hd, rot: A.ry, y: A.y, blend: 12 };
  }
  plan(A) {
    let I = this.plans.get(A);
    if (I) return I;
    I = [];
    let g = this.c.fn, C = new vI(gi(A, this.c.seed, 911)), Q = (i, E, t, o = 0) => {
      let e = wc[i], s = g.roadDX(E), a = Math.hypot(s, 1), n = -1 / a, r = s / a, c = t * (UB + e.hd + 6 + o), h = g.roadX(E) + n * c, D = E + r * c, U = Math.atan2(s, 1) + (t > 0 ? Math.PI / 2 : -Math.PI / 2), S = g.roadY(E) - 0.02;
      I.push({ key: `p${A}_${I.length}`, type: i, x: h, z: D, y: S, ry: U, seed: gi(A, I.length, this.c.seed), seg: A });
    };
    if (A === 0) Q("homestead", 70, 1, 2);
    else if (A > 0) {
      let i = Math.floor(A / 18), E = i * 18 + 3 + Math.floor(bn(i, this.c.seed, 5) * 12), t = A * qi;
      if (A === E || A === 2) Q("station", t + C.range(60, 140), C.sign());
      else {
        let o = C.weighted([["none", 40], ["wrecks", 14], ["garage", 9], ["house", 9], ["trailer", 5], ["shack", 6], ["billboard", 6], ["busstop", 3], ["military", 2.5], ["motel", 1.8], ["tower", 2.2]]);
        o !== "none" && Q(o, t + C.range(40, 160), C.sign(), o === "wrecks" ? -2 : C.range(0, 14)), o !== "billboard" && C.chance(0.08) && Q("billboard", t + C.range(10, 190), C.sign(), 2);
      }
    }
    if (this.plans.set(A, I), this.plans.size > 400) for (let i of this.plans.keys()) Math.abs(i - A) > 60 && this.plans.delete(i);
    return I;
  }
  setOrigin(A, I) {
    this.originX = A, this.originZ = I, this.poolT = 0;
    for (let g of this.built.values()) g.group.position.set(g.plan.x - A, g.plan.y, g.plan.z - I);
  }
  buildVisual(A) {
    let I = new xi(this.c.mats), g = new vI(A.seed);
    Zw(A.type, I, g);
    let C = new WA();
    C.name = "poi:" + A.type;
    for (let [i, E] of I.geos) {
      let t = new cA(Wg(E), i);
      t.castShadow = true, t.receiveShadow = true, C.add(t);
    }
    for (let i of I.extra) C.add(i);
    C.position.set(A.x - this.originX, A.y, A.z - this.originZ), C.rotation.y = A.ry, C.updateMatrixWorld(true);
    let Q = { plan: A, group: C, kit: I, physics: null, doors: [], lights: [], bulbs: null, interacts: [], active: false, wrecks: [], spawned: false, interiors: [], blinkers: [], neons: [] };
    I.doors.forEach((i, E) => {
      let t = new Gg();
      t.position.set(i.x, i.y, i.z), t.rotation.y = i.ry;
      let o = i.hinge === "l" ? 1 : -1, e = new cA(new uI(i.w, i.h, i.t), i.mat);
      if (e.position.set(o * i.w / 2, i.h / 2, 0), e.castShadow = true, e.receiveShadow = true, t.add(e), i.handle) {
        let r = new cA(new ug(0.03, 8, 6), this.c.mats.chrome);
        r.position.set(o * (i.w - 0.1), 1, 0.05);
        let c = r.clone();
        c.position.z = -0.05, t.add(r, c);
      }
      C.add(t);
      let s = `${A.key}:D${E}`, a = this.doorState.get(s) ?? 0, n = { def: i, pivot: t, t: a, target: a, handle: null, key: s };
      t.rotation.y = i.ry + (i.hinge === "l" ? -1 : 1) * i.open * a, t.traverse((r) => r.userData.door = n), Q.doors.push(n);
    }), I.interact.forEach((i, E) => {
      let t;
      i.kind === "pump" ? (t = Ow(this.c.mats, i.data.color), t.position.set(i.x, 0.22, i.z), t.rotation.y = Math.PI / 2) : i.kind === "mailbox" ? (t = vw(this.c.mats), t.position.set(i.x, 0, i.z), t.rotation.y = Math.PI) : (t = new cA(new uI(i.r * 1.6, 0.9, i.r * 1.6), this.c.mats.black), t.position.set(i.x, i.y, i.z), t.visible = false);
      let o = `${A.key}:X${E}`, e = { kind: i.kind, poi: Q, data: i.data ? { ...i.data } : {}, key: o, obj: t };
      i.kind === "pump" && this.pumpFuel.has(o) && (e.data.fuel = this.pumpFuel.get(o)), t.traverse((s) => s.userData.interact = e), C.add(t), Q.interacts.push(e);
    });
    for (let i of I.extra) i.traverse((E) => {
      E.userData.blink && Q.blinkers.push(E), E.userData.neon && Q.neons.push(E);
    });
    if (I.lights.length) {
      let i = new oI({ color: 16777215, emissive: 16767392, emissiveIntensity: 0 });
      for (let E of I.lights) {
        let t = new cA(new ug(0.05, 8, 6), i);
        t.position.set(E.x, E.y, E.z), C.add(t);
      }
      Q.bulbs = i;
    }
    for (let i of I.interior) {
      let E = new Jg(new y(i.x0, 0, i.z0), new y(i.x1, i.y1, i.z1));
      Q.interiors.push(E);
    }
    return this.c.scene.add(C), Q;
  }
  activate(A) {
    if (A.active) return;
    A.active = true;
    let I = A.plan, g = A.kit.cols.map((C) => {
      let Q = new nI().setFromAxisAngle(new y(0, 1, 0), C.ry);
      return _I.ColliderDesc.cuboid(C.hx, C.hy, C.hz).setTranslation(C.x, C.y, C.z).setRotation({ x: Q.x, y: Q.y, z: Q.z, w: Q.w }).setFriction(0.8);
    });
    A.physics = this.c.physics.addStatic(I.x, I.y, I.z, I.ry, g, { kind: "structure", poi: A });
    for (let C of A.doors) this.updateDoorCollider(A, C, true);
    A.spawned || this.spawnContents(A);
  }
  deactivate(A) {
    if (A.active) {
      A.active = false, this.c.physics.removeStatic(A.physics), A.physics = null;
      for (let I of A.doors) this.c.physics.removeStatic(I.handle), I.handle = null;
      for (let I of A.wrecks) I.modified && I.spawnKey && this.wreckState.set(I.spawnKey, I.serialize()), this.c.removeCar(I);
      A.wrecks = [], A.spawned = false;
      for (let I of A.lights) A.group.remove(I);
      A.lights = [];
    }
  }
  destroy(A) {
    this.deactivate(A), this.c.scene.remove(A.group), A.group.traverse((I) => {
      I.isMesh && I.geometry && I.geometry.dispose();
    }), this.built.delete(A.plan.key);
  }
  updateDoorCollider(A, I, g = false) {
    let C = A.plan, Q = I.def, i = Q.ry + (Q.hinge === "l" ? -1 : 1) * Q.open * I.t, E = Q.hinge === "l" ? 1 : -1, o = new y(E * Q.w / 2, Q.h / 2, 0).applyAxisAngle(new y(0, 1, 0), i).add(new y(Q.x, Q.y, Q.z)).applyAxisAngle(new y(0, 1, 0), C.ry), e = C.x + o.x, s = C.z + o.z, a = i + C.ry;
    if (!I.handle && g) I.handle = this.c.physics.addStatic(e, C.y + o.y, s, a, [_I.ColliderDesc.cuboid(Q.w / 2, Q.h / 2, Math.max(0.03, Q.t / 2))], { kind: "door", door: I });
    else if (I.handle) {
      let n = new nI().setFromAxisAngle(new y(0, 1, 0), a);
      I.handle.body.setTranslation({ x: e - this.c.physics.originX, y: C.y + o.y, z: s - this.c.physics.originZ }, true), I.handle.body.setRotation({ x: n.x, y: n.y, z: n.z, w: n.w }, true), I.handle.wx = e, I.handle.wz = s;
    }
  }
  toggleDoor(A) {
    return A.target = A.target > 0.5 ? 0 : 1, this.doorState.set(A.key, A.target), A.target > 0.5;
  }
  spawnContents(A) {
    A.spawned = true;
    let I = A.plan, g = new vI(I.seed ^ 20983), C = (i, E, t) => {
      let o = new y(i, E, t).applyAxisAngle(new y(0, 1, 0), I.ry);
      return [I.x + o.x, I.y + o.y, I.z + o.z];
    }, Q = this.c.items;
    A.kit.items.forEach((i, E) => {
      let t = `${I.key}:I${E}`;
      if (this.collected.has(t) || [...Q.items].some((c) => c.spawnKey === t)) return;
      let [o, e, s] = C(i.x, i.y, i.z), a = new nI().setFromAxisAngle(new y(0, 1, 0), (i.ry ?? 0) + I.ry), n = i.state ? { ...i.state } : {}, r = i.id;
      if (r === "part") {
        let c = n.partKind ?? "wheel", h = kl(c, n.cond ?? g.range(0.2, 0.85), { paint: g.pick(["#8fb3b0", "#c8561e", "#e2d8bf", "#5c7a4a", "#a8392c", "#3e5f8a", "#7a8c92"]), rust: g.range(0.3, 0.8) });
        n.charge !== void 0 && (h.charge = n.charge), n = { part: h };
      }
      (r === "crate" || r === "box") && (n.loot = this.rollLoot("crate", g, g.int(1, 3))), ji[r]?.liquid && n.amount === void 0 && (n.amount = 0), Q.spawn(r, o, e, s, a, n, { spawnKey: t, frozen: true });
    }), A.kit.loot.forEach((i, E) => {
      let t = `${I.key}:L${E}`;
      if (this.collected.has(t) || !g.chance(i.chance ?? 0.6) || [...Q.items].some((c) => c.spawnKey === t)) return;
      let o = this.rollLoot(i.table, g, 1)[0];
      if (!o) return;
      let e = i.spread ?? 0.2, [s, a, n] = C(i.x + g.range(-e, e), i.y + (ji[o.id]?.half[1] ?? 0.1) + 0.02, i.z + g.range(-0.08, 0.08)), r = new nI().setFromAxisAngle(new y(0, 1, 0), g.next() * 6.28);
      Q.spawn(o.id, s, a, n, r, o.state ?? {}, { spawnKey: t, frozen: true });
    }), A.kit.wrecks.forEach((i, E) => {
      let t = `${I.key}:W${E}`, [o, e, s] = C(i.x, 0.5, i.z), a = this.wreckState.get(t), n = new vI(gi(I.seed, E, 77)), r = a?.look ?? Tt(I.seed + E * 31);
      a || (r.rust = n.range(0.5, 0.95), r.dust = n.range(0.5, 0.9));
      let c = a?.parts ? Bh(a.parts) : void 0;
      if (!c) {
        c = xt(n.range(0.15, 0.6), () => n.next());
        let l = i.parts ?? 0.6;
        for (let U of tB) !n.chance(l) && U !== "bumper_r" && delete c[U];
        for (let U of ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"]) c[U] && n.chance(0.4) && (c[U].flat = true);
        c.engine && (c.engine.cond = n.range(0.05, 0.5)), c.battery && (c.battery.charge = n.range(0, 0.4));
      }
      let h = this.c.fn.height(o, s), D = new bt(this.c.physics, this.c.mats, this.c.fn, r, c, new y(o - this.c.physics.originX, h + 0.55, s - this.c.physics.originZ), I.ry + i.ry);
      if (D.dead = a ? a.dead : n.chance(0.7), D.fuel = a?.fuel ?? { petrol: n.chance(0.5) ? n.range(0, 12) : 0, diesel: 0, water: 0 }, D.handbrake = true, D.spawnKey = t, a?.odo && (D.odometer = a.odo), D.dead) for (let l of ["windshield", "window_r"]) D.parts[l] && n.chance(0.35) && D.detachAndDiscard(l);
      this.c.addCar(D), A.wrecks.push(D);
    });
  }
  rollLoot(A, I, g) {
    let C = Wc[A] ?? Wc.shelf, Q = [];
    for (let i = 0; i < g; i++) {
      let E = I.weighted(C), t = ji[E], o = {};
      if (t.money && (o.money = I.pick([5, 10, 10, 15, 20, 25, 40])), t.ammo && (o.ammo = I.int(4, 12)), t.liquid) {
        let e = t.liquid.kinds[0];
        o.liquid = I.chance(0.75) ? e : null, o.amount = o.liquid ? +(t.liquid.cap * I.range(0.3, 1)).toFixed(1) : 0;
      }
      E === "revolver" && (o.loaded = I.int(0, 6)), Q.push({ id: E, state: o });
    }
    return Q;
  }
  update(A, I, g) {
    this.time += A;
    let C = Math.floor(g / qi), Q = /* @__PURE__ */ new Set();
    for (let i = C - 6; i <= C + 6; i++) for (let E of this.plan(i)) Math.hypot(E.x - I, E.z - g) < 950 && (Q.add(E.key), !this.built.has(E.key) && !this.buildQueue.includes(E) && this.buildQueue.push(E));
    if (this.buildQueue.length) {
      this.buildQueue.sort((E, t) => Math.hypot(E.x - I, E.z - g) - Math.hypot(t.x - I, t.z - g));
      let i = this.buildQueue.shift();
      !this.built.has(i.key) && Math.hypot(i.x - I, i.z - g) < 1e3 && this.built.set(i.key, this.buildVisual(i));
    }
    for (let i of [...this.built.values()]) {
      let E = Math.hypot(i.plan.x - I, i.plan.z - g);
      if (E > 1300 && !Q.has(i.plan.key)) {
        this.destroy(i);
        continue;
      }
      E < 170 && this.c.physics.hasTerrainAt(i.plan.x, i.plan.z) ? this.activate(i) : E > 240 && this.deactivate(i);
      for (let o of i.doors) {
        if (o.t === o.target) continue;
        o.t += yI(o.target - o.t, -A * 2.2, A * 2.2);
        let e = o.t;
        o.pivot.rotation.y = o.def.ry + (o.def.hinge === "l" ? -1 : 1) * o.def.open * e, this.updateDoorCollider(i, o);
      }
      let t = this.night > 0.35;
      i.bulbs && (i.bulbs.emissiveIntensity = t ? 4 : 0);
      for (let o of i.blinkers) o.material.emissiveIntensity = Math.sin(this.time * 3) > 0.3 ? 6 : 0.2;
      for (let o of i.neons) {
        let e = Array.isArray(o.material) ? o.material : [o.material];
        for (let s of e) s.emissiveMap && (s.emissiveIntensity = t ? Math.random() < 0.02 ? 0.2 : 1.6 : 0);
      }
    }
    this.updateLightPool(I, g), this.c.items.cullSpawned((i) => {
      let E = i.split(":")[0];
      return this.built.has(E);
    });
  }
  lightPool = [];
  poolT = 0;
  initLightPool(A, I = 4) {
    for (let g = 0; g < I; g++) {
      let C = MB(new hQ(16767392, 0, 14, 1.6));
      C.position.set(0, -1e3, 0), A.add(C), this.lightPool.push(C);
    }
  }
  updateLightPool(A, I) {
    if (!this.lightPool.length || (this.poolT -= 1, this.poolT > 0)) return;
    this.poolT = 10;
    let g = [];
    if (this.night > 0.35) {
      let C = new y();
      for (let Q of this.built.values()) if (!(Math.hypot(Q.plan.x - A, Q.plan.z - I) > 70 || !Q.active)) for (let E of Q.kit.lights) {
        C.set(E.x, E.y - 0.1, E.z).applyAxisAngle(WR, Q.plan.ry);
        let t = Q.plan.x + C.x, o = Q.plan.z + C.z;
        g.push({ d: Math.hypot(t - A, o - I), x: t - this.originX, y: Q.plan.y + C.y, z: o - this.originZ, c: E.color, i: E.intensity, r: E.dist });
      }
      g.sort((Q, i) => Q.d - i.d);
    }
    this.lightPool.forEach((C, Q) => {
      let i = g[Q];
      if (!i) {
        C.intensity = 0, C.position.set(0, -1e3, 0);
        return;
      }
      C.position.set(i.x, i.y, i.z), C.color.setHex(i.c), C.intensity = i.i, C.distance = i.r;
    });
  }
  insideBuilding(A) {
    for (let I of this.built.values()) {
      if (!I.interiors.length) continue;
      let g = A.clone();
      g.x += this.originX - I.plan.x, g.z += this.originZ - I.plan.z, g.y -= I.plan.y, g.applyAxisAngle(new y(0, 1, 0), -I.plan.ry);
      for (let C of I.interiors) if (C.containsPoint(g)) return true;
    }
    return false;
  }
  nextPoi(A, I, g = 40) {
    let C = Math.floor(I / qi);
    for (let Q = C; Q < C + g; Q++) for (let i of this.plan(Q)) if (i.type === A && i.z > I) return i;
    return null;
  }
  homestead() {
    return this.plan(0)[0];
  }
};
var is = 0.3, Es = 0.6, VR = 1.62, jR = 1.02, Eh = class {
  constructor(A, I, g = 75) {
    this.physics = A;
    this.camera = new vg(g, 16 / 9, 0.05, 9e3), this.camera.rotation.order = "YXZ", this.body = A.world.createRigidBody(_I.RigidBodyDesc.kinematicPositionBased().setTranslation(I.x, I.y + Es + is, I.z)), this.collider = A.world.createCollider(_I.ColliderDesc.capsule(Es, is).setCollisionGroups(fB.player).setFriction(0), this.body), A.setOwner(this.collider, { kind: "player" }), this.ctrl = A.world.createCharacterController(0.02), this.ctrl.setUp({ x: 0, y: 1, z: 0 }), this.ctrl.enableAutostep(0.38, 0.18, false), this.ctrl.enableSnapToGround(0.35), this.ctrl.setMaxSlopeClimbAngle(52 * Math.PI / 180), this.ctrl.setMinSlopeSlideAngle(60 * Math.PI / 180), this.ctrl.setApplyImpulsesToDynamicBodies(true), this.ctrl.setCharacterMass(80), this.curPos.copy(I), this.prevPos.copy(I);
  }
  physics;
  body;
  collider;
  ctrl;
  camera;
  yaw = 0;
  pitch = 0;
  vel = new y();
  grounded = false;
  crouch = 0;
  sprinting = false;
  stats = { health: 100, hunger: 100, thirst: 100, energy: 100, stamina: 100 };
  car = null;
  seat = "driver";
  carYaw = 0;
  carPitch = 0;
  thirdPerson = false;
  tpDist = 7;
  bob = 0;
  bobAmt = 0;
  headBob = true;
  stepDist = 0;
  onStep = null;
  onLand = null;
  onDamage = null;
  surface = "sand";
  prevPos = new y();
  curPos = new y();
  carryMass = 0;
  dead = false;
  fallSpeed = 0;
  leaning = 0;
  shake = 0;
  shakeT = 0;
  inShelter = false;
  get feet() {
    return this.curPos;
  }
  teleport(A) {
    this.body.setTranslation({ x: A.x, y: A.y + Es + is, z: A.z }, true), this.body.setNextKinematicTranslation({ x: A.x, y: A.y + Es + is, z: A.z }), this.curPos.copy(A), this.prevPos.copy(A), this.vel.set(0, 0, 0);
  }
  look(A, I) {
    let g = 22e-4 * A.sensitivity, C = A.mouse.dx * g, Q = A.mouse.dy * g * (A.invertY ? -1 : 1);
    this.car ? (this.carYaw = yI(this.carYaw - C, -2.4, 2.4), this.carPitch = yI(this.carPitch - Q, -1.35, 1.2)) : (this.yaw -= C, this.pitch = yI(this.pitch - Q, -1.5, 1.5));
  }
  fixedUpdate(A, I, g) {
    if (this.prevPos.copy(this.curPos), this.car || this.dead) return;
    let C = (I.down("forward") ? 1 : 0) - (I.down("back") ? 1 : 0), Q = (I.down("left") ? 1 : 0) - (I.down("right") ? 1 : 0), i = I.down("crouch");
    this.crouch = KI(this.crouch, i ? 1 : 0, 10, A);
    let E = this.stats, t = ZI((this.carryMass - 10) / 90), o = E.energy < 12 ? 0.75 : 1;
    this.sprinting = I.down("sprint") && C > 0 && E.stamina > 2 && !i && t < 0.9;
    let e = (this.sprinting ? 6.2 : 3.4) * Ag(1, 0.45, t) * o * Ag(1, 0.5, this.crouch);
    g && (e = 0);
    let s = Math.sin(this.yaw), a = Math.cos(this.yaw), n = new y(-s * C - a * Q, 0, -a * C + s * Q);
    n.lengthSq() > 1 && n.normalize();
    let r = n.multiplyScalar(e), c = this.grounded ? 14 : 2.5;
    this.vel.x = KI(this.vel.x, r.x, c, A), this.vel.z = KI(this.vel.z, r.z, c, A), this.grounded ? (this.vel.y = -1.5, I.pressedA("jump") && E.stamina > 8 && !g && t < 0.8 && (this.vel.y = 4.7 * Ag(1, 0.7, t), E.stamina -= 8, this.grounded = false)) : (this.vel.y -= 9.81 * A, this.fallSpeed = Math.max(this.fallSpeed, -this.vel.y)), this.sprinting && n.lengthSq() > 0 ? E.stamina = Math.max(0, E.stamina - 16 * A) : E.stamina = Math.min(100, E.stamina + (this.grounded ? 14 : 4) * A * (E.energy < 20 ? 0.5 : 1));
    let h = { x: this.vel.x * A, y: this.vel.y * A, z: this.vel.z * A };
    this.ctrl.computeColliderMovement(this.collider, h, _I.QueryFilterFlags.EXCLUDE_SENSORS, fB.player);
    let D = this.ctrl.computedMovement(), l = this.grounded;
    this.grounded = this.ctrl.computedGrounded();
    let U = this.body.translation(), S = { x: U.x + D.x, y: U.y + D.y, z: U.z + D.z };
    this.body.setNextKinematicTranslation(S), this.curPos.set(S.x, S.y - Es - is, S.z), this.grounded && !l && (this.fallSpeed > 3 && this.onLand?.(this.fallSpeed), this.fallSpeed > 9.5 && this.onDamage?.((this.fallSpeed - 9.5) * 14, "fall"), this.fallSpeed = 0), this.grounded && D.y > -1e-3 && Math.abs(D.y) < 0.5 && (this.vel.y = Math.min(this.vel.y, 0));
    let k = Math.hypot(D.x, D.z) / A;
    if (this.grounded) {
      this.stepDist += k * A;
      let K = this.sprinting ? 2.1 : 1.55;
      this.stepDist > K && (this.stepDist = 0, this.onStep?.(this.surface));
    }
    this.bobAmt = KI(this.bobAmt, this.grounded ? ZI(k / 6) : 0, 8, A), this.bob += k * A * 2.1, this.curPos.y < -500 && this.onDamage?.(1e3, "fall");
  }
  updateCamera(A, I) {
    let g = this.camera;
    this.shakeT += I, this.shake = Math.max(0, this.shake - I * 1.5);
    let C = this.shake * this.shake, Q = (Math.sin(this.shakeT * 37) + Math.sin(this.shakeT * 23.1)) * 0.02 * C, i = (Math.sin(this.shakeT * 41.3) + Math.sin(this.shakeT * 17.7)) * 0.02 * C;
    if (this.car) {
      let s = this.car, a = s.visual.root;
      if (this.thirdPerson) {
        let h = new y(0, 0, -1).applyQuaternion(a.quaternion);
        h.y = 0, h.normalize();
        let D = Math.atan2(h.x, h.z) + this.carYaw, l = this.tpDist, U = a.position.clone().add(new y(Math.sin(D) * l * Math.cos(this.carPitch * 0.5 + 0.25), 1.2 + Math.sin(this.carPitch * 0.5 + 0.25) * l, Math.cos(D) * l * Math.cos(this.carPitch * 0.5 + 0.25)));
        g.position.lerp(U, 1 - Math.exp(-I * 12)), g.lookAt(a.position.clone().add(new y(0, 1, 0)));
        return;
      }
      let n = s.anchor(this.seat);
      n.x += this.leaning * (this.seat === "driver" ? 0.25 : -0.25), a.updateMatrixWorld(), g.position.copy(n).applyMatrix4(a.matrixWorld);
      let r = a.quaternion.clone(), c = new nI().setFromEuler(new $I(this.carPitch + i, this.carYaw + Math.PI + Q, 0, "YXZ"));
      g.quaternion.copy(r).multiply(c);
      return;
    }
    let E = new y().lerpVectors(this.prevPos, this.curPos, A), t = Ag(VR, jR, this.crouch), o = this.headBob ? Math.sin(this.bob * Math.PI) * 0.045 * this.bobAmt : 0, e = this.headBob ? Math.cos(this.bob * Math.PI * 0.5) * 0.03 * this.bobAmt : 0;
    g.position.set(E.x + Math.cos(this.yaw) * e, E.y + t + o, E.z - Math.sin(this.yaw) * e), g.rotation.set(this.pitch + i, this.yaw + Q, 0, "YXZ");
  }
  enterCar(A, I) {
    this.car = A, this.seat = I, this.carYaw = 0, this.carPitch = -0.12, this.collider.setEnabled(false), this.vel.set(0, 0, 0);
  }
  exitCar(A, I) {
    this.car = null, this.collider.setEnabled(true), this.teleport(A), this.yaw = I, this.pitch = 0;
  }
  shiftOrigin(A, I) {
    this.curPos.x -= A, this.curPos.z -= I, this.prevPos.x -= A, this.prevPos.z -= I;
  }
  viewRay(A) {
    return A.origin.copy(this.camera.position), A.direction.set(0, 0, -1).applyQuaternion(this.camera.quaternion), A;
  }
};
var ts = { forward: ["KeyW", "ArrowUp"], back: ["KeyS", "ArrowDown"], left: ["KeyA", "ArrowLeft"], right: ["KeyD", "ArrowRight"], jump: ["Space"], sprint: ["ShiftLeft", "ShiftRight"], crouch: ["KeyC", "ControlLeft"], interact: ["KeyE"], drop: ["KeyQ"], reload: ["KeyR"], flashlight: ["KeyF"], slot1: ["Digit1"], slot2: ["Digit2"], slot3: ["Digit3"], slot4: ["Digit4"], pause: ["Escape"], headlights: ["KeyL"], ignition: ["KeyI"], horn: ["KeyH"], handbrake: ["Space"], shiftUp: ["KeyR"], shiftDown: ["KeyF"], radio: ["KeyN"], tuneUp: ["BracketRight", "Period"], tuneDown: ["BracketLeft", "Comma"], camera: ["KeyV"], lean: ["KeyZ"], journal: ["KeyJ", "Tab"], sleep: ["KeyX"] }, th = class {
  constructor(A) {
    this.el = A;
    window.addEventListener("keydown", (I) => {
      if (this.onKeyCapture) {
        I.preventDefault();
        let C = this.onKeyCapture;
        this.onKeyCapture = null, C(I.code);
        return;
      }
      let g = I.target?.tagName;
      g === "INPUT" || g === "TEXTAREA" || (I.repeat || this.pressed.add(I.code), this.keys.add(I.code), (["Space", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Quote", "Slash"].includes(I.code) || I.ctrlKey) && I.preventDefault());
    }), window.addEventListener("keyup", (I) => {
      this.keys.delete(I.code), this.released.add(I.code);
    }), window.addEventListener("blur", () => this.keys.clear()), window.addEventListener("mousemove", (I) => {
      (this.locked || this.noLock) && (this.mouse.dx += I.movementX || 0, this.mouse.dy += I.movementY || 0);
    }), A.addEventListener("mousedown", (I) => {
      this.mouse.buttons |= 1 << I.button, this.mPressed |= 1 << I.button;
    }), window.addEventListener("mouseup", (I) => {
      this.mouse.buttons &= ~(1 << I.button), this.mReleased |= 1 << I.button;
    }), A.addEventListener("contextmenu", (I) => I.preventDefault()), window.addEventListener("wheel", (I) => {
      (this.locked || this.noLock) && (this.mouse.wheel += Math.sign(I.deltaY));
    }, { passive: true }), document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === A, this.locked || this.keys.clear(), this.onLockChange?.(this.locked);
    });
  }
  el;
  bindings = JSON.parse(JSON.stringify(ts));
  keys = /* @__PURE__ */ new Set();
  pressed = /* @__PURE__ */ new Set();
  released = /* @__PURE__ */ new Set();
  mouse = { dx: 0, dy: 0, wheel: 0, buttons: 0 };
  mPressed = 0;
  mReleased = 0;
  locked = false;
  enabled = true;
  sensitivity = 1;
  invertY = false;
  noLock = false;
  onLockChange = null;
  onKeyCapture = null;
  requestLock() {
    if (!this.noLock) try {
      let A = this.el.requestPointerLock({ unadjustedMovement: false });
      A && A.catch && A.catch(() => this.el.requestPointerLock());
    } catch {
      this.el.requestPointerLock?.();
    }
  }
  exitLock() {
    document.pointerLockElement && document.exitPointerLock();
  }
  get active() {
    return this.enabled && (this.locked || this.noLock);
  }
  down(A) {
    if (!this.active) return false;
    for (let I of this.bindings[A]) if (this.keys.has(I)) return true;
    return false;
  }
  pressedA(A) {
    if (!this.active) return false;
    for (let I of this.bindings[A]) if (this.pressed.has(I)) return true;
    return false;
  }
  releasedA(A) {
    for (let I of this.bindings[A]) if (this.released.has(I)) return true;
    return false;
  }
  rawPressed(A) {
    return this.pressed.has(A);
  }
  mouseDown(A = 0) {
    return this.active && (this.mouse.buttons & 1 << A) !== 0;
  }
  mousePressed(A = 0) {
    return this.active && (this.mPressed & 1 << A) !== 0;
  }
  mouseReleased(A = 0) {
    return (this.mReleased & 1 << A) !== 0;
  }
  simKey(A, I) {
    I ? (this.keys.has(A) || this.pressed.add(A), this.keys.add(A)) : (this.keys.delete(A), this.released.add(A));
  }
  simMouse(A, I) {
    I ? (this.mouse.buttons |= 1 << A, this.mPressed |= 1 << A) : (this.mouse.buttons &= ~(1 << A), this.mReleased |= 1 << A);
  }
  endFrame() {
    this.pressed.clear(), this.released.clear(), this.mouse.dx = this.mouse.dy = this.mouse.wheel = 0, this.mPressed = this.mReleased = 0;
  }
  keyName(A) {
    return A.replace("Key", "").replace("Digit", "").replace("Left", " L").replace("Right", " R").replace("Bracket", "").replace("Arrow", "");
  }
  label(A) {
    return this.keyName(this.bindings[A][0] ?? "?");
  }
};
var oh = class {
  constructor(A, I) {
    this.physics = A;
    this.world = I;
  }
  physics;
  world;
  active = /* @__PURE__ */ new Map();
  timer = 0;
  update(A, I, g = false) {
    if (this.timer -= A, this.timer > 0 && !g) return;
    this.timer = 0.5;
    let C = /* @__PURE__ */ new Set();
    for (let Q of I) {
      for (let { inst: i, kind: E } of this.world.scatter.collidersNear(Q.x, Q.z, 70)) {
        let t = `${E.id}:${i.x.toFixed(2)}:${i.z.toFixed(2)}`;
        if (C.add(t), this.active.has(t)) continue;
        let o = E.collider.r * i.s, e = E.collider.h * i.s * i.sy, s;
        E.id.startsWith("rock") ? s = _I.ColliderDesc.ball(o * 0.95).setTranslation(0, o * 0.25 - 0.1, 0) : s = _I.ColliderDesc.cylinder(e / 2, o).setTranslation(0, e / 2 - 0.2, 0), s.setFriction(0.8), this.active.set(t, this.physics.addStatic(i.x, i.y, i.z, 0, [s], { kind: "prop", id: E.id }));
      }
      for (let i of this.world.roadside.polesNear(Q.x, Q.z, 70)) {
        let E = `pole:${i.x.toFixed(2)}:${i.z.toFixed(2)}`;
        C.add(E), !this.active.has(E) && this.active.set(E, this.physics.addStatic(i.x, i.y, i.z, 0, [_I.ColliderDesc.cylinder(4.2, 0.14).setTranslation(0, 4, 0)], { kind: "prop", id: "pole" }));
      }
    }
    for (let [Q, i] of this.active) C.has(Q) || (this.physics.removeStatic(i), this.active.delete(Q));
  }
};
var XR = 1, pl = class {
  constructor(A, I, g) {
    this.def = A;
    this.state = I;
    this.obj = g, this.mass = A.mass, g.traverse((C) => C.userData.item = this);
  }
  def;
  state;
  id = XR++;
  obj;
  body = null;
  held = false;
  inInventory = false;
  materialized = true;
  wx = 0;
  wy = 0;
  wz = 0;
  quat = new nI();
  spawnKey = null;
  touched = false;
  partVisual = null;
  mass;
  half = new y();
  lastSound = 0;
  get part() {
    return this.state.part;
  }
}, eh = class {
  constructor(A, I) {
    this.physics = A;
    this.mats = I;
    this.group.name = "items";
  }
  physics;
  mats;
  items = /* @__PURE__ */ new Set();
  group = new WA();
  originX = 0;
  originZ = 0;
  onImpact = null;
  spawn(A, I, g, C, Q, i = {}, E = {}) {
    let t = ji[A] ?? ji.box, o, e = E.partVisual ?? null;
    if (A === "part" && i.part) {
      let a = i.part;
      e || (e = Cs(Ch[a.kind], this.mats, { paint: a.paint ?? "#8a8a80", rust: a.rust ?? 0.4, dust: 0.4, seat: "#4a2a1a", interior: "#c9b89a", plate: "", seed: 1, ...E.look ?? {} }));
      let n = new WA();
      e.root.quaternion.identity(), e.root.userData.spin && e.root.userData.spin.rotation.set(0, 0, 0), e.root.position.set(0, 0, 0), e.root.updateMatrixWorld(true);
      let r = new Jg().setFromObject(e.root);
      r.getSize(e.size), r.getCenter(e.center), e.root.position.copy(e.center).negate(), n.add(e.root), o = n;
    } else o = t.build(this.mats, i);
    o.traverse((a) => {
      a.isMesh && (a.castShadow = true, a.receiveShadow = true);
    });
    let s = new pl(t, i, o);
    return s.partVisual = e, e ? (s.half.copy(e.size).multiplyScalar(0.5).max(new y(0.03, 0.03, 0.03)), s.mass = JQ[i.part.kind].mass) : s.half.set(t.half[0], t.half[1], t.half[2]), s.spawnKey = E.spawnKey ?? null, s.wx = I, s.wy = g, s.wz = C, Q && s.quat.copy(Q), o.position.set(I - this.originX, g, C - this.originZ), o.quaternion.copy(s.quat), this.group.add(o), this.items.add(s), E.frozen || this.makeBody(s), s;
  }
  makeBody(A, I) {
    if (A.body) return;
    let g = A.obj.position, C = A.obj.quaternion, Q = A.def.heavy || A.part && JQ[A.part.kind].heavy || A.mass > 25, i = _I.RigidBodyDesc.dynamic().setTranslation(g.x, g.y, g.z).setRotation({ x: C.x, y: C.y, z: C.z, w: C.w }).setLinearDamping(0.1).setAngularDamping(0.4).setCcdEnabled(A.mass < 20).setCanSleep(true), E = this.physics.world.createRigidBody(i), t, o = A.half;
    if (A.part?.kind === "wheel") {
      let a = new nI().setFromAxisAngle(new y(0, 0, 1), Math.PI / 2);
      t = _I.ColliderDesc.cylinder(0.08, 0.3).setRotation({ x: a.x, y: a.y, z: a.z, w: a.w });
    } else A.def.shape === "cyl" && !A.partVisual ? t = _I.ColliderDesc.cylinder(o.y, o.x) : A.def.shape === "ball" ? t = _I.ColliderDesc.ball(o.x) : t = _I.ColliderDesc.cuboid(o.x, o.y, o.z);
    let e = Math.max(5e-4, o.x * o.y * o.z * 8);
    t.setDensity(A.mass / e).setFriction(0.7).setRestitution(0.12).setCollisionGroups(Q ? fB.heavy : fB.item), t.setActiveEvents(_I.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(Math.max(15, A.mass * 25));
    let s = this.physics.world.createCollider(t, E);
    this.physics.setOwner(s, { kind: "item", item: A }), I && E.setLinvel({ x: I.x, y: I.y, z: I.z }, true), A.body = E;
  }
  removeBody(A) {
    A.body && (this.physics.removeBody(A.body), A.body = null);
  }
  remove(A) {
    this.removeBody(A), A.obj.parent?.remove(A.obj), this.items.delete(A);
  }
  pick(A) {
    this.removeBody(A), A.touched = true, A.spawnKey = null;
  }
  place(A, I, g, C) {
    A.held = false, A.inInventory = false, A.obj.parent !== this.group && this.group.add(A.obj), A.obj.position.copy(I), A.obj.quaternion.copy(g), A.obj.scale.setScalar(1), A.obj.visible = true, A.materialized = true, A.wx = I.x + this.originX, A.wy = I.y, A.wz = I.z + this.originZ, this.makeBody(A, C);
  }
  setOrigin(A, I) {
    let g = A - this.originX, C = I - this.originZ;
    this.originX = A, this.originZ = I;
    for (let Q of this.items) !Q.body && Q.materialized && !Q.held && !Q.inInventory && (Q.obj.position.x -= g, Q.obj.position.z -= C);
  }
  update(A, I, g) {
    for (let C of this.items) {
      if (C.held || C.inInventory) continue;
      if (C.body) {
        let E = C.body.translation(), t = C.body.rotation();
        if (C.obj.position.set(E.x, E.y, E.z), C.obj.quaternion.set(t.x, t.y, t.z, t.w), C.wx = E.x + this.originX, C.wy = E.y, C.wz = E.z + this.originZ, C.quat.copy(C.obj.quaternion), E.y < -200) {
          this.remove(C);
          continue;
        }
      }
      let Q = Math.hypot(C.wx - A, C.wz - I);
      C.body && (Q > 90 || !g(C.wx, C.wz)) ? this.removeBody(C) : !C.body && Q < 70 && g(C.wx, C.wz) && C.materialized && (C.obj.position.set(C.wx - this.originX, C.wy, C.wz - this.originZ), this.makeBody(C));
      let i = Q < 450;
      i !== C.materialized && (C.materialized = i, i ? (this.group.add(C.obj), C.obj.position.set(C.wx - this.originX, C.wy, C.wz - this.originZ), C.obj.quaternion.copy(C.quat)) : this.group.remove(C.obj));
    }
  }
  cullSpawned(A) {
    for (let I of this.items) I.spawnKey && !I.touched && !A(I.spawnKey) && this.remove(I);
  }
  serialize() {
    let A = [];
    for (let I of this.items) I.spawnKey && !I.touched || I.inInventory || I.held || A.push({ id: I.def.id, s: I.state, p: [+I.wx.toFixed(2), +I.wy.toFixed(2), +I.wz.toFixed(2)], q: [I.quat.x, I.quat.y, I.quat.z, I.quat.w] });
    return A;
  }
  impact(A, I, g) {
    g - A.lastSound < 0.12 || (A.lastSound = g, this.onImpact?.(A, I));
  }
};
var zR = `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
attribute float aRot;
varying float vAlpha;
varying vec3 vColor;
varying float vRot;
varying vec3 vFogViewPos;
uniform float uScale;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale / max(-mv.z, 0.1);
  vAlpha = aAlpha;
  vColor = aColor;
  vRot = aRot;
  vFogViewPos = mv.xyz;
}`, $R = `
uniform sampler2D uTex;
uniform vec3 fogColor;
uniform float fogDensity;
uniform vec3 fogSunColor;
uniform vec3 fogSunDir;
uniform vec4 fogParams;
varying float vAlpha;
varying vec3 vColor;
varying float vRot;
varying vec3 vFogViewPos;
uniform float uAdditive;
void main(){
  vec2 p = gl_PointCoord - 0.5;
  float c = cos(vRot), s = sin(vRot);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + 0.5;
  vec4 t = texture2D(uTex, p);
  float a = t.a * vAlpha;
  if (a < 0.003) discard;
  vec3 col = vColor * t.rgb;
  float d = length(vFogViewPos);
  float f = 1.0 - exp(-fogDensity * d);
  col = mix(col, fogColor, clamp(f, 0.0, 1.0) * (1.0 - uAdditive));
  gl_FragColor = vec4(col, a);
}`, Ot = class {
  constructor(A, I, g = false) {
    this.max = A;
    this.geo = new SI(), this.pos = new Float32Array(A * 3), this.size = new Float32Array(A), this.alpha = new Float32Array(A), this.col = new Float32Array(A * 3), this.rot = new Float32Array(A), this.geo.setAttribute("position", new GI(this.pos, 3).setUsage(XC)), this.geo.setAttribute("aSize", new GI(this.size, 1).setUsage(XC)), this.geo.setAttribute("aAlpha", new GI(this.alpha, 1).setUsage(XC)), this.geo.setAttribute("aColor", new GI(this.col, 3).setUsage(XC)), this.geo.setAttribute("aRot", new GI(this.rot, 1).setUsage(XC));
    let C = new xI({ vertexShader: zR, fragmentShader: $R, uniforms: { uTex: { value: I }, uScale: { value: 600 }, uAdditive: { value: g ? 1 : 0 }, ...iw() }, transparent: true, depthWrite: false, blending: g ? TC : jQ });
    this.points = new yo(this.geo, C), this.points.frustumCulled = false, this.points.renderOrder = 10;
  }
  max;
  points;
  ps = [];
  geo;
  pos;
  size;
  alpha;
  col;
  rot;
  tmpC = new nA();
  emit(A) {
    let I = A.count ?? 1;
    this.tmpC.set(A.color ?? 16777215);
    for (let g = 0; g < I; g++) {
      this.ps.length >= this.max && this.ps.shift();
      let C = A.spread ?? 0.5, Q = A.jitter ?? 0.1, i = (A.life?.[0] ?? 1) + Math.random() * ((A.life?.[1] ?? 2) - (A.life?.[0] ?? 1));
      this.ps.push({ x: A.pos.x + (Math.random() - 0.5) * Q, y: A.pos.y + (Math.random() - 0.5) * Q, z: A.pos.z + (Math.random() - 0.5) * Q, vx: (A.vel?.x ?? 0) + (Math.random() - 0.5) * C, vy: (A.vel?.y ?? 0) + (Math.random() - 0.5) * C, vz: (A.vel?.z ?? 0) + (Math.random() - 0.5) * C, life: i, max: i, size: (A.size?.[0] ?? 0.5) + Math.random() * ((A.size?.[1] ?? 1) - (A.size?.[0] ?? 0.5)), grow: A.grow ?? 0.5, r: this.tmpC.r, g: this.tmpC.g, b: this.tmpC.b, a: A.alpha ?? 0.5, rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 1.5, drag: A.drag ?? 0.8, grav: A.grav ?? 0 });
    }
  }
  shift(A, I) {
    for (let g of this.ps) g.x -= A, g.z -= I;
  }
  update(A, I, g) {
    let C = this.points.material.uniforms;
    C.fogColor.value.copy(I.color), C.fogDensity.value = I.density, C.uScale.value = g * 0.9;
    let Q = 0;
    for (let i = this.ps.length - 1; i >= 0; i--) {
      let E = this.ps[i];
      if (E.life -= A, E.life <= 0) {
        this.ps.splice(i, 1);
        continue;
      }
    }
    for (let i of this.ps) {
      let E = Math.exp(-i.drag * A);
      i.vx *= E, i.vy = i.vy * E - i.grav * A, i.vz *= E, i.x += i.vx * A, i.y += i.vy * A, i.z += i.vz * A, i.size += i.grow * A, i.rot += i.spin * A;
      let t = i.life / i.max;
      this.pos[Q * 3] = i.x, this.pos[Q * 3 + 1] = i.y, this.pos[Q * 3 + 2] = i.z, this.size[Q] = i.size, this.alpha[Q] = i.a * Math.min(1, t * 3) * Math.min(1, (1 - t) * 8 + 0.2), this.col[Q * 3] = i.r, this.col[Q * 3 + 1] = i.g, this.col[Q * 3 + 2] = i.b, this.rot[Q] = i.rot, Q++;
    }
    this.geo.setDrawRange(0, Q);
    for (let i of ["position", "aSize", "aAlpha", "aColor", "aRot"]) this.geo.attributes[i].needsUpdate = true;
  }
}, sh = class {
  mesh;
  pos;
  n = 2400;
  mat;
  constructor() {
    this.pos = new Float32Array(this.n * 6);
    for (let I = 0; I < this.n; I++) {
      let g = (Math.random() - 0.5) * 40, C = Math.random() * 24, Q = (Math.random() - 0.5) * 40;
      this.pos.set([g, C, Q, g, C - 0.5, Q], I * 6);
    }
    let A = new SI();
    A.setAttribute("position", new GI(this.pos, 3).setUsage(XC)), this.mat = new YE({ color: 11187392, transparent: true, opacity: 0.35, depthWrite: false }), this.mesh = new wo(A, this.mat), this.mesh.frustumCulled = false, this.mesh.visible = false;
  }
  update(A, I, g, C, Q) {
    let i = Math.max(g, C);
    if (this.mesh.visible = i > 0.02, !this.mesh.visible) return;
    let E = Math.floor(this.n * i), t = C > g;
    this.mat.color.set(t ? 13148272 : 11187392), this.mat.opacity = t ? 0.28 : 0.32;
    let o = t ? -2 : -18, e = Q.x * (t ? 1.6 : 0.3), s = Q.z * (t ? 1.6 : 0.3), a = t ? 0.18 : 0.06;
    for (let n = 0; n < this.n; n++) {
      let r = n * 6;
      if (n >= E) {
        this.pos[r + 1] = -1e3, this.pos[r + 4] = -1e3;
        continue;
      }
      let c = this.pos[r] + e * A, h = this.pos[r + 1] + o * A, D = this.pos[r + 2] + s * A;
      (h < I.y - 4 || Math.abs(c - I.x) > 20 || Math.abs(D - I.z) > 20 || h < -500) && (c = I.x + (Math.random() - 0.5) * 40, D = I.z + (Math.random() - 0.5) * 40, h = I.y + (t ? Math.random() * 6 - 2 : 10 + Math.random() * 12)), this.pos[r] = c, this.pos[r + 1] = h, this.pos[r + 2] = D, this.pos[r + 3] = c - e * a, this.pos[r + 4] = h - o * a, this.pos[r + 5] = D - s * a;
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
};
function Zk(B, A) {
  let [I, g] = jg(B, B), C = g.createRadialGradient(B / 2, B / 2, 0, B / 2, B / 2, B / 2);
  for (let [Q, i] of A) C.addColorStop(Q, i);
  return g.fillStyle = C, g.fillRect(0, 0, B, B), [I, g];
}
function _k() {
  let [B, A] = Zk(128, [[0, "rgba(255,255,255,1)"], [0.12, "rgba(255,230,170,0.95)"], [0.35, "rgba(255,150,60,0.35)"], [1, "rgba(255,120,40,0)"]]);
  A.globalCompositeOperation = "lighter";
  for (let I = 0; I < 6; I++) {
    let g = I / 6 * Math.PI * 2 + Math.random() * 0.4, C = 40 + Math.random() * 22;
    A.save(), A.translate(64, 64), A.rotate(g);
    let Q = A.createLinearGradient(0, 0, C, 0);
    Q.addColorStop(0, "rgba(255,220,150,0.9)"), Q.addColorStop(1, "rgba(255,140,50,0)"), A.fillStyle = Q, A.beginPath(), A.moveTo(0, -5), A.lineTo(C, 0), A.lineTo(0, 5), A.fill(), A.restore();
  }
  return Tg(B);
}
function Wk() {
  let [B] = Zk(64, [[0, "rgba(255,255,255,1)"], [0.2, "rgba(255,255,255,0.55)"], [0.5, "rgba(255,255,255,0.12)"], [1, "rgba(255,255,255,0)"]]);
  return Tg(B);
}
function Vk() {
  let [B, A] = jg(64, 64), I = A.createRadialGradient(32, 32, 0, 32, 32, 30);
  I.addColorStop(0, "rgba(8,6,5,1)"), I.addColorStop(0.3, "rgba(12,10,8,0.97)"), I.addColorStop(0.42, "rgba(58,48,40,0.75)"), I.addColorStop(0.65, "rgba(40,34,30,0.3)"), I.addColorStop(1, "rgba(0,0,0,0)"), A.fillStyle = I, A.fillRect(0, 0, 64, 64), A.strokeStyle = "rgba(20,16,14,0.6)", A.lineWidth = 1.2;
  for (let g = 0; g < 6; g++) {
    let C = Math.random() * Math.PI * 2;
    A.beginPath(), A.moveTo(32 + Math.cos(C) * 7, 32 + Math.sin(C) * 7), A.lineTo(32 + Math.cos(C + 0.2) * (14 + Math.random() * 10), 32 + Math.sin(C + 0.2) * (14 + Math.random() * 10)), A.stroke();
  }
  return Tg(B);
}
function jk() {
  let [B, A] = jg(128, 128), I = 7, g = () => (I = (I * 9301 + 49297) % 233280) / 233280;
  for (let C = 0; C < 14; C++) {
    let Q = g() * Math.PI * 2, i = g() * 26, E = 10 + g() * 18, t = A.createRadialGradient(64 + Math.cos(Q) * i, 64 + Math.sin(Q) * i, 0, 64 + Math.cos(Q) * i, 64 + Math.sin(Q) * i, E);
    t.addColorStop(0, "rgba(92,8,6,0.95)"), t.addColorStop(0.7, "rgba(70,6,5,0.85)"), t.addColorStop(1, "rgba(60,4,4,0)"), A.fillStyle = t, A.beginPath(), A.arc(64 + Math.cos(Q) * i, 64 + Math.sin(Q) * i, E, 0, Math.PI * 2), A.fill();
  }
  for (let C = 0; C < 26; C++) {
    let Q = g() * Math.PI * 2, i = 30 + g() * 30, E = 1 + g() * 3.5;
    A.fillStyle = "rgba(80,6,5,0.9)", A.beginPath(), A.arc(64 + Math.cos(Q) * i, 64 + Math.sin(Q) * i, E, 0, Math.PI * 2), A.fill();
  }
  return Tg(B);
}
var ah = class {
  constructor(A = 1500) {
    this.maxSeg = A;
    this.pos = new Float32Array(A * 18), this.col = new Float32Array(A * 24), this.across = new Float32Array(A * 6), this.geo.setAttribute("position", new GI(this.pos, 3).setUsage(XC)), this.geo.setAttribute("aCol", new GI(this.col, 4).setUsage(XC)), this.geo.setAttribute("aV", new GI(this.across, 1).setUsage(XC));
    let I = new xI({ vertexShader: "attribute vec4 aCol; attribute float aV; varying vec4 vCol; varying float vV; void main(){ vCol = aCol; vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: "varying vec4 vCol; varying float vV; void main(){ float e = 1.0 - vV * vV; gl_FragColor = vec4(vCol.rgb * vCol.a * e * e, 1.0); }", transparent: true, depthWrite: false, blending: TC, side: OI });
    this.mesh = new cA(this.geo, I), this.mesh.frustumCulled = false, this.mesh.renderOrder = 11;
  }
  maxSeg;
  mesh;
  list = [];
  geo = new SI();
  pos;
  col;
  across;
  add(A) {
    this.list.push(A);
  }
  get count() {
    return this.list.length;
  }
  shift(A, I) {
    for (let g of this.list) for (let C of g.pts) C.x -= A, C.z -= I;
  }
  update(A, I) {
    let g = new y(), C = new y(), Q = new y(), i = 0, E = (t, o, e, s) => {
      this.pos[i * 3] = t.x + g.x * o, this.pos[i * 3 + 1] = t.y + g.y * o, this.pos[i * 3 + 2] = t.z + g.z * o, this.col[i * 4] = e.r, this.col[i * 4 + 1] = e.g, this.col[i * 4 + 2] = e.b, this.col[i * 4 + 3] = s, this.across[i] = o, i++;
    };
    this.list = this.list.filter((t) => (t.life -= A) > 0);
    for (let t of this.list) {
      t.step?.(t, A);
      let o = t.life / t.max * (t.flicker ? Math.random() < 0.72 ? 1 : 0.2 : 1), e = t.pts.length;
      for (let s = 0; s < e - 1 && i + 6 <= this.maxSeg * 6; s++) {
        let a = t.pts[s], n = t.pts[s + 1];
        C.subVectors(n, a), Q.addVectors(a, n).multiplyScalar(0.5).sub(I), g.crossVectors(C, Q).normalize().multiplyScalar(t.width * 0.5);
        let r = t.trail ? o * s / (e - 1) : o, c = t.trail ? o * (s + 1) / (e - 1) : o;
        E(a, -1, t.color, r), E(a, 1, t.color, r), E(n, 1, t.color, c), E(a, -1, t.color, r), E(n, 1, t.color, c), E(n, -1, t.color, c);
      }
    }
    this.geo.setDrawRange(0, i);
    for (let t of ["position", "aCol", "aV"]) this.geo.attributes[t].needsUpdate = true;
  }
}, Pk = new y(0, 0, 1), os = class {
  constructor(A, I) {
    this.max = A;
    this.mesh = new WC(new PI(1, 1), I, A), this.mesh.frustumCulled = false, this.mesh.receiveShadow = true, this.mesh.renderOrder = 2;
    let g = new TA().makeScale(0, 0, 0);
    for (let C = 0; C < A; C++) this.mesh.setMatrixAt(C, g);
  }
  max;
  mesh;
  next = 0;
  m = new TA();
  q = new nI();
  q2 = new nI();
  add(A, I, g) {
    this.q.setFromUnitVectors(Pk, I), this.q2.setFromAxisAngle(Pk, Math.random() * Math.PI * 2), this.q.multiply(this.q2), this.m.compose(A.clone().addScaledVector(I, 6e-3), this.q, new y(g, g, g)), this.mesh.setMatrixAt(this.next, this.m), this.mesh.instanceMatrix.needsUpdate = true, this.next = (this.next + 1) % this.max;
  }
  shift(A, I) {
    let g = this.mesh.instanceMatrix.array;
    for (let C = 0; C < this.max; C++) g[C * 16 + 12] -= A, g[C * 16 + 14] -= I;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
};
function Jl(B, A) {
  return new oI({ map: B, transparent: true, depthWrite: false, roughness: A, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
}
var nh = class {
  constructor(A = 30) {
    this.max = A;
    let I = new VA(48e-4, 48e-4, 0.024, 7);
    this.mesh = new WC(I, new oI({ color: 13214284, metalness: 1, roughness: 0.3 }), A), this.mesh.frustumCulled = false, this.mesh.castShadow = true, this.mesh.count = 0;
  }
  max;
  mesh;
  list = [];
  m = new TA();
  dq = new nI();
  one = new y(1, 1, 1);
  eject(A, I, g) {
    this.list.length >= this.max && this.list.shift(), this.list.push({ p: A.clone(), v: I.clone(), q: new nI().setFromEuler(new $I(Math.random() * 3, Math.random() * 3, 0)), spin: new y((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40), floor: g, life: 12, rest: false });
  }
  shift(A, I) {
    for (let g of this.list) g.p.x -= A, g.p.z -= I;
  }
  update(A) {
    let I = [];
    return this.list = this.list.filter((g) => (g.life -= A) > 0), this.list.forEach((g, C) => {
      g.rest || (g.v.y -= 9.8 * A, g.p.addScaledVector(g.v, A), this.dq.setFromEuler(new $I(g.spin.x * A, g.spin.y * A, g.spin.z * A)), g.q.multiply(this.dq), g.p.y < g.floor + 5e-3 && (g.p.y = g.floor + 5e-3, Math.abs(g.v.y) > 0.6 && I.push(g.p.clone()), g.v.y = -g.v.y * 0.35, g.v.x *= 0.55, g.v.z *= 0.55, g.spin.multiplyScalar(0.6), Math.abs(g.v.y) < 0.35 && (g.rest = true, g.q.setFromEuler(new $I(Math.PI / 2, Math.random() * 6.28, 0, "YXZ"))))), this.m.compose(g.p, g.q, this.one), this.mesh.setMatrixAt(C, this.m);
    }), this.mesh.count = this.list.length, this.mesh.instanceMatrix.needsUpdate = true, I;
  }
};
var rh = class {
  constructor(A) {
    this.g = A;
    let I = A.tex.puff;
    this.smoke = new Ot(900, I, false), this.dust = new Ot(1500, I, false), this.glow = new Ot(400, I, true), this.precip = new sh(), this.flash = MB(new hQ(16756832, 0, 18, 2)), this.holes = new os(60, Jl(Vk(), 0.95)), this.bloodDecals = new os(40, Jl(jk(), 0.35)), this.flashSprite = new RE(new OQ({ map: _k(), color: 16769200, blending: TC, depthWrite: false, transparent: true })), this.flashSprite.visible = false, this.flashSprite.renderOrder = 12;
    let g = Wk();
    this.haloMat = new OQ({ map: g, color: 16773852, blending: TC, depthWrite: false, transparent: true }), this.tailMat = new OQ({ map: g, color: 16722448, blending: TC, depthWrite: false, transparent: true }), this.group.add(this.smoke.points, this.dust.points, this.glow.points, this.precip.mesh, this.flash, this.ribbons.mesh, this.holes.mesh, this.bloodDecals.mesh, this.casings.mesh, this.flashSprite);
  }
  g;
  smoke;
  dust;
  glow;
  precip;
  ribbons = new ah();
  holes;
  bloodDecals;
  casings = new nh();
  flashSprite;
  flashSpriteT = 0;
  halos = /* @__PURE__ */ new Map();
  haloMat;
  tailMat;
  flash;
  flashT = 0;
  group = new WA();
  dustAcc = 0;
  stormAcc = 0;
  shift(A, I) {
    this.smoke.shift(A, I), this.dust.shift(A, I), this.glow.shift(A, I), this.ribbons.shift(A, I), this.holes.shift(A, I), this.bloodDecals.shift(A, I), this.casings.shift(A, I);
  }
  blood(A, I) {
    this.dust.emit({ pos: A, vel: I.clone().multiplyScalar(1.5), count: 10, spread: 1.6, life: [0.3, 0.8], size: [0.08, 0.2], grow: 0.3, color: 6949896, alpha: 0.85, grav: 6, drag: 2 });
  }
  sandHit(A) {
    this.dust.emit({ pos: A, vel: new y(0, 1.2, 0), count: 8, spread: 1.2, life: [0.5, 1.2], size: [0.15, 0.4], grow: 0.8, color: 13149306, alpha: 0.6, grav: 1.5, drag: 2 });
  }
  sparks(A, I = 10) {
    this.glow.emit({ pos: A, count: I, spread: 5, life: [0.15, 0.45], size: [0.03, 0.07], grow: -0.05, color: 16756816, alpha: 1, grav: 9, drag: 1 });
  }
  muzzle(A, I) {
    this.glow.emit({ pos: A, vel: I.clone().multiplyScalar(3), count: 6, spread: 1, life: [0.04, 0.09], size: [0.12, 0.3], grow: 2, color: 16760944, alpha: 1 }), this.smoke.emit({ pos: A, vel: I.clone().multiplyScalar(1.5), count: 4, spread: 0.3, life: [0.6, 1.2], size: [0.1, 0.25], grow: 0.6, color: 11578532, alpha: 0.35 }), this.flashSprite.position.copy(A).addScaledVector(I, 0.05), this.flashSprite.material.rotation = Math.random() * Math.PI * 2, this.flashSprite.scale.setScalar(0.28 + Math.random() * 0.12), this.flashSprite.visible = true, this.flashSpriteT = 0.05, this.flash.position.copy(A), this.flash.color.set(16756832), this.flash.intensity = 25, this.flash.distance = 14, this.flashT = 0.06;
  }
  shot(A, I, g, C, Q) {
    let i = A.clone().addScaledVector(I, 0.6);
    i.distanceTo(g) > 1.5 && this.ribbons.add({ pts: [i, g.clone()], width: 0.025, color: new nA(1.6, 1.25, 0.7), life: 0.07, max: 0.07, trail: true });
    let E = new y(1, 0, 0).applyQuaternion(C.quaternion), t = new y(0, 1, 0).applyQuaternion(C.quaternion), o = E.multiplyScalar(1.8 + Math.random()).addScaledVector(t, 1.6 + Math.random()).addScaledVector(I, -0.4), s = this.g.physics.groundY(A.x, A.z, A.y + 0.2);
    this.casings.eject(A.clone().addScaledVector(I, -0.25), o, s), Q && (this.holes.add(Q.point, Q.normal, 0.13 + Math.random() * 0.05), this.dust.emit({ pos: Q.point.clone().addScaledVector(Q.normal, 0.05), vel: Q.normal.clone().multiplyScalar(1.2), count: 6, spread: 0.8, life: [0.4, 0.9], size: [0.06, 0.18], grow: 0.8, color: 9077368, alpha: 0.5, drag: 2.5 }));
  }
  bloodPool(A, I) {
    let g = this.g, C = A.clone().add(new y((Math.random() - 0.5) * I, 0, (Math.random() - 0.5) * I));
    C.y = g.physics.groundY(C.x, C.z, A.y + 1);
    let Q = new y(0, 1, 0), i = 0.3, E = (t, o) => g.world.fn.height(t + g.physics.originX, o + g.physics.originZ);
    Math.abs(C.y - E(C.x, C.z)) < 0.05 && Q.set(E(C.x - i, C.z) - E(C.x + i, C.z), 2 * i, E(C.x, C.z - i) - E(C.x, C.z + i)).normalize(), this.bloodDecals.add(C, Q, I);
  }
  deathBurst(A, I) {
    I && this.dust.emit({ pos: A.clone().add(new y(0, 0.45, 0)), vel: new y(0, 1.2, 0), count: 18, spread: 2.4, life: [0.8, 1.8], size: [0.03, 0.07], grow: 0.1, color: 12101260, alpha: 0.9, drag: 2.2, grav: 1.2 }), this.dust.emit({ pos: A.clone().add(new y(0, 0.2, 0)), vel: new y(0, 0.6, 0), count: I ? 6 : 14, spread: 2, life: [0.8, 2], size: [0.3, 0.7], grow: 1.2, color: 12755580, alpha: 0.35, drag: 2 });
  }
  stepDust(A, I) {
    this.dust.emit({ pos: A.clone().add(new y(0, 0.05, 0)), vel: new y(0, 0.35, 0), count: I ? 5 : 2, spread: I ? 1.2 : 0.6, life: [0.5, 1.1], size: [0.1, I ? 0.35 : 0.2], grow: 0.9, color: 12887164, alpha: I ? 0.3 : 0.18, drag: 2.5, grav: 0.3 });
  }
  backfire(A, I) {
    this.glow.emit({ pos: A, vel: I.clone().multiplyScalar(6), count: 10, spread: 1.2, life: [0.05, 0.14], size: [0.1, 0.28], grow: 1.5, color: 16747056, alpha: 1 }), this.glow.emit({ pos: A, vel: I.clone().multiplyScalar(3), count: 4, spread: 0.6, life: [0.03, 0.07], size: [0.06, 0.12], grow: 1, color: 8036607, alpha: 0.9 }), this.smoke.emit({ pos: A, vel: I.clone().multiplyScalar(2).add(new y(0, 0.4, 0)), count: 5, spread: 0.6, life: [0.8, 1.6], size: [0.15, 0.3], grow: 1, color: 3814962, alpha: 0.45 }), this.flash.position.copy(A), this.flash.color.set(16747072), this.flash.intensity = 40, this.flash.distance = 10, this.flashT = 0.08;
  }
  crash(A, I, g) {
    let C = Math.round(yI(I * 2, 6, 30));
    this.dust.emit({ pos: A, vel: new y(0, 2.5, 0), count: C, spread: I * 0.7, life: [0.6, 1.4], size: [0.02, 0.05], grow: 0, color: g, alpha: 1, drag: 0.4, grav: 9 }), this.dust.emit({ pos: A, vel: new y(0, 0.8, 0), count: Math.round(C / 2), spread: 2.5, life: [1, 2.5], size: [0.5, 1.2], grow: 1.3, color: 12558972, alpha: 0.3, drag: 1.5 });
  }
  explosion(A) {
    this.glow.emit({ pos: A, count: 30, spread: 9, life: [0.2, 0.6], size: [0.6, 1.8], grow: 4, color: 16744496, alpha: 1, drag: 3 }), this.sparks(A, 40), this.smoke.emit({ pos: A, vel: new y(0, 3, 0), count: 40, spread: 5, life: [2, 5], size: [1, 2.5], grow: 1.8, color: 3814446, alpha: 0.7, drag: 1.5, grav: -0.5 }), this.dust.emit({ pos: A, vel: new y(0, 5, 0), count: 50, spread: 10, life: [1, 3], size: [0.5, 1.4], grow: 1.5, color: 12098160, alpha: 0.7, drag: 1.8, grav: 2 }), this.flash.position.copy(A), this.flash.color.set(16748608), this.flash.intensity = 300, this.flash.distance = 60, this.flashT = 0.25;
  }
  woodBurst(A) {
    this.dust.emit({ pos: A, count: 16, spread: 3.5, life: [0.4, 1], size: [0.05, 0.14], grow: 0, color: 9071172, alpha: 0.95, grav: 9, drag: 0.8 }), this.dust.emit({ pos: A, count: 8, spread: 1.2, life: [0.5, 1.2], size: [0.3, 0.6], grow: 0.8, color: 12099712, alpha: 0.4, drag: 2 });
  }
  update(A) {
    let I = this.g, g = I.scene.fog, C = I.renderer.domElement.height;
    this.smoke.update(A, g, C), this.dust.update(A, g, C), this.glow.update(A, g, C);
    let Q = I.player.camera.position;
    this.ribbons.update(A, Q);
    for (let E of this.casings.update(A)) E.distanceTo(Q) < 12 && I.audio.play("impact_metal", { pos: E, volume: 0.12, pitch: 2.2 });
    this.flashSpriteT > 0 && (this.flashSpriteT -= A) <= 0 && (this.flashSprite.visible = false), this.flashT > 0 && (this.flashT -= A, this.flashT <= 0 ? this.flash.intensity = 0 : this.flash.intensity *= 0.85);
    let i = I.env;
    this.precip.update(A, I.player.camera.position, i.cur.rain, i.cur.sand * 0.8, i.wind);
    for (let E of I.cars) {
      if (!E.enabled) continue;
      let t = E.visual.root.position.distanceTo(I.player.camera.position);
      if (this.updateHalos(E, t), t > 120) continue;
      let o = E.parts.engine;
      if (o && E.running && o.cond < 0.35 && Math.random() < A * (8 + (0.35 - o.cond) * 40)) {
        let s = E.localToWorld(new y((Math.random() - 0.5) * 0.8, 0.95, 1.3 + Math.random() * 0.5));
        this.smoke.emit({ pos: s, vel: new y(0, 1.2, 0), count: 1, spread: 0.4, life: [1.5, 3], size: [0.25, 0.5], grow: 1.3, color: o.cond < 0.15 ? 1973274 : 4867648, alpha: 0.45, drag: 0.8, grav: -0.4 }), o.cond < 0.12 && this.glow.emit({ pos: s, vel: new y(0, 1.5, 0), count: 2, spread: 0.5, life: [0.2, 0.5], size: [0.12, 0.3], grow: 0.6, color: 16742954, alpha: 0.9, drag: 1 });
      }
      if (E.running && Math.random() < A * (6 + E.throttle * 20)) {
        let s = E.localToWorld(E.anchor("exhaust")), a = new y(0, 0, -1).applyQuaternion(E.visual.root.quaternion), n = E.misfire > 0.3 || (E.parts.engine?.cond ?? 1) < 0.3;
        this.smoke.emit({ pos: s, vel: a.multiplyScalar(1.2).add(new y(0, 0.3, 0)), count: 1, spread: 0.3, life: [0.8, 1.8], size: [0.08, 0.16], grow: 0.9 + E.throttle, color: n ? 4210748 : 13683908, alpha: n ? 0.5 : 0.16 + E.throttle * 0.15, drag: 1.2, grav: -0.3 });
      }
      let e = Math.abs(E.speed);
      if (e > 2) for (this.dustAcc += A * e * (E.onSand > 0.4 ? 1.8 : 0.15); this.dustAcc > 1; ) {
        this.dustAcc -= 1;
        let s = E.wheels[2 + Math.floor(Math.random() * 2)];
        if (!s.contact) continue;
        let a = s.cp.clone(), n = s.surface === "sand";
        this.dust.emit({ pos: a.add(new y(0, 0.1, 0)), vel: new y(0, 0.8, 0).addScaledVector(new y(0, 0, -1).applyQuaternion(E.visual.root.quaternion), e * 0.12), count: 1, spread: 1.2, life: [1.2, 3.2], size: [0.4, 0.9], grow: 1.4 + e * 0.04, color: n ? 13281148 : 11576464, alpha: n ? 0.34 : 0.12, drag: 1.4, grav: -0.05 });
      }
      if (E.skid > 0.3 && E.onSand < 0.5 && e > 4 && Math.random() < A * 30 * E.skid) {
        let s = E.wheels[Math.floor(Math.random() * 4)];
        s.contact && this.smoke.emit({ pos: s.cp.clone(), count: 1, spread: 0.6, life: [1, 2.2], size: [0.3, 0.6], grow: 1.2, color: 14210252, alpha: 0.25, drag: 1.5 });
      }
      if (E.temp > 118 && E.running && Math.random() < A * 12) {
        let s = E.localToWorld(new y(0, 0.9, 1.7));
        this.smoke.emit({ pos: s, vel: new y(0, 1.5, 0), count: 1, spread: 0.5, life: [1, 2], size: [0.2, 0.4], grow: 1, color: 15790320, alpha: 0.3, drag: 1 });
      }
    }
    if (i.cur.sand > 0.3) {
      this.stormAcc += A * 25 * i.cur.sand;
      let E = I.player.camera.position;
      for (; this.stormAcc > 1; ) {
        this.stormAcc -= 1;
        let t = E.clone().add(new y((Math.random() - 0.5) * 50, Math.random() * 4 - 1, (Math.random() - 0.5) * 50));
        this.dust.emit({ pos: t, vel: i.wind.clone().multiplyScalar(0.9), count: 1, spread: 2, life: [2, 4], size: [2.5, 5], grow: 1.5, color: 12094040, alpha: 0.14 * i.cur.sand, drag: 0.2 });
      }
    }
  }
  updateHalos(A, I) {
    let g = this.g, C = A.lights > 0 && A.charge > 0.02 && A.electricsKilled <= 0 && g.env.night > 0.25 && I < 400, Q = this.halos.get(A);
    if (!C) {
      if (Q) for (let s of Q) s.visible = false;
      return;
    }
    if (!Q) {
      Q = [this.haloMat, this.haloMat, this.tailMat, this.tailMat].map((s) => new RE(s.clone()));
      for (let s of Q) s.renderOrder = 12, this.group.add(s);
      this.halos.set(A, Q);
    }
    let i = new y(0, 0, 1).applyQuaternion(A.visual.root.quaternion), E = g.player.camera.position.clone().sub(A.visual.root.position).normalize(), t = yI(i.dot(E), 0, 1), o = yI(-i.dot(E), 0, 1), e = ["headlight_l", "headlight_r"];
    for (let s = 0; s < 4; s++) {
      let a = Q[s], n = s < 2, r = n ? !!A.parts[e[s]] && (A.parts[e[s]].cond ?? 1) > 0.05 : true;
      if (a.visible = r && (n ? t : o) > 0.05, !a.visible) continue;
      let c = n ? QC[e[s]].clone().add(new y(0, 0, 0.05)) : new y(s === 2 ? 0.52 : -0.52, 0.68, -2.08);
      a.position.copy(A.localToWorld(c));
      let h = n ? t * t * (A.lights === 2 ? 1 : 0.6) : o * 0.5;
      a.scale.setScalar((n ? 1.3 : 0.55) * (0.6 + h)), a.material.opacity = h * g.env.night;
    }
  }
};
var Xk = new y(0, 1, 0);
function Au(B) {
  let A = new vI(B), I = () => new y(A.range(-1, 1), A.range(-1, 1), A.range(-1, 1)).normalize(), g = [];
  for (let Q = 0; Q < 52; Q++) {
    let i = I().multiplyScalar(A.range(0.55, 1)), E = I().multiplyScalar(A.range(0.55, 1)), t = i.clone().add(E).multiplyScalar(A.range(0.15, 0.6)).add(I().multiplyScalar(0.15));
    g.push(Vg([i, t, E], () => 0.012, 3));
  }
  let C = Wg(g.map((Q) => Q.index ? Q.toNonIndexed() : Q));
  return C.computeVertexNormals(), C;
}
function Iu(B) {
  let A = new WA(), I = new cA(new ug(1, 10, 8), B);
  I.scale.set(0.13, 0.11, 0.38);
  let g = new cA(new ug(0.065, 8, 6), new oI({ color: 9067082, roughness: 0.8 }));
  g.position.set(0, 0.04, 0.4);
  let C = new cA(new PB(0.02, 0.07, 5), new oI({ color: 13154448, roughness: 0.6 }));
  C.rotation.x = Math.PI / 2, C.position.set(0, 0.03, 0.48);
  let Q = new cA(new PB(0.14, 0.3, 4, 1, true), B);
  Q.rotation.x = -Math.PI / 2, Q.scale.set(1, 1, 0.18), Q.position.set(0, 0, -0.45), A.add(I, g, C, Q);
  let i = new Zg();
  i.moveTo(0, 0.14), i.lineTo(0.55, 0.16);
  for (let s = 0; s < 5; s++) {
    let a = 0.62 + s * 0.07;
    i.lineTo(a + 0.05, 0.12 - s * 0.05), i.lineTo(a, 0.02 - s * 0.05);
  }
  i.lineTo(0.7, -0.22), i.lineTo(0, -0.12);
  let E = new aQ(i);
  E.rotateX(Math.PI / 2);
  let t = (s) => {
    let a = new WA(), n = new cA(E, B);
    return n.scale.set(s * 1.6, 1, 1), a.add(n), a.position.set(s * 0.08, 0.03, 0.05), A.add(a), a;
  }, o = t(1), e = t(-1);
  return A.traverse((s) => {
    s.isMesh && (s.castShadow = true);
  }), { obj: A, wl: o, wr: e };
}
var hh = class {
  constructor(A) {
    this.g = A;
    this.group.name = "ambient", this.weedGeos = [1, 2, 3].map(Au);
    for (let I = 0; I < 4; I++) {
      let { obj: g, wl: C, wr: Q } = Iu(this.birdMat);
      g.visible = false, this.group.add(g), this.birds.push({ obj: g, wl: C, wr: Q, th: Math.random() * 6.28, rad: 18 + Math.random() * 20, w: 0, h: 45 + Math.random() * 35, flapT: 0, phase: Math.random() * 6 });
    }
  }
  g;
  group = new WA();
  devils = [];
  weeds = [];
  birds = [];
  birdCentre = new y();
  rng = new vI(4242);
  devilT = 20;
  weedT = 4;
  starT = 8;
  lastLightning = 0;
  weedGeos;
  weedMat = new oI({ color: 11045468, roughness: 1, side: OI });
  birdMat = new oI({ color: 1972244, roughness: 0.9, side: OI });
  ground(A, I) {
    let g = this.g;
    return g.world.fn.height(A + g.physics.originX, I + g.physics.originZ);
  }
  shift(A, I) {
    for (let g of this.devils) g.p.x -= A, g.p.z -= I;
    for (let g of this.weeds) g.obj.position.x -= A, g.obj.position.z -= I;
    this.birdCentre.x -= A, this.birdCentre.z -= I;
  }
  update(A) {
    let I = this.g, g = I.env, C = I.player.camera.position, Q = 1 - g.night, i = g.cur.rain < 0.15, E = g.wind.length();
    this.updateDevils(A, C, Q > 0.8 && i && g.sunElevation > 18), this.updateWeeds(A, C, i && E > 1.2 && !I.insideBuilding), this.updateBirds(A, C, Q > 0.6 && g.cur.rain < 0.3 && g.cur.sand < 0.5), this.updateSky(A, C), this.updateMoths(A), this.updateRain(A, C);
  }
  updateDevils(A, I, g) {
    let C = this.g;
    if (this.devilT -= A, g && this.devilT <= 0 && this.devils.length < 2) {
      this.devilT = 25 + this.rng.next() * 50;
      let E = this.rng.next() * Math.PI * 2, t = 45 + this.rng.next() * 90, o = new y(I.x + Math.cos(E) * t, 0, I.z + Math.sin(E) * t);
      C.world.fn.onRoad(o.x + C.physics.originX, o.z + C.physics.originZ, 4) || this.devils.push({ p: o, v: new y(), age: 0, life: 18 + this.rng.next() * 25, h: 9 + this.rng.next() * 12, spin: (this.rng.chance(0.5) ? 1 : -1) * (5 + this.rng.next() * 4), acc: 0 });
    }
    let Q = new y(), i = new y();
    for (let E of [...this.devils]) {
      if (E.age += A, E.age > E.life || E.p.distanceTo(I) > 260) {
        this.devils.splice(this.devils.indexOf(E), 1);
        continue;
      }
      E.v.x = KI(E.v.x, C.env.wind.x * 0.7 + Math.sin(E.age * 0.3 + E.spin) * 2, 0.5, A), E.v.z = KI(E.v.z, C.env.wind.z * 0.7 + Math.cos(E.age * 0.23) * 2, 0.5, A), E.p.addScaledVector(E.v, A), E.p.y = this.ground(E.p.x, E.p.z);
      let t = Math.min(1, E.age / 3, (E.life - E.age) / 4);
      for (E.acc += A * 150 * t; E.acc > 1; ) {
        E.acc -= 1;
        let o = Math.pow(Math.random(), 1.8) * E.h, e = Math.random() * Math.PI * 2, s = 0.35 + o * 0.16;
        Q.set(E.p.x + Math.cos(e) * s, E.p.y + o, E.p.z + Math.sin(e) * s);
        let a = E.spin * 0.35 * (1 + o * 0.04);
        i.set(-Math.sin(e) * a, 1.2 + o * 0.06, Math.cos(e) * a).add(E.v);
        let n = o / E.h;
        C.fx.dust.emit({ pos: Q, vel: i, count: 1, spread: 0.25, life: [0.7, 1.5], size: [0.45 + o * 0.1, 0.9 + o * 0.16], grow: 0.6, color: n < 0.12 ? 10254934 : 12886138, alpha: (0.55 - n * 0.35) * t, drag: 1.6, grav: -0.05 });
      }
      Math.random() < A * 14 * t && C.fx.dust.emit({ pos: E.p.clone().add(new y(0, 0.3, 0)), vel: E.v.clone().add(new y(0, 0.5, 0)), count: 1, spread: 3.5, life: [1, 2], size: [1.2, 2.2], grow: 1, color: 12557428, alpha: 0.28 * t, drag: 1.2 }), Math.random() < A * 25 * t && C.fx.dust.emit({ pos: E.p.clone().add(new y(0, 0.2, 0)), vel: E.v.clone().add(new y(0, 2.5, 0)), count: 2, spread: 3, life: [0.6, 1.4], size: [0.04, 0.09], grow: 0, color: 5915696, alpha: 0.85 * t, drag: 0.5, grav: 4 });
    }
  }
  updateWeeds(A, I, g) {
    let C = this.g, Q = C.env.wind;
    if (this.weedT -= A, g && this.weedT <= 0 && this.weeds.length < 3) {
      this.weedT = 6 + this.rng.next() * 14;
      let E = Q.clone().setY(0).normalize(), t = new y(-E.z, 0, E.x), o = I.clone().addScaledVector(E, -(35 + this.rng.next() * 30)).addScaledVector(t, (this.rng.next() - 0.5) * 60), e = 0.3 + this.rng.next() * 0.25, s = new cA(this.rng.pick(this.weedGeos), this.weedMat);
      s.scale.setScalar(e), s.castShadow = true, o.y = this.ground(o.x, o.z) + e, s.position.copy(o), this.group.add(s), this.weeds.push({ obj: s, v: new y(), r: e, hopT: 0, rayT: 0 });
    }
    let i = new y();
    for (let E of [...this.weeds]) {
      let t = E.obj.position;
      if (t.distanceTo(I) > 150) {
        this.group.remove(E.obj), this.weeds.splice(this.weeds.indexOf(E), 1);
        continue;
      }
      let o = 0.75 + Math.sin(C.time * 1.3 + E.r * 20) * 0.35;
      if (E.v.x = KI(E.v.x, Q.x * o, 1.2, A), E.v.z = KI(E.v.z, Q.z * o, 1.2, A), E.v.y -= 9.8 * A, E.rayT -= A, E.rayT <= 0) {
        E.rayT = 0.12;
        let a = E.v.clone().setY(0), n = a.length();
        if (n > 0.2) {
          let r = C.physics.castRay(t, a.divideScalar(n), E.r + n * 0.15 + 0.1, AC(65535, QI.STATIC | QI.CAR | QI.HEAVY));
          r && C.physics.ownerOf(r.collider)?.kind !== "terrain" && (E.v.x *= -0.6, E.v.z *= -0.6);
        }
      }
      t.addScaledVector(E.v, A);
      let e = this.ground(t.x, t.z) + E.r * 0.92;
      t.y < e && (t.y = e, E.v.y = E.v.y < -1.2 ? -E.v.y * 0.45 : 0, E.hopT -= A, E.hopT <= 0 && (E.hopT = 0.4 + Math.random() * 1.2, E.v.y = 1.5 + Math.random() * 2.5));
      let s = Math.hypot(E.v.x, E.v.z);
      s > 0.01 && (i.set(E.v.z, 0, -E.v.x).normalize(), E.obj.rotateOnWorldAxis(i, s * A / E.r));
    }
  }
  updateBirds(A, I, g) {
    let C = this.g;
    if (this.birdCentre.distanceTo(I) > 220 || this.birdCentre.lengthSq() === 0) {
      let i = this.rng.next() * Math.PI * 2;
      this.birdCentre.set(I.x + Math.cos(i) * 90, 0, I.z + Math.sin(i) * 90);
    }
    this.birdCentre.addScaledVector(C.env.wind, A * 0.15);
    let Q = this.ground(this.birdCentre.x, this.birdCentre.z);
    for (let i of this.birds) {
      if (i.w = KI(i.w, g ? 1 : 0, 0.3, A), i.obj.visible = i.w > 0.02, !i.obj.visible) continue;
      let E = 9;
      i.th += E / i.rad * A;
      let t = Q + i.h + Math.sin(i.th * 0.7 + i.phase) * 4 + (1 - i.w) * 120;
      i.obj.position.set(this.birdCentre.x + Math.cos(i.th) * i.rad, t, this.birdCentre.z + Math.sin(i.th) * i.rad);
      let o = Math.atan2(-Math.sin(i.th), Math.cos(i.th));
      i.obj.rotation.set(0, o, 0, "YZX"), i.obj.rotateZ(-0.35), i.flapT -= A, i.flapT < -8 - i.phase && (i.flapT = 1.4);
      let e = i.flapT > 0 ? Math.sin(C.time * 11) * 0.7 : 0.08 + Math.sin(C.time * 0.8 + i.phase) * 0.04;
      i.wl.rotation.z = e, i.wr.rotation.z = -e;
    }
  }
  updateSky(A, I) {
    let g = this.g, C = g.env;
    if (this.starT -= A, this.starT <= 0 && (this.starT = 10 + this.rng.next() * 30, C.night > 0.75 && C.cur.cloud < 0.5 && C.cur.rain < 0.05)) {
      let Q = this.rng.next() * Math.PI * 2, i = 0.5 + this.rng.next() * 0.6, E = new y(Math.cos(Q) * Math.cos(i), Math.sin(i), Math.sin(Q) * Math.cos(i)), t = new y().crossVectors(E, Xk).normalize().multiplyScalar(this.rng.chance(0.5) ? 1 : -1).addScaledVector(Xk, -0.5).normalize(), o = 1500, e = 0.6 + this.rng.next() * 0.7, s = 0.45 + this.rng.next() * 0.3, a = 0;
      g.fx.ribbons.add({ pts: [new y(), new y(), new y(), new y()], width: 4, color: new nA(0.8, 0.88, 1).multiplyScalar(2.2), life: e, max: e, trail: true, step: (n, r) => {
        a += r;
        let c = g.player.camera.position;
        n.pts.forEach((h, D) => {
          let l = Math.max(0, a - (3 - D) * 0.06);
          h.copy(E).addScaledVector(t, l * s).normalize().multiplyScalar(o).add(c);
        });
      } });
    }
    if (C.lightning > 0.9 && this.lastLightning < 0.5) {
      let Q = new y(0, 0, -1).applyQuaternion(g.player.camera.quaternion), i = this.rng.chance(0.7) ? Math.atan2(Q.z, Q.x) + (this.rng.next() - 0.5) * 1.8 : this.rng.next() * Math.PI * 2, E = 500 + this.rng.next() * 900, t = new y(I.x + Math.cos(i) * E, 0, I.z + Math.sin(i) * E);
      t.y = this.ground(t.x, t.z);
      let o = t.clone().add(new y((this.rng.next() - 0.5) * 200, 650, (this.rng.next() - 0.5) * 200)), e = (n, r, c, h) => {
        if (h === 0) return [n, r];
        let D = n.clone().lerp(r, 0.5).add(new y((Math.random() - 0.5) * c, (Math.random() - 0.5) * c * 0.3, (Math.random() - 0.5) * c));
        return [...e(n, D, c * 0.55, h - 1).slice(0, -1), ...e(D, r, c * 0.55, h - 1)];
      }, s = e(o, t, 160, 6), a = new nA(0.75, 0.82, 1).multiplyScalar(3);
      g.fx.ribbons.add({ pts: s, width: 7, color: a, life: 0.45, max: 0.45, flicker: true });
      for (let n = 0; n < 3; n++) {
        let r = s[8 + Math.floor(Math.random() * 30)], c = r.clone().add(new y((Math.random() - 0.5) * 260, -120 - Math.random() * 200, (Math.random() - 0.5) * 260));
        g.fx.ribbons.add({ pts: e(r, c, 70, 4), width: 3.5, color: a, life: 0.3, max: 0.3, flicker: true });
      }
    }
    this.lastLightning = C.lightning;
  }
  updateMoths(A) {
    let I = this.g;
    if (!(I.env.night < 0.4)) for (let g of I.worldgen.lightPool) {
      if (g.intensity <= 0 || Math.random() > A * 14) continue;
      let C = g.position.clone().add(new y((Math.random() - 0.5) * 1.2, (Math.random() - 0.3) * 0.9, (Math.random() - 0.5) * 1.2));
      I.fx.glow.emit({ pos: C, count: 1, spread: 1.6, life: [0.25, 0.7], size: [0.02, 0.035], grow: 0, color: 16773312, alpha: 0.9, drag: 3 });
    }
  }
  updateRain(A, I) {
    let g = this.g, C = g.env.cur.rain;
    if (C < 0.2 || g.insideBuilding) return;
    let Q = C * A * 140;
    for (let i = 0; i < Q; i++) {
      let E = Math.random() * Math.PI * 2, t = 1.5 + Math.random() * 11, o = new y(I.x + Math.cos(E) * t, 0, I.z + Math.sin(E) * t);
      o.y = this.ground(o.x, o.z) + 0.02, g.fx.dust.emit({ pos: o, vel: new y(0, 1.1, 0), count: 2, spread: 1.1, life: [0.18, 0.32], size: [0.03, 0.07], grow: 0.3, color: 13161692, alpha: 0.5 * yI(C, 0, 1), drag: 1, grav: 7 });
    }
  }
};
function gu(B, A, I, g) {
  let [C, Q, i] = B, E = A[0] - C, t = A[1] - Q, o = A[2] - i, e = E * E + t * t + o * o;
  if (e < 1e-10) return (c, h, D) => Math.hypot(c - C, h - Q, D - i) - I;
  let s = I - g, a = e - s * s, n = 1 / e, r = Math.sign(s) * s * s;
  return (c, h, D) => {
    let l = c - C, U = h - Q, S = D - i, k = l * E + U * t + S * o, K = k - e, G = l * e - E * k, M = U * e - t * k, p = S * e - o * k, d = G * G + M * M + p * p, R = k * k * e, u = K * K * e, q = r * d;
    return Math.sign(K) * a * u > q ? Math.sqrt(d + u) * n - g : Math.sign(k) * a * R < q ? Math.sqrt(d + R) * n - I : (Math.sqrt(d * a * n) + k * s) * n - I;
  };
}
function Cu(B, A) {
  if (!A) return (g, C, Q, i) => {
    i[0] = g - B[0], i[1] = C - B[1], i[2] = Q - B[2];
  };
  let I = new TA().makeRotationFromEuler(new $I(A[0], A[1], A[2])).invert().elements;
  return (g, C, Q, i) => {
    let E = g - B[0], t = C - B[1], o = Q - B[2];
    i[0] = I[0] * E + I[4] * t + I[8] * o, i[1] = I[1] * E + I[5] * t + I[9] * o, i[2] = I[2] * E + I[6] * t + I[10] * o;
  };
}
function Bu(B) {
  let A = [0, 0, 0];
  if (B.t === "cap") {
    let Q = B.r ?? 0.05, i = B.r2 ?? Q;
    return { d: gu(B.a, B.b ?? B.a, Q, i), ext: Math.max(Q, i) };
  }
  let I = Cu(B.a, B.rot);
  if (B.t === "ell") {
    let [Q, i, E] = B.s, t = Math.min(Q, i, E);
    return { ext: Math.max(Q, i, E), d: (o, e, s) => {
      I(o, e, s, A);
      let a = Math.hypot(A[0] / Q, A[1] / i, A[2] / E), n = Math.hypot(A[0] / (Q * Q), A[1] / (i * i), A[2] / (E * E));
      return n < 1e-9 ? -t : a * (a - 1) / n;
    } };
  }
  if (B.t === "box") {
    let [Q, i, E] = B.s, t = B.r ?? 0;
    return { ext: Math.hypot(Q, i, E), d: (o, e, s) => {
      I(o, e, s, A);
      let a = Math.abs(A[0]) - Q + t, n = Math.abs(A[1]) - i + t, r = Math.abs(A[2]) - E + t;
      return Math.hypot(Math.max(a, 0), Math.max(n, 0), Math.max(r, 0)) + Math.min(Math.max(a, n, r), 0) - t;
    } };
  }
  let g = B.r ?? 0.1, C = B.r2 ?? 0.02;
  return { ext: g + C, d: (Q, i, E) => (I(Q, i, E, A), Math.hypot(Math.hypot(A[0], A[2]) - g, A[1]) - C) };
}
function zk(B) {
  let A = Bu(B), I = A.d;
  if (B.shell) {
    let t = I, o = B.shell;
    I = (e, s, a) => Math.abs(t(e, s, a)) - o;
  }
  if (B.cut) {
    let t = I, [o, e] = B.cut;
    I = (s, a, n) => Math.max(t(s, a, n), o[0] * s + o[1] * a + o[2] * n - e);
  }
  let g = B.k ?? 0.02, C = B.noise ?? 0, Q = (B.shell ?? 0) + C + 1e-3, i, E;
  if (B.t === "cap") {
    let t = B.b ?? B.a, o = A.ext + Q;
    i = [Math.min(B.a[0], t[0]) - o, Math.min(B.a[1], t[1]) - o, Math.min(B.a[2], t[2]) - o], E = [Math.max(B.a[0], t[0]) + o, Math.max(B.a[1], t[1]) + o, Math.max(B.a[2], t[2]) + o];
  } else {
    let t = A.ext + Q;
    i = [B.a[0] - t, B.a[1] - t, B.a[2] - t], E = [B.a[0] + t, B.a[1] + t, B.a[2] + t];
  }
  return { p: B, d: I, lo: i, hi: E, k: g, noise: C, sub: B.op === "sub", col: new nA(B.col ?? 8947848), mask: B.mask ?? [0, 0, 0], bone: B.bone ?? 0 };
}
function ri(B, A, I) {
  let g = Math.imul(B, 374761393) ^ Math.imul(A, 668265263) ^ Math.imul(I, 1274126177);
  return g = Math.imul(g ^ g >>> 13, 1274126177), ((g ^ g >>> 16) >>> 0) / 4294967296;
}
function $k(B, A, I) {
  let g = Math.floor(B), C = Math.floor(A), Q = Math.floor(I), i = B - g, E = A - C, t = I - Q, o = i * i * (3 - 2 * i), e = E * E * (3 - 2 * E), s = t * t * (3 - 2 * t), a = (D, l, U) => D + (l - D) * U, n = a(ri(g, C, Q), ri(g + 1, C, Q), o), r = a(ri(g, C + 1, Q), ri(g + 1, C + 1, Q), o), c = a(ri(g, C, Q + 1), ri(g + 1, C, Q + 1), o), h = a(ri(g, C + 1, Q + 1), ri(g + 1, C + 1, Q + 1), o);
  return a(a(n, r, e), a(c, h, e), s) * 2 - 1;
}
function Qu(B, A, I, g) {
  return $k(B * g, A * g * 0.55, I * g) * 0.7 + $k(B * g * 2.3 + 7.1, A * g * 1.6, I * g * 2.3) * 0.3;
}
var AM = (B, A, I) => {
  if (I <= 0) return Math.min(B, A);
  let g = Math.max(I - Math.abs(B - A), 0) / I;
  return Math.min(B, A) - g * g * I * 0.25;
}, gE = class {
  constructor(A, I = 14) {
    this.noiseFreq = I;
    this.prims = A.filter((g) => g.op !== "paint").map(zk), this.paints = A.filter((g) => g.op === "paint").map(zk);
  }
  noiseFreq;
  prims;
  paints;
  eval(A, I, g, C = this.prims) {
    let Q = 1e9, i = NaN;
    for (let E of C) {
      let t = Math.max(E.lo[0] - A, 0, A - E.hi[0]), o = Math.max(E.lo[1] - I, 0, I - E.hi[1]), e = Math.max(E.lo[2] - g, 0, g - E.hi[2]), s = t || o || e ? Math.sqrt(t * t + o * o + e * e) : -1e9;
      if (E.sub ? s >= E.k - Q : s >= Q + E.k) continue;
      let a = E.d(A, I, g);
      E.noise && (i !== i && (i = Qu(A, I, g, this.noiseFreq)), a += E.noise * i), Q = E.sub ? -AM(-Q, a, E.k) : AM(Q, a, E.k);
    }
    return Q;
  }
  grad(A, I, g, C, Q) {
    Q[0] = this.eval(A + C, I, g) - this.eval(A - C, I, g), Q[1] = this.eval(A, I + C, g) - this.eval(A, I - C, g), Q[2] = this.eval(A, I, g + C) - this.eval(A, I, g - C);
    let i = Math.hypot(Q[0], Q[1], Q[2]) || 1;
    return Q[0] /= i, Q[1] /= i, Q[2] /= i, i / (2 * C);
  }
  build(A, I, g, C = 0, Q = {}) {
    let i = Math.ceil((I[0] - A[0]) / g) + 1, E = Math.ceil((I[1] - A[1]) / g) + 1, t = Math.ceil((I[2] - A[2]) / g) + 1, o = new Float32Array(i * E * t), e = (_, gA, DA) => _ + i * (gA + E * DA), s = 0, a = 0;
    for (let _ of this.prims) s = Math.max(s, _.k), a = Math.max(a, _.noise);
    let n = g * 2.5 + s + a;
    for (let _ = 0; _ < t; _++) {
      let gA = A[2] + _ * g;
      for (let DA = 0; DA < E; DA++) {
        let dA = A[1] + DA * g, zA = this.prims.filter((X) => X.lo[1] - n <= dA && dA <= X.hi[1] + n && X.lo[2] - n <= gA && gA <= X.hi[2] + n);
        for (let X = 0; X < i; X++) o[e(X, DA, _)] = zA.length ? this.eval(A[0] + X * g, dA, gA, zA) : 1e9;
      }
    }
    let r = new Int32Array(i * E * t).fill(-1), c = [], h = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]], D = new Float32Array(8);
    for (let _ = 0; _ < t - 1; _++) for (let gA = 0; gA < E - 1; gA++) for (let DA = 0; DA < i - 1; DA++) {
      let dA = 0;
      for (let MA = 0; MA < 8; MA++) D[MA] = o[e(DA + (MA & 1), gA + (MA >> 1 & 1), _ + (MA >> 2 & 1))], D[MA] < 0 && dA++;
      if (dA === 0 || dA === 8) continue;
      let zA = 0, X = 0, BA = 0, tA = 0;
      for (let [MA, KA] of h) {
        let LA = D[MA], hI = D[KA];
        if (LA < 0 == hI < 0) continue;
        let sA = LA / (LA - hI);
        zA += (MA & 1) + ((KA & 1) - (MA & 1)) * sA, X += (MA >> 1 & 1) + ((KA >> 1 & 1) - (MA >> 1 & 1)) * sA, BA += (MA >> 2 & 1) + ((KA >> 2 & 1) - (MA >> 2 & 1)) * sA, tA++;
      }
      r[e(DA, gA, _)] = c.length / 3, c.push(A[0] + (DA + zA / tA) * g, A[1] + (gA + X / tA) * g, A[2] + (_ + BA / tA) * g);
    }
    let l = [], U = (_, gA, DA, dA) => {
      _ < 0 || gA < 0 || DA < 0 || dA < 0 || l.push(_, gA, DA, _, DA, dA);
    };
    for (let _ = 1; _ < t - 1; _++) for (let gA = 1; gA < E - 1; gA++) for (let DA = 1; DA < i - 1; DA++) {
      let dA = o[e(DA, gA, _)] < 0;
      dA !== o[e(DA + 1, gA, _)] < 0 && U(r[e(DA, gA - 1, _ - 1)], r[e(DA, gA, _ - 1)], r[e(DA, gA, _)], r[e(DA, gA - 1, _)]), dA !== o[e(DA, gA + 1, _)] < 0 && U(r[e(DA - 1, gA, _ - 1)], r[e(DA, gA, _ - 1)], r[e(DA, gA, _)], r[e(DA - 1, gA, _)]), dA !== o[e(DA, gA, _ + 1)] < 0 && U(r[e(DA - 1, gA - 1, _)], r[e(DA, gA - 1, _)], r[e(DA, gA, _)], r[e(DA - 1, gA, _)]);
    }
    let S = c.length / 3, k = new Float32Array(S * 3), K = [0, 0, 0], G = g * 0.35;
    for (let _ = 0; _ < S; _++) {
      let gA = c[_ * 3], DA = c[_ * 3 + 1], dA = c[_ * 3 + 2];
      for (let zA = 0; zA < 2; zA++) {
        let X = this.eval(gA, DA, dA), BA = this.grad(gA, DA, dA, G, K), tA = Math.max(-g * 0.5, Math.min(g * 0.5, X / Math.max(BA, 0.2)));
        gA -= K[0] * tA, DA -= K[1] * tA, dA -= K[2] * tA;
      }
      this.grad(gA, DA, dA, G, K), c[_ * 3] = gA, c[_ * 3 + 1] = DA, c[_ * 3 + 2] = dA, k[_ * 3] = K[0], k[_ * 3 + 1] = K[1], k[_ * 3 + 2] = K[2];
    }
    let M = [], p = (_, gA) => (c[_ * 3] - c[gA * 3]) ** 2 + (c[_ * 3 + 1] - c[gA * 3 + 1]) ** 2 + (c[_ * 3 + 2] - c[gA * 3 + 2]) ** 2, d = (_, gA, DA) => {
      let dA = c[gA * 3] - c[_ * 3], zA = c[gA * 3 + 1] - c[_ * 3 + 1], X = c[gA * 3 + 2] - c[_ * 3 + 2], BA = c[DA * 3] - c[_ * 3], tA = c[DA * 3 + 1] - c[_ * 3 + 1], MA = c[DA * 3 + 2] - c[_ * 3 + 2], KA = zA * MA - X * tA, LA = X * BA - dA * MA, hI = dA * tA - zA * BA, sA = k[_ * 3] + k[gA * 3] + k[DA * 3], lA = k[_ * 3 + 1] + k[gA * 3 + 1] + k[DA * 3 + 1], SA = k[_ * 3 + 2] + k[gA * 3 + 2] + k[DA * 3 + 2];
      KA * sA + LA * lA + hI * SA < 0 ? M.push(_, DA, gA) : M.push(_, gA, DA);
    };
    for (let _ = 0; _ < l.length; _ += 6) {
      let gA = l[_], DA = l[_ + 1], dA = l[_ + 2], zA = l[_ + 5];
      p(gA, dA) <= p(DA, zA) ? (d(gA, DA, dA), d(gA, dA, zA)) : (d(gA, DA, zA), d(DA, dA, zA));
    }
    let R = new Float32Array(S * 3), u = new Float32Array(S * 3), q = new Uint16Array(S * 4), L = new Float32Array(S * 4), b = Q.ao ?? 1, W = Q.colorSoft ?? 5e-3, j = Q.boneSoft ?? 0.03, oA = new Float32Array(this.prims.length), H = new Float32Array(Math.max(1, C)), O = new nA();
    for (let _ = 0; _ < S; _++) {
      let gA = c[_ * 3], DA = c[_ * 3 + 1], dA = c[_ * 3 + 2], zA = k[_ * 3], X = k[_ * 3 + 1], BA = k[_ * 3 + 2], tA = 0;
      for (let GA = 1; GA <= 4; GA++) {
        let pA = 0.01 * GA * GA;
        tA += (pA - Math.max(0, this.eval(gA + zA * pA, DA + X * pA, dA + BA * pA))) / (pA * 2 ** GA);
      }
      let MA = Ai.clamp(1 - tA * 1.6 * b, 0.28, 1), KA = 1e9;
      for (let GA = 0; GA < this.prims.length; GA++) {
        let pA = this.prims[GA];
        oA[GA] = pA.sub ? 1e9 : Math.abs(pA.d(gA, DA, dA)), oA[GA] < KA && (KA = oA[GA]);
      }
      let LA = 0, hI = 0, sA = 0, lA = 0, SA = 0, wA = 0, JA = 0;
      H.fill(0);
      for (let GA = 0; GA < this.prims.length; GA++) {
        if (oA[GA] > 1e8) continue;
        let pA = this.prims[GA], vA = Math.exp(-(oA[GA] - KA) / W);
        LA += vA, hI += pA.col.r * vA, sA += pA.col.g * vA, lA += pA.col.b * vA, SA += pA.mask[0] * vA, wA += pA.mask[1] * vA, JA += pA.mask[2] * vA, C && (H[pA.bone] += Math.exp(-(oA[GA] - KA) / j));
      }
      hI /= LA, sA /= LA, lA /= LA, SA /= LA, wA /= LA, JA /= LA;
      for (let GA of this.paints) {
        let pA = GA.p.soft ?? 4e-3, vA = GA.d(gA, DA, dA);
        if (vA > pA) continue;
        let II = Ai.smoothstep(pA - vA, 0, 2 * pA);
        O.copy(GA.col), hI += (O.r - hI) * II, sA += (O.g - sA) * II, lA += (O.b - lA) * II, GA.p.mask && (SA += (GA.mask[0] - SA) * II, wA += (GA.mask[1] - wA) * II, JA += (GA.mask[2] - JA) * II);
      }
      if (R[_ * 3] = hI * MA, R[_ * 3 + 1] = sA * MA, R[_ * 3 + 2] = lA * MA, u[_ * 3] = SA, u[_ * 3 + 1] = wA, u[_ * 3 + 2] = JA, C) {
        let GA = 0;
        for (let pA = 0; pA < 4; pA++) {
          let vA = -1, II = 0;
          for (let T = 0; T < C; T++) H[T] > II && (II = H[T], vA = T);
          if (vA < 0 || pA > 0 && II < 0.02 * GA) break;
          q[_ * 4 + pA] = vA, L[_ * 4 + pA] = II, GA += II, H[vA] = 0;
        }
        for (let pA = 0; pA < 4; pA++) L[_ * 4 + pA] /= GA || 1;
      }
    }
    let IA = new SI();
    return IA.setAttribute("position", new XA(c, 3)), IA.setAttribute("normal", new GI(k, 3)), IA.setAttribute("color", new GI(R, 3)), IA.setAttribute("aMask", new GI(u, 3)), C && (IA.setAttribute("skinIndex", new Mi(q, 4)), IA.setAttribute("skinWeight", new XA(L, 4))), IA.setIndex(M), IA.computeBoundingSphere(), IA;
  }
};
function gM(B, A, I, g, C, Q) {
  let i = new oI({ vertexColors: true, roughness: C, metalness: 0 });
  return i.onBeforeCompile = (E) => {
    E.uniforms.uDetail = { value: B }, E.uniforms.uDetailScale = { value: A }, E.uniforms.uBump = { value: I }, E.uniforms.uDetailAlb = { value: g }, E.uniforms.uTint0 = { value: Q[0] }, E.uniforms.uTint1 = { value: Q[1] }, E.uniforms.uTint2 = { value: Q[2] }, E.vertexShader = E.vertexShader.replace("#include <common>", `#include <common>
attribute vec3 aMask;
varying vec3 vMask;
varying vec3 vRest;
varying vec3 vRestN;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vMask = aMask; vRest = position; vRestN = normal;`), E.fragmentShader = E.fragmentShader.replace("#include <common>", `#include <common>
        uniform sampler2D uDetail; uniform float uDetailScale; uniform float uBump; uniform float uDetailAlb;
        uniform vec3 uTint0; uniform vec3 uTint1; uniform vec3 uTint2;
        varying vec3 vMask; varying vec3 vRest; varying vec3 vRestN;
        float detailH(vec3 p, vec3 n) {
          vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x + w.y + w.z + 1e-4);
          vec3 q = p * uDetailScale;
          return dot(texture2D(uDetail, q.zy).rgb, vec3(0.333)) * w.x + dot(texture2D(uDetail, q.xz).rgb, vec3(0.333)) * w.y
            + dot(texture2D(uDetail, q.xy).rgb, vec3(0.333)) * w.z;
        }
        vec3 perturbDetail(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float fd) {
          vec3 sx = dFdx(surf_pos), sy = dFdy(surf_pos);
          vec3 r1 = cross(sy, surf_norm), r2 = cross(surf_norm, sx);
          float det = dot(sx, r1) * fd;
          vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
          return normalize(abs(det) * surf_norm - grad);
        }`).replace("#include <color_fragment>", `#include <color_fragment>
        float hDet = detailH(vRest, vRestN);
        diffuseColor.rgb *= mix(vec3(1.0), uTint0, vMask.r) * mix(vec3(1.0), uTint1, vMask.g) * mix(vec3(1.0), uTint2, vMask.b);
        diffuseColor.rgb *= 1.0 + uDetailAlb * (hDet - 0.5);`).replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
roughnessFactor *= 0.9 + 0.2 * hDet;`).replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
normal = perturbDetail(-vViewPosition, normal, vec2(dFdx(hDet), dFdy(hDet)) * uBump, faceDirection);`);
  }, i.customProgramCacheKey = () => "creature", i;
}
function iu(B) {
  let A = B.map((I) => Object.assign(new PQ(), { name: I.name }));
  return B.forEach((I, g) => {
    let C = I.parent >= 0 ? B[I.parent].pos : [0, 0, 0];
    A[g].position.set(I.pos[0] - C[0], I.pos[1] - C[1], I.pos[2] - C[2]), I.parent >= 0 && A[I.parent].add(A[g]);
  }), A;
}
function CM(B, A, I) {
  let g = iu(I), C = new Ui(B, A);
  I.forEach((i, E) => {
    i.parent < 0 && C.add(g[E]);
  }), C.updateMatrixWorld(true), C.bind(new Ki(g)), C.castShadow = true, C.receiveShadow = true, C.frustumCulled = false, C.raycast = () => {
  };
  let Q = {};
  for (let i of g) Q[i.name] = i;
  return { mesh: C, bones: Q };
}
function dQ(B, A, I, g, C, Q = 1, i = 1, E = 1) {
  let t = new cA(A, Eu);
  return t.position.set(I, g, C), t.scale.set(Q, i, E), t.visible = false, B.add(t), t;
}
var Eu = new pC(), RQ = new ug(1, 10, 8), IM = /* @__PURE__ */ new Map();
function BM(B, A) {
  let I = IM.get(B);
  if (!I) {
    let g = performance.now();
    I = A(), IM.set(B, I), globalThis.__DEV_LOG_SDF && console.log(`[sdf] ${B}: ${I.attributes.position.count} verts, ${(performance.now() - g).toFixed(0)} ms`);
  }
  return I;
}
var Nl = [{ name: "hips", parent: -1, pos: [0, 0.95, 0] }, { name: "torso", parent: 0, pos: [0, 1, 0] }, { name: "head", parent: 1, pos: [0, 1.58, 0] }, { name: "arm1", parent: 1, pos: [0.19, 1.47, -0.01] }, { name: "arm-1", parent: 1, pos: [-0.19, 1.47, -0.01] }, { name: "elbow1", parent: 3, pos: [0.25, 1.18, -0.02] }, { name: "elbow-1", parent: 4, pos: [-0.25, 1.18, -0.02] }, { name: "hip1", parent: 0, pos: [0.1, 0.9, 0] }, { name: "hip-1", parent: 0, pos: [-0.1, 0.9, 0] }, { name: "knee1", parent: 7, pos: [0.105, 0.49, 0.015] }, { name: "knee-1", parent: 8, pos: [-0.105, 0.49, 0.015] }], Qg = (B) => Nl.findIndex((A) => A.name === B);
function tu() {
  let a = [1, 0, 0], n = [0, 1, 0], r = [0, 0, 1], c = [];
  c.push({ t: "ell", a: [0, 1.715, -0.012], s: [0.13, 0.148, 0.138], shell: 0.011, col: 6972496, mask: a, bone: Qg("head"), k: 0.02 }), c.push({ t: "ell", a: [0, 1.69, 0.13], s: [0.088, 0.11, 0.095], op: "sub", k: 0.02 }), c.push({ t: "cap", a: [0, 1.63, -0.09], b: [0, 1.48, -0.11], r: 0.1, r2: 0.12, col: 6972496, mask: a, bone: Qg("head"), k: 0.04 });
  for (let h of [1, -1]) {
    let D = Qg("hip" + h), l = Qg("knee" + h), U = Qg("arm" + h), S = Qg("elbow" + h);
    c.push({ t: "cap", a: [h * 0.1, 0.88, 0], b: [h * 0.105, 0.52, 0.012], r: 0.095, r2: 0.07, col: 5064507, mask: n, bone: D, k: 0.03 }), c.push({ t: "box", a: [h * 0.152, 0.66, 0.02], s: [0.022, 0.065, 0.056], r: 0.014, rot: [0, 0, h * 0.06], col: 4472628, mask: n, bone: D, k: 0.01 }), c.push({ t: "ell", a: [h * 0.105, 0.49, 0.025], s: [0.07, 0.075, 0.075], col: 5064507, mask: n, bone: l, k: 0.03 }), c.push({ t: "cap", a: [h * 0.105, 0.47, 0.012], b: [h * 0.1, 0.17, -4e-3], r: 0.068, r2: 0.056, col: 5064507, mask: n, bone: l, k: 0.03 }), c.push({ t: "tor", a: [h * 0.1, 0.19, -2e-3], r: 0.058, r2: 0.017, col: 5064507, mask: n, bone: l, k: 0.015 }), c.push({ t: "cap", a: [h * 0.1, 0.19, -4e-3], b: [h * 0.1, 0.07, 0], r: 0.064, r2: 0.063, col: 3024416, bone: l, k: 0.012 }), c.push({ t: "box", a: [h * 0.1, 0.055, 0.05], s: [0.053, 0.045, 0.118], r: 0.035, rot: [0, h * 0.05, 0], col: 3024416, bone: l, k: 0.03 }), c.push({ t: "ell", a: [h * 0.102, 0.05, 0.14], s: [0.056, 0.044, 0.062], col: 3024416, bone: l, k: 0.03 }), c.push({ t: "box", a: [h * 0.1, 0.012, 0.05], s: [0.059, 0.012, 0.138], r: 8e-3, rot: [0, h * 0.05, 0], col: 1578258, bone: l, k: 4e-3 }), c.push({ t: "ell", a: [h * 0.19, 1.45, -0.01], s: [0.09, 0.085, 0.09], col: 6972496, mask: a, bone: U, k: 0.05 }), c.push({ t: "cap", a: [h * 0.21, 1.43, -0.01], b: [h * 0.25, 1.19, -0.02], r: 0.07, r2: 0.06, col: 6972496, mask: a, bone: U, k: 0.03 }), c.push({ t: "ell", a: [h * 0.25, 1.17, -0.025], s: [0.061, 0.06, 0.063], col: 6972496, mask: a, bone: S, k: 0.03 }), c.push({ t: "cap", a: [h * 0.25, 1.16, -0.02], b: [h * 0.27, 0.955, 0.02], r: 0.058, r2: 0.049, col: 6972496, mask: a, bone: S, k: 0.03 }), c.push({ t: "tor", a: [h * 0.27, 0.96, 0.02], r: 0.049, r2: 0.014, rot: [0.2, 0, h * 0.1], col: 5130812, mask: a, bone: S, k: 0.01 });
    for (let [k, K, G] of [[1.235, 0.063, 0], [1.265, 0.066, 0], [1.1, 0.056, 0.1], [1.07, 0.055, 0.1]]) c.push({ t: "tor", a: [h * (0.25 + (1.17 - k) * 0.1), k, -0.02 + (1.17 - k) * 0.15], r: K, r2: 65e-4, rot: [G, 0, h * 0.1], col: 6972496, mask: a, bone: k > 1.17 ? U : S, k: 8e-3 });
    for (let [k, K] of [[0.56, 0.074], [0.53, 0.072], [0.42, 0.066], [0.24, 0.058]]) c.push({ t: "tor", a: [h * 0.104, k, 0.01], r: K, r2: 7e-3, rot: [0.05, 0, 0], col: 5064507, mask: n, bone: k > 0.49 ? D : l, k: 8e-3 });
    c.push({ t: "ell", a: [h * 0.276, 0.885, 0.036], s: [0.034, 0.062, 0.046], rot: [0.2, 0, h * 0.1], col: 2893603, bone: S, k: 0.015 }), c.push({ t: "cap", a: [h * 0.266, 0.912, 0.072], b: [h * 0.256, 0.872, 0.088], r: 0.017, r2: 0.015, col: 2893603, bone: S, k: 8e-3 }), c.push({ t: "box", a: [h * 0.1, 1.27, 0.128], s: [0.055, 0.05, 0.012], r: 0.01, rot: [-0.18, 0, 0], col: 6051396, mask: a, bone: Qg("torso"), k: 6e-3 }), c.push({ t: "box", a: [h * 0.152, 0.925, 0.08], s: [0.036, 0.046, 0.03], r: 0.012, rot: [0, h * 0.55, 0], col: 8023638, mask: r, bone: Qg("hips"), k: 8e-3 }), c.push({ t: "cap", a: [h * 0.12, 1.5, -0.13], b: [h * 0.12, 1.51, 0.06], r: 0.018, col: 3811870, bone: Qg("torso"), k: 6e-3, op: "paint", soft: 0.012 }), c.push({ t: "cap", a: [h * 0.12, 1.51, 0.06], b: [h * 0.11, 1.2, 0.14], r: 0.018, col: 3811870, bone: Qg("torso"), op: "paint", soft: 0.012 }), c.push({ t: "tor", a: [h * 0.044, 1.707, 0.1], r: 0.032, r2: 0.01, rot: [Math.PI / 2 - 0.12, 0, 0], col: 3816502, bone: Qg("head"), k: 5e-3 }), c.push({ t: "ell", a: [h * 0.105, 0.5, 0.075], s: [0.058, 0.07, 0.05], col: 6182470, op: "paint", soft: 6e-3 });
  }
  return c.push({ t: "ell", a: [0, 0.92, 0], s: [0.175, 0.12, 0.125], col: 5064507, mask: n, bone: Qg("hips"), k: 0.04 }), c.push({ t: "ell", a: [0, 0.87, 4e-3], s: [0.195, 0.07, 0.148], col: 6972496, mask: a, bone: Qg("hips"), k: 0.03 }), c.push({ t: "ell", a: [0, 1.08, 0.015], s: [0.172, 0.17, 0.127], col: 6972496, mask: a, bone: Qg("torso"), k: 0.05 }), c.push({ t: "ell", a: [0, 1.3, 5e-3], s: [0.205, 0.2, 0.136], col: 6972496, mask: a, bone: Qg("torso"), k: 0.06 }), c.push({ t: "ell", a: [0, 1.4, -0.045], s: [0.19, 0.12, 0.12], col: 6972496, mask: a, bone: Qg("torso"), k: 0.06 }), c.push({ t: "ell", a: [0, 0.965, 5e-3], s: [0.183, 0.032, 0.138], col: 3811870, bone: Qg("hips"), k: 8e-3 }), c.push({ t: "box", a: [0, 0.965, 0.141], s: [0.03, 0.022, 0.012], r: 4e-3, col: 7237222, bone: Qg("hips"), k: 3e-3 }), c.push({ t: "cap", a: [-0.175, 0.92, 0.01], b: [-0.185, 0.74, 0.03], r: 0.028, r2: 0.022, col: 3811870, bone: Qg("hip-1"), k: 5e-3 }), c.push({ t: "cap", a: [0, 1.5, 0], b: [0, 1.62, 0.015], r: 0.058, col: 9075304, bone: Qg("head"), k: 0.02 }), c.push({ t: "tor", a: [0, 1.545, 5e-3], r: 0.078, r2: 0.04, col: 9075290, bone: Qg("torso"), k: 0.02, noise: 4e-3 }), c.push({ t: "cap", a: [0.05, 1.52, 0.1], b: [0.085, 1.33, 0.155], r: 0.032, r2: 0.022, col: 9075290, bone: Qg("torso"), k: 0.015, noise: 4e-3 }), c.push({ t: "ell", a: [0, 1.705, 5e-3], s: [0.093, 0.112, 0.103], col: 9075304, bone: Qg("head"), k: 0.03 }), c.push({ t: "ell", a: [0, 1.665, 0.078], s: [0.079, 0.086, 0.053], col: 2829609, bone: Qg("head"), k: 0.012 }), c.push({ t: "cap", a: [0, 1.625, 0.11], b: [0, 1.6, 0.142], r: 0.035, r2: 0.03, col: 2829609, bone: Qg("head"), k: 0.02 }), c.push({ t: "cap", a: [0, 1.6, 0.146], b: [0, 1.588, 0.19], r: 0.047, col: 4870208, bone: Qg("head"), k: 4e-3 }), c.push({ t: "tor", a: [0, 1.589, 0.188], r: 0.047, r2: 6e-3, rot: [1.84, 0, 0], col: 7237222, bone: Qg("head"), k: 3e-3 }), c.push({ t: "box", a: [0, 1.705, -0.05], s: [0.15, 0.012, 0.11], col: 3811870, op: "paint", soft: 4e-3 }), c.push({ t: "box", a: [0, 1.28, -0.2], s: [0.14, 0.17, 0.064], r: 0.045, rot: [0.08, 0, 0], col: 8023638, mask: r, bone: Qg("torso"), k: 0.02 }), c.push({ t: "box", a: [0, 1.42, -0.2], s: [0.146, 0.04, 0.071], r: 0.02, rot: [0.08, 0, 0], col: 6708296, mask: r, bone: Qg("torso"), k: 0.01 }), c.push({ t: "cap", a: [-0.17, 1.5, -0.2], b: [0.17, 1.5, -0.2], r: 0.058, col: 5917242, bone: Qg("torso"), k: 0.01, noise: 3e-3 }), c.push({ t: "cap", a: [-0.19, 0.93, -0.02], b: [-0.2, 0.73, -0.03], r: 0.024, r2: 0.014, col: 9075290, bone: Qg("hips"), k: 6e-3, noise: 3e-3 }), c.push({ t: "box", a: [0, 1.18, 0.14], s: [0.011, 0.3, 0.05], col: 5130812, op: "paint", soft: 4e-3 }), c;
}
function QM() {
  return BM("husk", () => new gE(tu(), 13).build([-0.37, -0.02, -0.34], [0.37, 1.9, 0.27], 0.0135, Nl.length));
}
function iM(B, A) {
  let I = (e, s, a) => new nA().setHSL(e, s, 0.5).lerp(new nA(0.5, 0.5, 0.5), 1 - s * 3).multiplyScalar(2 * a), g = [I(A.pick([0.1, 0.16, 0.58, 0.06, 0.3]), A.range(0.05, 0.22), A.range(0.75, 1.15)), I(A.pick([0.08, 0.12, 0.6]), 0.08, A.range(0.8, 1.15)), I(A.pick([0.1, 0.14, 0.3]), 0.12, A.range(0.8, 1.1))], C = gM(B.tex.fabric, 6, 0.08, 0.07, 0.92, g), { mesh: Q, bones: i } = CM(QM(), C, Nl), E = new WA();
  E.add(Q);
  let t = new oI({ color: 1713176, emissive: 8978278, emissiveIntensity: 0.3, roughness: 0.1, metalness: 0.4 }), o = new VA(0.029, 0.029, 8e-3, 18);
  o.rotateX(Math.PI / 2 - 0.12);
  for (let e of [1, -1]) {
    let s = new cA(o, t);
    s.position.set(e * 0.044, 1.707 - 1.58, 0.104), i.head.add(s);
  }
  if (A.chance(0.7)) {
    let e = new cA(new VA(0.017, 0.017, 0.62, 8), B.rust);
    e.position.set(-0.026, -0.417, 0.214), e.rotation.x = 2.23, e.castShadow = true, i["elbow-1"].add(e);
  }
  dQ(i.head, RQ, 0, 0.13, 0.02, 0.13, 0.15, 0.14), dQ(i.torso, RQ, 0, 0.25, -0.02, 0.24, 0.36, 0.2), dQ(i.hips, RQ, 0, -0.03, 0, 0.2, 0.13, 0.15);
  for (let e of ["1", "-1"]) dQ(i["arm" + e], RQ, 0, -0.14, 0, 0.08, 0.18, 0.08), dQ(i["elbow" + e], RQ, 0.01, -0.15, 0.02, 0.07, 0.18, 0.07), dQ(i["hip" + e], RQ, 0, -0.2, 0, 0.1, 0.24, 0.1), dQ(i["knee" + e], RQ, 0, -0.24, 0.03, 0.08, 0.26, 0.11);
  return { root: E, parts: i, eyes: t };
}
var vt = [{ name: "body", parent: -1, pos: [0, 0, 0] }, { name: "head", parent: 0, pos: [0, 0.66, 0.32] }, { name: "ear1", parent: 1, pos: [0.055, 0.88, 0.38] }, { name: "ear-1", parent: 1, pos: [-0.055, 0.88, 0.38] }, { name: "hind1", parent: 0, pos: [0.17, 0.34, -0.28] }, { name: "hind-1", parent: 0, pos: [-0.17, 0.34, -0.28] }, { name: "front1", parent: 0, pos: [0.1, 0.46, 0.28] }, { name: "front-1", parent: 0, pos: [-0.1, 0.46, 0.28] }], sC = (B) => vt.findIndex((A) => A.name === B);
function ou() {
  let E = [1, 0, 0], t = [];
  t.push({ t: "ell", a: [0, 0.44, -0.02], s: [0.2, 0.22, 0.36], col: 9075302, mask: E, bone: sC("body"), k: 0.05, noise: 2e-3 }), t.push({ t: "ell", a: [0, 0.4, -0.26], s: [0.24, 0.26, 0.25], col: 9075302, mask: E, bone: sC("body"), k: 0.06, noise: 2e-3 }), t.push({ t: "ell", a: [0, 0.5, 0.2], s: [0.17, 0.21, 0.18], col: 9075302, mask: E, bone: sC("body"), k: 0.06, noise: 2e-3 }), t.push({ t: "cap", a: [0, 0.6, 0.12], b: [0, 0.6, -0.3], r: 0.07, r2: 0.08, col: 9075302, mask: E, bone: sC("body"), k: 0.09, noise: 2e-3 }), t.push({ t: "cap", a: [0, 0.54, 0.25], b: [0, 0.68, 0.36], r: 0.12, r2: 0.09, col: 9075302, mask: E, bone: sC("head"), k: 0.06, noise: 2e-3 }), t.push({ t: "ell", a: [0, 0.76, 0.42], s: [0.12, 0.13, 0.16], col: 9075302, mask: E, bone: sC("head"), k: 0.04, noise: 15e-4 }), t.push({ t: "ell", a: [0, 0.7, 0.55], s: [0.075, 0.07, 0.08], col: 9075302, mask: E, bone: sC("head"), k: 0.03, noise: 2e-3 }), t.push({ t: "ell", a: [0, 0.725, 0.62], s: [0.026, 0.019, 0.016], col: 4862512, bone: sC("head"), k: 0.01 }), t.push({ t: "ell", a: [0, 0.5, -0.5], s: [0.07, 0.07, 0.06], col: 14209216, bone: sC("body"), k: 0.03, noise: 6e-3 });
  for (let o of [1, -1]) {
    let e = sC("ear" + o), s = sC("hind" + o), a = sC("front" + o);
    t.push({ t: "ell", a: [o * 0.068, 0.705, 0.49], s: [0.065, 0.06, 0.065], col: 9075302, mask: E, bone: sC("head"), k: 0.03, noise: 2e-3 }), t.push({ t: "ell", a: [o * 0.078, 0.815, 0.51], s: [0.05, 0.02, 0.04], rot: [0, 0, -o * 0.5], col: 9075302, mask: E, bone: sC("head"), k: 0.02 }), t.push({ t: "ell", a: [o * 0.055, 1.08, 0.37], s: [0.052, 0.25, 0.022], col: 9075302, mask: E, bone: e, k: 0.035, noise: 2e-3 }), t.push({ t: "ell", a: [o * 0.055, 1.09, 0.39], s: [0.033, 0.215, 0.014], op: "sub", k: 0.01 }), t.push({ t: "ell", a: [o * 0.055, 1.08, 0.388], s: [0.037, 0.222, 0.026], col: 11041906, op: "paint", soft: 6e-3 }), t.push({ t: "ell", a: [o * 0.055, 1.32, 0.37], s: [0.065, 0.06, 0.05], col: 4076588, op: "paint", soft: 0.025 }), t.push({ t: "cap", a: [o * 0.1, 0.46, 0.28], b: [o * 0.105, 0.06, 0.33], r: 0.05, r2: 0.03, col: 9075302, mask: E, bone: a, k: 0.03, noise: 2e-3 }), t.push({ t: "ell", a: [o * 0.105, 0.03, 0.35], s: [0.038, 0.028, 0.055], col: 9075302, mask: E, bone: a, k: 0.02 }), t.push({ t: "ell", a: [o * 0.17, 0.34, -0.26], s: [0.095, 0.19, 0.17], col: 9075302, mask: E, bone: s, k: 0.05, noise: 2e-3 }), t.push({ t: "cap", a: [o * 0.18, 0.22, -0.38], b: [o * 0.18, 0.05, -0.31], r: 0.048, r2: 0.035, col: 9075302, mask: E, bone: s, k: 0.03, noise: 2e-3 }), t.push({ t: "ell", a: [o * 0.18, 0.03, -0.15], s: [0.045, 0.028, 0.18], col: 9075302, mask: E, bone: s, k: 0.03 }), t.push({ t: "ell", a: [o * 0.092, 0.785, 0.515], s: [0.028, 0.024, 0.025], op: "sub", k: 0.01 }), t.push({ t: "ell", a: [o * 0.092, 0.782, 0.515], s: [0.045, 0.04, 0.04], col: 4076588, op: "paint", soft: 0.012 }), t.push({ t: "cap", a: [o * 0.2, 0.52, 0.02], b: [o * 0.19, 0.36, -0.14], r: 0.011, col: 7228484, op: "paint", soft: 6e-3 }), t.push({ t: "ell", a: [o * 0.16, 0.5, -0.33], s: [0.06, 0.05, 0.07], col: 7234130, op: "paint", soft: 0.02 });
  }
  return t.push({ t: "cap", a: [0, 0.695, 0.625], b: [0, 0.665, 0.62], r: 7e-3, op: "sub", k: 7e-3 }), t.push({ t: "cap", a: [0.05, 0.84, 0.47], b: [0.02, 0.8, 0.56], r: 9e-3, col: 7228484, op: "paint", soft: 5e-3 }), t.push({ t: "ell", a: [0, 0.3, 0.02], s: [0.16, 0.11, 0.34], col: 13615786, op: "paint", soft: 0.035 }), t.push({ t: "ell", a: [0, 0.47, 0.35], s: [0.1, 0.13, 0.09], col: 13615786, op: "paint", soft: 0.03 }), t.push({ t: "ell", a: [0, 0.67, 0.56], s: [0.06, 0.04, 0.065], col: 13615786, op: "paint", soft: 0.02 }), t;
}
function EM() {
  return BM("rabbit", () => new gE(ou(), 18).build([-0.3, -0.02, -0.62], [0.3, 1.38, 0.68], 0.0125, vt.length, { boneSoft: 0.035 }));
}
function tM(B, A) {
  let I = A.range(0.75, 1.3), g = [new nA().setHSL(A.range(0.05, 0.1), A.range(0.1, 0.3), 0.5).multiplyScalar(2 * I), new nA(1, 1, 1), new nA(1, 1, 1)], C = gM(B.tex.fur, 3, 0.18, 0.1, 1, g), { mesh: Q, bones: i } = CM(EM(), C, vt), E = new WA();
  E.scale.setScalar(A.range(0.95, 1.2)), E.add(Q);
  let t = vt[sC("head")].pos, o = (l, U, S) => new y(l - t[0], U - t[1], S - t[2]), e = new oI({ color: 1049347, emissive: 10096646, emissiveIntensity: 0.4, roughness: 0.2 }), s = new ug(0.019, 14, 10), a = new uI(0.011, 0.04, 6e-3), n = B.flat("#d9ccaa", 0.35), r = B.flat("#2a2622", 0.7), c = new VA(12e-4, 6e-4, 0.17, 3);
  c.translate(0, 0.085, 0);
  for (let l of [1, -1]) {
    let U = new cA(s, e);
    U.position.copy(o(l * 0.092, 0.785, 0.518)), i.head.add(U);
    let S = new cA(a, n);
    S.position.copy(o(l * 8e-3, 0.662, 0.609)), S.rotation.x = -0.12, i.head.add(S);
    for (let k = 0; k < 3; k++) {
      let K = new cA(c, r);
      K.position.copy(o(l * 0.042, 0.705 - k * 0.011, 0.595)), K.rotation.set(0.25 - k * 0.2, 0, -l * (1.25 + k * 0.12)), i.head.add(K);
    }
  }
  let h = new PB(8e-3, 0.035, 5);
  h.rotateX(Math.PI / 2 + 0.5);
  let D = B.flat("#1c1814", 0.4);
  for (let l of [1, -1]) {
    let U = vt[sC("front" + l)].pos, S = vt[sC("hind" + l)].pos;
    for (let k of [-0.018, 0, 0.018]) {
      let K = new cA(h, D);
      K.position.set(l * 0.105 + k - U[0], 0.022 - U[1], 0.405 - U[2]), i["front" + l].add(K);
      let G = new cA(h, D);
      G.position.set(l * 0.18 + k - S[0], 0.02 - S[1], 0.035 - S[2]), i["hind" + l].add(G);
    }
  }
  return i.ear1.rotation.z = 0.18, i["ear-1"].rotation.z = -0.18, dQ(i.body, RQ, 0, 0.42, -0.06, 0.24, 0.28, 0.46), dQ(i.head, RQ, 0, 0.1, 0.12, 0.14, 0.15, 0.2), { root: E, parts: i, eyes: e };
}
function oM() {
  QM(), EM();
}
var dl = "ru";
function es(B) {
  dl = B;
}
function J(B, A) {
  return dl === "ru" ? B : A;
}
var eM = J, eu = { door_fl: ["Дверь передняя левая", "Front left door"], door_fr: ["Дверь передняя правая", "Front right door"], door_rl: ["Дверь задняя левая", "Rear left door"], door_rr: ["Дверь задняя правая", "Rear right door"], hood: ["Капот", "Hood"], trunk: ["Крышка багажника", "Trunk lid"], wheel_fl: ["Колесо", "Wheel"], wheel_fr: ["Колесо", "Wheel"], wheel_rl: ["Колесо", "Wheel"], wheel_rr: ["Колесо", "Wheel"], engine: ["Двигатель", "Engine"], battery: ["Аккумулятор", "Battery"], radiator: ["Радиатор", "Radiator"], headlight_l: ["Фара", "Headlight"], headlight_r: ["Фара", "Headlight"], bumper_f: ["Передний бампер", "Front bumper"], bumper_r: ["Задний бампер", "Rear bumper"], seat_d: ["Сиденье водителя", "Driver seat"], seat_p: ["Сиденье пассажира", "Passenger seat"], seat_r: ["Заднее сиденье", "Rear seat"], fender_fl: ["Крыло переднее левое", "Front left fender"], fender_fr: ["Крыло переднее правое", "Front right fender"], windshield: ["Лобовое стекло", "Windshield"], window_r: ["Заднее стекло", "Rear window"], taillight_l: ["Задний фонарь", "Taillight"], taillight_r: ["Задний фонарь", "Taillight"] };
function hi(B, A, I = dl) {
  return B === "seat_f" && A !== "seat_d" && A !== "seat_p" ? I === "ru" ? "Переднее сиденье" : "Front seat" : (eu[A] ?? [B, B])[I === "ru" ? 0 : 1];
}
var sM = { ru: ["Сынок,", "", "если ты читаешь это письмо — значит, почта ещё ходит, и ты жив. Я знаю, мы давно не говорили. После того, что случилось с миром, я думала, что не имею права тебя звать.", "", "Но здесь, на побережье, осталась вода и люди. Я жду тебя. Дорога длинная — почти пять тысяч километров на восток, по старому шоссе. Держись дороги: где дорога, там заправки и дома. Пустыня не прощает тех, кто от неё отходит.", "", "Отцовская машина в гараже. Аккумулятор я сняла, чтобы не сел — он на верстаке. Бензин в канистре, гаечный ключ рядом. Возьми воды и еды сколько сможешь.", "", "Ночью не останавливайся в поле. Говорят, там что-то бродит.", "", "Я верю, что ты доедешь.", "", "Мама.", "Июнь 2013"].join(`
`), en: ["My son,", "", "if you are reading this, the mail still runs and you are alive. I know we haven't spoken in years. After what happened to the world, I thought I had no right to call you.", "", "But here, by the coast, there is still water and there are still people. I'm waiting for you. The road is long — almost five thousand kilometres east along the old highway. Stay on the road: where the road is, there are gas stations and houses. The desert does not forgive those who leave it.", "", "Your father's car is in the garage. I took the battery out so it wouldn't die — it's on the workbench. There's petrol in the can and the wrench is on the bench. Take as much water and food as you can.", "", "Don't stop in the open at night. They say something roams out there.", "", "I believe you'll make it.", "", "Mom.", "June 2013"].join(`
`) }, Rl = { note: ["Кто-то нацарапал: «Колонки на юге пустые. Бензин ищите в брошенных машинах — шланг и канистра спасут жизнь».", 'Someone scribbled: "The pumps down south are dry. Look for fuel in abandoned cars — a hose and a can will save your life."'], mines: ["«Военные заминировали обочины у блокпостов. Не сворачивай с асфальта!»", `"The army mined the verges near the checkpoints. Don't leave the asphalt!"`], rabbits: ["«Кролики. Здоровые, как собаки. Выходят ночью. Не выходи из машины».", '"Rabbits. Big as dogs. They come out at night. Stay in the car."'] };
var ul = class {
  constructor(A, I, g) {
    this.kind = A;
    this.game = g;
    this.hp = A === "rabbit" ? 45 : 130, this.obj.position.copy(I), this.groundY = I.y;
    let C = g.physics;
    this.body = C.world.createRigidBody(_I.RigidBodyDesc.kinematicPositionBased().setTranslation(I.x, I.y + 0.5, I.z));
    let Q = A === "rabbit" ? _I.ColliderDesc.ball(0.38).setTranslation(0, 0, 0) : _I.ColliderDesc.capsule(0.55, 0.3).setTranslation(0, 0.45, 0);
    Q.setCollisionGroups(AC(QI.ENEMY, QI.STATIC | QI.PLAYER | QI.HEAVY));
    let i = C.world.createCollider(Q, this.body);
    C.setOwner(i, { kind: "enemy", enemy: this }), this.obj.userData.enemy = this, this.obj.traverse((E) => E.userData.enemy = this);
  }
  kind;
  game;
  obj = new WA();
  body;
  hp;
  state = "wander";
  yaw = 0;
  vel = new y();
  t = Math.random() * 10;
  attackCool = 0;
  deadT = 0;
  wanderTarget = new y();
  parts = {};
  eyes = null;
  groundY = 0;
  groundTimer = 0;
  hopPhase = 0;
  grounded = true;
  vy = 0;
  get alive() {
    return this.state !== "dead";
  }
};
function su(B, A, I) {
  let g = tM(B.mats, I);
  Object.assign(A.parts, g.parts), A.eyes = g.eyes, A.obj.add(g.root);
}
function au(B, A, I) {
  let g = iM(B.mats, I);
  Object.assign(A.parts, g.parts), A.eyes = g.eyes, A.obj.add(g.root);
}
var Dh = class {
  constructor(A) {
    this.g = A;
    this.group.name = "enemies";
  }
  g;
  list = [];
  group = new WA();
  spawnTimer = 5;
  rng = new vI(99);
  difficulty = 1;
  enabled = true;
  spawn(A, I) {
    let g = new ul(A, I, this.g);
    return A === "rabbit" ? su(this.g, g, this.rng) : au(this.g, g, this.rng), g.obj.traverse((C) => C.userData.enemy = g), g.yaw = this.rng.next() * 6.28, this.group.add(g.obj), this.list.push(g), g;
  }
  remove(A) {
    this.g.physics.removeBody(A.body), this.group.remove(A.obj), this.list.splice(this.list.indexOf(A), 1);
  }
  shiftOrigin(A, I) {
    for (let g of this.list) g.obj.position.x -= A, g.obj.position.z -= I, g.wanderTarget.x -= A, g.wanderTarget.z -= I;
  }
  damage(A, I, g, C) {
    if (!A.alive) return;
    A.hp -= I;
    let Q = A.obj.position.clone().add(new y(0, A.kind === "rabbit" ? 0.5 : 1.3, 0));
    this.g.fx.blood(Q, g), this.g.fx.bloodPool(A.obj.position, 0.35 + Math.random() * 0.3), A.vel.addScaledVector(g, A.kind === "rabbit" ? 3 : 1.2), A.hp <= 0 ? this.kill(A, g) : (A.state = "chase", this.g.audio.play(A.kind === "rabbit" ? "rabbit_squeal" : "husk_growl", { pos: Q }));
  }
  kill(A, I) {
    A.state = "dead", A.deadT = 0, A.vel.copy(I).multiplyScalar(4).add(new y(0, 2, 0)), this.g.audio.play(A.kind === "rabbit" ? "rabbit_die" : "husk_die", { pos: A.obj.position }), this.g.physics.removeBody(A.body), A.body = null, A.eyes && (A.eyes.emissiveIntensity = 0), this.g.fx.bloodPool(A.obj.position, A.kind === "rabbit" ? 0.9 : 1.4), this.g.fx.deathBurst(A.obj.position, A.kind === "rabbit"), this.g.stats.kills++;
  }
  spawnLogic(A) {
    let I = this.g;
    if (this.spawnTimer -= A, this.spawnTimer > 0 || !this.enabled) return;
    this.spawnTimer = 6 + this.rng.next() * 8;
    let g = I.env.night, C = this.list.filter((D) => D.alive), Q = Math.round((g > 0.5 ? 5 : 1) * this.difficulty);
    if (C.length >= Q) return;
    let i = (g > 0.5 ? 0.65 : 0.12) * this.difficulty;
    if (!this.rng.chance(i)) return;
    let E = I.player.car ? I.player.car.position : I.player.feet, t = this.rng.next() * Math.PI * 2, o = I.player.car ? 110 + this.rng.next() * 60 : 55 + this.rng.next() * 50, e = E.x + Math.cos(t) * o, s = E.z + Math.sin(t) * o, a = e + I.physics.originX, n = s + I.physics.originZ;
    if (I.world.fn.onRoad(a, n, 2)) return;
    let c = [...I.worldgen.built.values()].some((D) => Math.hypot(D.plan.x - a, D.plan.z - n) < 40) || g > 0.5 && this.rng.chance(0.3) ? "husk" : "rabbit", h = c === "rabbit" && this.rng.chance(0.4) ? 2 : 1;
    for (let D = 0; D < h; D++) {
      let l = I.world.fn.height(a + D * 2, n);
      this.spawn(c, new y(e + D * 2, l, s));
    }
  }
  update(A) {
    let I = this.g;
    this.spawnLogic(A);
    let g = I.player, C = g.car ? g.car.visual.root.position : g.feet, Q = !!g.car, i = I.playerCar;
    for (let E of [...this.list]) {
      E.t += A;
      let t = E.obj.position, o = t.distanceTo(C);
      if (o > 320) {
        this.remove(E);
        continue;
      }
      if (E.state === "dead") {
        E.deadT += A, E.vel.y -= 9.8 * A, t.addScaledVector(E.vel, A);
        let h = I.world.fn.height(t.x + I.physics.originX, t.z + I.physics.originZ);
        t.y < h && (t.y = h, E.vel.multiplyScalar(0.5), E.vel.y = 0);
        let D = Math.min(1, E.deadT * 3);
        E.obj.rotation.z = KI(E.obj.rotation.z, 1.5, 6, A) * D, E.deadT > 45 && this.remove(E);
        continue;
      }
      E.eyes && (E.eyes.emissiveIntensity = E.kind === "rabbit" ? 0.3 + I.env.night * 5 : 0.1 + I.env.night * 1.5);
      let e = o < (E.kind === "rabbit" ? 42 : 30) + I.env.night * 10;
      E.state !== "flee" && (E.state = e ? o < (E.kind === "rabbit" ? 1.5 : 1.7) ? "attack" : "chase" : "wander"), g.dead && (E.state = "wander");
      let s = new y(), a = 0;
      if (E.state === "chase" || E.state === "attack" ? (s.subVectors(C, t).setY(0), s.lengthSq() > 0.01 && s.normalize(), a = E.kind === "rabbit" ? 7.5 : o < 8 ? 3.4 : 1.8, Q && (i?.speed ?? 0) > 12 && (a = E.kind === "rabbit" ? 9 : 2)) : ((t.distanceTo(E.wanderTarget) < 2 || E.t % 12 < A) && E.wanderTarget.set(t.x + (Math.random() - 0.5) * 30, 0, t.z + (Math.random() - 0.5) * 30), s.subVectors(E.wanderTarget, t).setY(0), s.lengthSq() > 0.01 && s.normalize(), a = E.kind === "rabbit" ? Math.sin(E.t * 0.7) > 0.3 ? 2.5 : 0 : 0.9), a > 0 && E.t % 0.25 < A) {
        let h = t.clone().add(new y(0, 0.5, 0));
        I.physics.castRay(h, s, 1.6, AC(65535, QI.STATIC)) && s.applyAxisAngle(new y(0, 1, 0), 1.2);
      }
      E.yaw = ww(E.yaw, Math.atan2(s.x, s.z), 6, A);
      let n = new y(Math.sin(E.yaw), 0, Math.cos(E.yaw)), r = a;
      if (E.kind === "rabbit" && a > 0) {
        let h = E.hopPhase % 1;
        E.hopPhase += A * (a > 4 ? 3.2 : 2.2);
        let D = E.hopPhase % 1;
        r = D < 0.55 ? a * 1.7 : a * 0.15, h < 0.55 && D >= 0.55 && t.distanceToSquared(C) < 3600 && this.g.fx.stepDust(t, a > 4);
      }
      E.vel.x = KI(E.vel.x, n.x * r, 8, A), E.vel.z = KI(E.vel.z, n.z * r, 8, A), t.x += E.vel.x * A, t.z += E.vel.z * A, E.groundTimer -= A, E.groundTimer <= 0 && (E.groundTimer = 0.15, E.groundY = I.physics.groundY(t.x, t.z, t.y + 1.6));
      let c = 0;
      if (E.kind === "rabbit" && a > 0) {
        let h = E.hopPhase % 1;
        c = h < 0.55 ? Math.sin(h / 0.55 * Math.PI) * (a > 4 ? 0.45 : 0.2) : 0;
      }
      if (t.y = KI(t.y, E.groundY, 20, A), E.obj.rotation.set(0, E.yaw, 0), E.body?.setNextKinematicTranslation({ x: t.x, y: t.y + (E.kind === "rabbit" ? 0.4 : 0), z: t.z }), this.animate(E, a, c, A), E.attackCool -= A, E.state === "attack" && E.attackCool <= 0 && !Q) {
        E.attackCool = E.kind === "rabbit" ? 1.1 : 1.8;
        let h = (E.kind === "rabbit" ? 11 : 24) * this.difficulty;
        I.damagePlayer(h, E.kind === "rabbit" ? J("Загрызен кроликом", "Mauled by a rabbit") : J("Убит оборванцем", "Killed by a husk")), I.audio.play(E.kind === "rabbit" ? "rabbit_attack" : "husk_attack", { pos: t }), g.shake = Math.max(g.shake, 0.8);
      } else E.state === "attack" && Q && E.attackCool <= 0 && E.kind === "husk" && (E.attackCool = 2, I.audio.play("impact_metal", { pos: t, volume: 0.8 }));
      for (let h of I.cars) {
        if (!h.enabled || Math.abs(h.speed) < 4) continue;
        let D = h.visual.root.position;
        if (t.distanceTo(D) > 3) continue;
        let U = h.worldToLocal(t.clone());
        if (Math.abs(U.x) < 1 && Math.abs(U.z) < 2.3 && U.y < 1.6) {
          let S = new y(0, 0, Math.sign(h.speed)).applyQuaternion(h.visual.root.quaternion);
          this.damage(E, 999, S, "car"), I.audio.play("crash_light", { pos: t, volume: 0.9 }), h.body.applyImpulse({ x: -S.x * 250, y: 0, z: -S.z * 250 }, true);
        }
      }
      E.kind === "rabbit" && Math.random() < A * 0.08 && o < 30 && I.audio.play("rabbit_squeal", { pos: t, volume: 0.5 }), E.kind === "husk" && Math.random() < A * 0.12 && o < 35 && I.audio.play("husk_growl", { pos: t, volume: 0.7 });
    }
  }
  animate(A, I, g, C) {
    let Q = A.parts;
    if (A.kind === "rabbit") {
      let i = A.hopPhase % 1, E = I > 0.1;
      Q.body.position.y = g;
      let t = E ? Math.sin(i * Math.PI * 2) : 0;
      Q.body.rotation.x = E ? -t * 0.25 : Math.sin(A.t * 2) * 0.02;
      for (let o of [-1, 1]) Q["hind" + o].rotation.x = E ? i < 0.55 ? -1 * Math.sin(i / 0.55 * Math.PI) : 0.2 : 0.1, Q["front" + o].rotation.x = E ? i < 0.55 ? 0.9 * Math.sin(i / 0.55 * Math.PI) : -0.2 : 0, Q["ear" + o].rotation.x = -0.25 + (E ? -0.4 * t : Math.sin(A.t * 3 + o) * 0.08) - (A.state === "chase" ? 0.5 : 0);
      Q.head.rotation.x = A.state === "attack" ? -0.3 + Math.sin(A.t * 20) * 0.2 : Math.sin(A.t * 1.3) * 0.05;
    } else {
      let i = A.t * (I > 2 ? 7 : 4.5), E = Math.min(1, I / 1.5);
      for (let t of [-1, 1]) Q["hip" + t].rotation.x = Math.sin(i + (t > 0 ? 0 : Math.PI)) * 0.5 * E, Q["knee" + t].rotation.x = Math.max(0, Math.sin(i + (t > 0 ? 0 : Math.PI) + 1.2)) * 0.8 * E, Q["arm" + t].rotation.x = A.state === "attack" ? -1.4 + Math.sin(A.t * 9) * 0.6 : -0.9 + Math.sin(i + (t > 0 ? Math.PI : 0)) * 0.25 * E, Q["arm" + t].rotation.z = t * 0.15, Q["elbow" + t].rotation.x = -0.4;
      Q.torso.rotation.x = 0.25 + Math.sin(i * 2) * 0.03, Q.torso.rotation.z = Math.sin(i) * 0.06, Q.head.rotation.z = Math.sin(A.t * 0.9) * 0.2, Q.hips.position.y = 0.95 + Math.abs(Math.sin(i)) * 0.03 * E;
    }
  }
  clear() {
    for (let A of [...this.list]) this.remove(A);
  }
};
var ch = class {
  constructor(A) {
    this.g = A;
  }
  g;
  mines = [];
  mineKeys = /* @__PURE__ */ new Set();
  rng = new vI(4242);
  shoot(A) {
    let I = this.g, g = I.interaction;
    if ((A.state.loaded ?? 0) <= 0) {
      I.audio.play("empty_click"), I.ui.toast(J("Пусто — R для перезарядки", "Empty — R to reload"));
      return;
    }
    if (g._gunCool > I.time) return;
    g._gunCool = I.time + (A.def.weapon?.rate ?? 0.4), A.state.loaded = (A.state.loaded ?? 0) - 1;
    let C = I.player.camera, Q = new y(0, 0, -1).applyQuaternion(C.quaternion), i = g.aiming ? 4e-3 : 0.02;
    Q.x += (Math.random() - 0.5) * i, Q.y += (Math.random() - 0.5) * i, Q.normalize();
    let E = C.position.clone().addScaledVector(Q, 0.5).add(new y(0, -0.06, 0).applyQuaternion(C.quaternion));
    I.fx.muzzle(E, Q), I.audio.play("gunshot"), g.kickRecoil(), I.player.pitch += 0.025;
    let t = new Ni(C.position, Q, 0.1, 150), o = I.physics.castRay(C.position, Q, 150, AC(65535, QI.STATIC | QI.HEAVY | QI.CAR)), e = o ? o.timeOfImpact : 150, s = t.intersectObjects(I.enemies.list.filter((a) => a.alive).map((a) => a.obj), true);
    if (s.length && s[0].distance < e) {
      let a = s[0].object.userData.enemy, n = a.kind === "husk" && s[0].point.y - a.obj.position.y > 1.55;
      I.fx.shot(E, Q, s[0].point, C, null), I.enemies.damage(a, (A.def.weapon?.damage ?? 60) * (n ? 2 : 1), Q, "gun");
      return;
    }
    if (o) {
      let a = C.position.clone().addScaledVector(Q, o.timeOfImpact), n = I.physics.ownerOf(o.collider), r = new y(o.normal.x, o.normal.y, o.normal.z);
      I.fx.shot(E, Q, a, C, n?.kind === "terrain" || n?.kind === "item" ? null : { point: a, normal: r }), n?.kind === "terrain" ? (I.fx.sandHit(a), I.audio.play("impact_soft", { pos: a, volume: 0.4 })) : (I.fx.sparks(a, 8), I.audio.play("impact_metal", { pos: a, volume: 0.5 })), n?.kind === "item" && n.item.def.breakable && this.breakContainer(n.item), n?.kind === "item" && n.item.body && n.item.body.applyImpulseAtPoint({ x: Q.x * 6, y: Q.y * 6, z: Q.z * 6 }, { x: a.x, y: a.y, z: a.z }, true);
    } else I.fx.shot(E, Q, C.position.clone().addScaledVector(Q, 150), C, null);
  }
  reload(A, I) {
    let g = 6 - (A.state.loaded ?? 0);
    if (g <= 0) return;
    let C = I.slots.find((i) => i?.def.ammo && (i.state.ammo ?? 0) > 0);
    if (!C) {
      this.g.ui.toast(J("Нет патронов", "No ammo"));
      return;
    }
    let Q = Math.min(g, C.state.ammo ?? 0);
    C.state.ammo = (C.state.ammo ?? 0) - Q, A.state.loaded = (A.state.loaded ?? 0) + Q, this.g.audio.play("reload"), (C.state.ammo ?? 0) <= 0 && I.consume(C);
  }
  melee(A) {
    let I = this.g, g = I.player.camera, C = new y(0, 0, -1).applyQuaternion(g.quaternion), Q = A.def.weapon?.range ?? 1.8, i = false;
    for (let E of I.enemies.list) {
      if (!E.alive) continue;
      let o = E.obj.position.clone().add(new y(0, E.kind === "rabbit" ? 0.4 : 1.1, 0)).sub(g.position);
      o.length() > Q + 0.4 || o.normalize().dot(C) < 0.6 || (I.enemies.damage(E, A.def.weapon?.damage ?? 20, C, "melee"), I.audio.play("flesh_hit", { pos: E.obj.position }), i = true);
    }
    if (!i) {
      let E = I.physics.castRay(g.position, C, Q, AC(65535, QI.STATIC | QI.ITEM | QI.HEAVY | QI.CAR));
      if (E) {
        let t = g.position.clone().addScaledVector(C, E.timeOfImpact), o = I.physics.ownerOf(E.collider);
        o?.kind === "item" && o.item.def.breakable ? (o.item.state.used = (o.item.state.used ?? 0) + 1, I.audio.play("impact_wood", { pos: t }), I.fx.woodBurst(t), (o.item.state.used ?? 0) >= (o.item.def.id === "box" ? 1 : 2) && this.breakContainer(o.item)) : o?.kind === "terrain" ? (I.fx.sandHit(t), I.audio.play("impact_soft", { pos: t })) : (I.fx.sparks(t, 5), I.audio.play(o?.kind === "car" ? "impact_metal" : "melee_hit", { pos: t }), o?.kind === "item" && o.item.body && o.item.body.applyImpulse({ x: C.x * 4, y: 1, z: C.z * 4 }, true));
      }
    }
  }
  breakContainer(A) {
    let I = this.g, g = A.obj.position.clone();
    I.fx.woodBurst(g), I.audio.play(A.def.id === "crate" ? "crate_break" : "paper", { pos: g });
    let C = A.state.loot ?? [];
    A.spawnKey && I.worldgen.collected.add(A.spawnKey), I.items.remove(A), C.forEach((Q, i) => {
      let E = new nI().setFromEuler(new $I(0, Math.random() * 6, 0)), t = I.items.spawn(Q.id, g.x + I.physics.originX + (i - C.length / 2) * 0.2, g.y + 0.1, g.z + I.physics.originZ, E, Q.state ?? {});
      t.touched = true;
    }), C.length || I.ui.toast(J("Пусто", "Empty"));
  }
  update(A) {
    let I = this.g;
    for (let Q of I.worldgen.built.values()) {
      if (Q.plan.type !== "military" || this.mineKeys.has(Q.plan.key)) continue;
      this.mineKeys.add(Q.plan.key);
      let i = new vI(Q.plan.seed), E = new y(0, 0, -1).applyAxisAngle(new y(0, 1, 0), Q.plan.ry), t = new y(1, 0, 0).applyAxisAngle(new y(0, 1, 0), Q.plan.ry);
      for (let o = 0; o < 14; o++) {
        let e = i.range(-18, 18), s = i.range(12, 40);
        this.mines.push({ x: Q.plan.x + t.x * e + E.x * s, z: Q.plan.z + t.z * e + E.z * s, armed: true, t: 0 });
      }
    }
    let g = I.player.car ? I.player.car.worldX : I.player.feet.x + I.physics.originX, C = I.player.car ? I.player.car.worldZ : I.player.feet.z + I.physics.originZ;
    for (let Q of this.mines) {
      if (!Q.armed) continue;
      let i = Math.hypot(Q.x - g, Q.z - C);
      if (i > 60) continue;
      let E = false;
      i < (I.player.car ? 1.8 : 0.9) && (E = true);
      for (let t of I.cars) t !== I.player.car && t.enabled && Math.hypot(t.worldX - Q.x, t.worldZ - Q.z) < 1.6 && Math.abs(t.speed) > 0.5 && (E = true);
      E && Q.t === 0 && (Q.t = 0.35, I.audio.play("mine_beep", { pos: new y(Q.x - I.physics.originX, I.world.fn.height(Q.x, Q.z), Q.z - I.physics.originZ) })), Q.t > 0 && (Q.t -= A, Q.t <= 0 && (Q.armed = false, this.explode(new y(Q.x - I.physics.originX, I.world.fn.height(Q.x, Q.z) + 0.2, Q.z - I.physics.originZ), 7)));
    }
  }
  explode(A, I) {
    let g = this.g;
    g.fx.explosion(A), g.audio.play("explosion", { pos: A }), g.audio.duck(0.6, 1.5);
    let Q = (g.player.car ? g.player.car.visual.root.position : g.player.feet).distanceTo(A);
    Q < I * 3 && (g.player.shake = Math.max(g.player.shake, 2.2 - Q / (I * 1.5))), !g.player.car && Q < I && g.damagePlayer(110 * (1 - Q / I), J("Подорвался на мине", "Stepped on a mine"));
    for (let i of g.cars) {
      let E = i.visual.root.position.distanceTo(A);
      if (E > I) continue;
      let t = i.visual.root.position.clone().sub(A).normalize();
      i.body.applyImpulseAtPoint({ x: t.x * 4e3, y: 9e3, z: t.z * 4e3 }, { x: A.x, y: A.y, z: A.z }, true);
      let o = i.applyImpact(i.worldToLocal(A.clone()), 6e4 * (1 - E / I));
      for (let e of o) g.detachAndThrow(i, e);
      i === g.player.car && g.damagePlayer(45 * (1 - E / I), J("Подорвался на мине", "Blown up by a mine"));
    }
    for (let i of g.enemies.list) i.alive && i.obj.position.distanceTo(A) < I && g.enemies.damage(i, 200, i.obj.position.clone().sub(A).normalize(), "blast");
    for (let i of g.items.items) {
      if (!i.body) continue;
      let E = i.body.translation(), t = new y(E.x, E.y, E.z).sub(A), o = t.length();
      o < I && i.body.applyImpulse({ x: t.x / o * i.mass * 8, y: i.mass * 8, z: t.z / o * i.mass * 8 }, true);
    }
  }
};
var nu = [{ x: -0.029, z: -0.098, len: [0.044, 0.026, 0.022], r: [98e-4, 88e-4, 79e-4, 71e-4] }, { x: -9e-3, z: -0.101, len: [0.049, 0.03, 0.024], r: [0.0101, 91e-4, 81e-4, 73e-4] }, { x: 0.011, z: -0.098, len: [0.045, 0.028, 0.022], r: [95e-4, 86e-4, 77e-4, 7e-3] }, { x: 0.029, z: -0.09, len: [0.035, 0.021, 0.019], r: [84e-4, 76e-4, 69e-4, 62e-4] }], uQ = { base: [-0.028, -0.011, -0.022], dirs: [[-0.55, 0.05, -0.83], [-0.28, 0.08, -0.96], [-0.12, 0.1, -0.99]], len: [0.045, 0.032, 0.028], r: [0.0135, 0.0112, 98e-4, 86e-4] };
function ru(B) {
  let A = Math.hypot(B[0], B[1], B[2]);
  return [B[0] / A, B[1] / A, B[2] / A];
}
var gQ = (B, A, I = 1) => [B[0] + A[0] * I, B[1] + A[1] * I, B[2] + A[2] * I];
function hu() {
  let B = [{ name: "wrist", parent: -1, pos: [0, 0, 0] }], A = [], I = 13146234, g = 12158056, C = 15188656, Q = 4146742, i = 3093545;
  A.push({ t: "box", a: [0, -1e-3, -0.053], s: [0.036, 0.0105, 0.043], r: 0.011, bone: 0, col: I, k: 0.012 }), A.push({ t: "ell", a: [-0.021, -9e-3, -0.03], s: [0.02, 0.013, 0.03], bone: 0, col: g, k: 0.012 }), A.push({ t: "ell", a: [0.024, -7e-3, -0.045], s: [0.014, 0.011, 0.034], bone: 0, col: g, k: 0.01 }), A.push({ t: "ell", a: [0, 4e-3, -0.06], s: [0.035, 9e-3, 0.04], bone: 0, col: I, k: 0.01 }), A.push({ t: "cap", a: [0, -1e-3, -0.012], b: [0, -3e-3, 0.12], r: 0.024, r2: 0.03, bone: 0, col: I, k: 0.02 }), nu.forEach((o, e) => {
    let s = [o.x, 1e-3, o.z], a = B.length;
    B.push({ name: `f${e}a`, parent: 0, pos: s });
    let n = gQ(s, [0, 0, -o.len[0]]);
    B.push({ name: `f${e}b`, parent: a, pos: n });
    let r = gQ(n, [0, 0, -o.len[1]]);
    B.push({ name: `f${e}c`, parent: a + 1, pos: r });
    let c = gQ(r, [0, 0, -o.len[2]]);
    A.push({ t: "ell", a: gQ(s, [0, 4e-3, 4e-3]), s: [o.r[0] * 1.05, o.r[0] * 0.9, o.r[0] * 1.1], bone: 0, col: I, k: 8e-3 }), A.push({ t: "cap", a: gQ(s, [0, 0, 0.012]), b: n, r: o.r[0], r2: o.r[1], bone: a, col: I, k: 6e-3 }), A.push({ t: "cap", a: n, b: r, r: o.r[1], r2: o.r[2], bone: a + 1, col: I, k: 4e-3 }), A.push({ t: "cap", a: r, b: gQ(c, [0, 5e-4, 4e-3]), r: o.r[2], r2: o.r[3], bone: a + 2, col: I, k: 3e-3 }), A.push({ t: "ell", a: gQ(c, [0, o.r[3] * 0.72, 8e-3]), s: [o.r[3] * 0.72, o.r[3] * 0.32, o.r[3] * 1.25], op: "paint", col: C, soft: 2e-3 });
  });
  let E = uQ.base, t = 0;
  return uQ.dirs.forEach((o, e) => {
    let s = B.length;
    B.push({ name: `t${e}`, parent: t, pos: E });
    let a = gQ(E, ru(o), uQ.len[e]);
    A.push({ t: "cap", a: e ? E : gQ(E, [6e-3, 0, 0.012]), b: a, r: uQ.r[e], r2: uQ.r[e + 1], bone: s, col: e ? I : g, k: e ? 4e-3 : 0.012 }), e === 2 && A.push({ t: "ell", a: gQ(a, [1e-3, uQ.r[3] * 0.7, 6e-3]), s: [uQ.r[3] * 0.75, uQ.r[3] * 0.32, uQ.r[3] * 1.2], op: "paint", col: C, soft: 2e-3 }), t = s, E = a;
  }), A.push({ t: "cap", a: [0, 0, 0.05], b: [0, -4e-3, 0.34], r: 0.034, r2: 0.047, bone: 0, col: Q, noise: 16e-4, k: 4e-3 }), A.push({ t: "tor", a: [0, 0, 0.052], r: 0.033, r2: 65e-4, rot: [Math.PI / 2, 0, 0], bone: 0, col: i, k: 4e-3 }), { bones: B, prims: A };
}
var lh = null, aM = [];
function Du() {
  if (lh) return lh;
  let { bones: B, prims: A } = hu();
  return aM = B, lh = new gE(A, 60).build([-0.1, -0.05, -0.215], [0.07, 0.06, 0.35], 26e-4, B.length, { ao: 0.55, boneSoft: 6e-3 }), lh;
}
var ss = { relaxed: { f: [[0.25, 0.4, 0.25], [0.32, 0.45, 0.28], [0.4, 0.5, 0.3], [0.48, 0.55, 0.32]], t: [0.1, 0.15, 0.1], swing: 0.15, spread: 0.02 }, open: { f: [[0.05, 0.08, 0.05], [0.05, 0.08, 0.05], [0.06, 0.08, 0.05], [0.08, 0.1, 0.06]], t: [-0.1, 0.02, 0.02], swing: -0.1, spread: 0.08 }, grip: { f: [[1.25, 1.45, 0.85], [1.3, 1.5, 0.9], [1.35, 1.5, 0.9], [1.4, 1.5, 0.9]], t: [0.45, 0.5, 0.45], swing: 0.75, spread: 0 }, pinch: { f: [[0.75, 0.7, 0.35], [1.1, 1.4, 0.8], [1.3, 1.5, 0.9], [1.4, 1.5, 0.9]], t: [0.4, 0.3, 0.25], swing: 0.65, spread: 0 }, point: { f: [[0.02, 0.05, 0.02], [1.3, 1.55, 0.9], [1.35, 1.55, 0.9], [1.4, 1.55, 0.9]], t: [0.5, 0.45, 0.4], swing: 0.7, spread: 0 }, flat: { f: [[-0.05, 0, 0], [-0.05, 0, 0], [-0.05, 0, 0], [-0.05, 0.02, 0]], t: [-0.15, 0, 0], swing: -0.2, spread: 0.06 }, wheel: { f: [[1.05, 1.2, 0.7], [1.1, 1.25, 0.72], [1.15, 1.25, 0.72], [1.2, 1.25, 0.72]], t: [0.3, 0.35, 0.3], swing: 0.5, spread: 0 } };
function cu(B) {
  let A = new oI({ vertexColors: true, roughness: 0.72, metalness: 0, normalMap: B.tex.fabricNormal });
  return A.normalScale.set(0.15, 0.15), A;
}
function fl(B, A) {
  let I = Du(), g = aM.map((a) => ({ ...a, pos: [a.pos[0] * A, a.pos[1], a.pos[2]] }));
  if (A < 0) {
    I = I.clone(), I.scale(-1, 1, 1);
    let a = I.index;
    for (let n = 0; n < a.count; n += 3) {
      let r = a.getX(n + 1);
      a.setX(n + 1, a.getX(n + 2)), a.setX(n + 2, r);
    }
  }
  let C = g.map((a) => Object.assign(new PQ(), { name: a.name }));
  g.forEach((a, n) => {
    let r = a.parent >= 0 ? g[a.parent].pos : [0, 0, 0];
    C[n].position.set(a.pos[0] - r[0], a.pos[1] - r[1], a.pos[2] - r[2]), a.parent >= 0 && C[a.parent].add(C[n]);
  });
  let Q = new Ui(I, cu(B));
  Q.add(C[0]), Q.updateMatrixWorld(true), Q.bind(new Ki(C)), Q.frustumCulled = false, Q.castShadow = false, Q.receiveShadow = true, Q.raycast = () => {
  };
  let i = new WA();
  i.add(Q);
  let E = (a) => C.find((n) => n.name === a), t = [0, 1, 2, 3].map((a) => [E(`f${a}a`), E(`f${a}b`), E(`f${a}c`)]), o = [E("t0"), E("t1"), E("t2")], e = { f: ss.relaxed.f.map((a) => [...a]), t: [...ss.relaxed.t], swing: ss.relaxed.swing, spread: ss.relaxed.spread }, s = { root: i, mesh: Q, side: A, pose: "relaxed", grip: new y(0 * A, -0.028, -0.072), setPose(a) {
    s.pose = a;
  }, update(a) {
    let n = ss[s.pose], r = 1 - Math.exp(-a * 14);
    for (let c = 0; c < 4; c++) for (let h = 0; h < 3; h++) e.f[c][h] += (n.f[c][h] - e.f[c][h]) * r;
    for (let c = 0; c < 3; c++) e.t[c] += (n.t[c] - e.t[c]) * r;
    e.swing += (n.swing - e.swing) * r, e.spread += (n.spread - e.spread) * r;
    for (let c = 0; c < 4; c++) {
      let h = (c - 1.5) * e.spread * A;
      t[c][0].rotation.set(-e.f[c][0], -h, 0), t[c][1].rotation.set(-e.f[c][1], 0, 0), t[c][2].rotation.set(-e.f[c][2], 0, 0);
    }
    o[0].rotation.set(-e.t[0] * 0.6, -e.swing * 0.9 * A, e.swing * 0.8 * A), o[1].rotation.set(-e.t[1], 0, -e.t[1] * 0.3 * A), o[2].rotation.set(-e.t[2], 0, 0);
  } };
  return s.update(1), s;
}
var gC = (B, A, I) => new y(B, A, I), Sh = { r: gC(0.2, -0.32, 0.14), l: gC(-0.2, -0.32, 0.14) }, nM = 0.8, Zt = new TA(), Pt = new nI(), lu = new y(), Su = new y();
function Yl(B, A, I, g) {
  let C = lu.subVectors(A, B).normalize(), Q = Su.copy(I).addScaledVector(C, -I.dot(C)).normalize(), i = new y().crossVectors(Q, C);
  return Zt.makeBasis(i, Q, C), g.setFromRotationMatrix(Zt);
}
var wh = class {
  constructor(A) {
    this.g = A;
    this.right = fl(A.mats, 1), this.left = fl(A.mats, -1);
    for (let I of [this.right, this.left]) I.root.visible = false, ee(I.root, true), A.player.camera.add(I.root);
  }
  g;
  right;
  left;
  tR = { pos: gC(0.26, -0.34, -0.42), quat: new nI(), pose: "relaxed", visible: true };
  tL = { pos: gC(-0.26, -0.5, -0.3), quat: new nI(), pose: "relaxed", visible: false };
  snap = true;
  mode = "idle";
  grab = 0;
  kickGrab() {
    this.grab = 1;
  }
  toCam(A, I, g, C) {
    let Q = this.g.player.camera;
    Q.updateMatrixWorld(), g.copy(A).applyMatrix4(Zt.copy(Q.matrixWorld).invert()), Q.getWorldQuaternion(Pt), C.copy(Pt.invert()).multiply(I);
  }
  idle(A, I, g) {
    let C = this.g.player, Q = C.vel.length() > 0.5 ? 1 : 0, i = C.bob * Math.PI;
    A.pos.set(0.23 + Math.sin(i) * 0.012 * Q, -0.28 + I * 0.05 + Math.abs(Math.cos(i)) * 0.012 * Q, -0.42 - I * 0.06), Yl(A.pos, Sh.r, gC(-0.35, 1, 0.1), A.quat), A.pose = g, A.visible = true;
  }
  hold(A, I, g) {
    let C = wu(I), Q = C.max.y - C.min.y, i = C.max.z - C.min.z, E = I.def.tool, t = gC(C.max.x + 4e-3, C.min.y + Q * 0.42, (C.min.z + C.max.z) / 2), o = "grip";
    E === "gun" && t.set(C.max.x * 0.4, C.min.y + Q * 0.3, C.max.z - i * 0.28), (E === "note" || I.def.money) && (t.set(C.max.x - 0.01, C.min.y + 0.012, (C.min.z + C.max.z) / 2 + i * 0.3), o = "pinch");
    let e = new nI().setFromRotationMatrix(Zt.makeBasis(gC(0, -1, 0), gC(1, 0, 0), gC(0, 0, 1))), s = this.right.grip.clone().applyQuaternion(e), a = t.sub(s);
    g.updateMatrixWorld();
    let n = a.applyMatrix4(g.matrixWorld);
    g.getWorldQuaternion(Pt), this.toCam(n, Pt.multiply(e), A.pos, A.quat), A.pose = this.grab > 0.5 ? "open" : o, A.visible = true;
  }
  carry(A, I, g, C) {
    let Q = g.half.clone().multiplyScalar(2), i = gC(0, -0.15, -(C + Math.max(g.half.x, g.half.z) * 0.8)), E = Math.min(0.35, Math.max(0.09, Math.max(Q.x, Q.z) * 0.42)), t = -Math.min(0.2, Q.y * 0.3), o = (e, s, a) => {
      let n = i.clone().add(gC(s * E, t, 0.02)), r = n.clone().sub(a);
      r.length() > nM && n.copy(a).addScaledVector(r.normalize(), nM), e.pos.copy(n), Yl(n, a, gC(s * 1, 0.25, 0), e.quat), e.pose = "grip", e.visible = true;
    };
    o(A, 1, Sh.r), o(I, -1, Sh.l);
  }
  drive(A, I) {
    let g = this.g.player.car, C = g.visual.steering;
    C.updateMatrixWorld(), C.getWorldQuaternion(Pt);
    let Q = Pt.clone(), i = 0.19, E = (t, o, e) => {
      let s = gC(Math.cos(o) * i, Math.sin(o) * i, 0.018), a = gC(Math.cos(o), Math.sin(o), 0), n = gC(0, 0, 1).addScaledVector(a, 0.35).normalize(), r = a.clone().multiplyScalar(1).addScaledVector(n, -a.dot(n)).normalize(), c = new y().crossVectors(r, n), h = new nI().setFromRotationMatrix(Zt.makeBasis(c, r, n)), D = Q.clone().multiply(h), l = (e > 0 ? this.right : this.left).grip.clone().applyQuaternion(h), U = s.sub(l).applyMatrix4(C.matrixWorld);
      this.toCam(U, D, t.pos, t.quat), t.pose = "wheel", t.visible = true;
    };
    if (E(A, 0.35, 1), E(I, Math.PI - 0.35, -1), g.cranking || this.reachKey) {
      let t = g.visual.key;
      t.updateMatrixWorld();
      let o = new y().setFromMatrixPosition(t.matrixWorld), e = this.g.player.camera, s = o.applyMatrix4(Zt.copy(e.matrixWorld).invert()).add(gC(0.02, -0.03, 0.08));
      A.pos.copy(s), Yl(s, Sh.r, gC(1, 0.4, 0), A.quat), A.pose = "pinch";
    }
  }
  reachKey = false;
  update(A, I, g) {
    let C = this.g;
    this.reachKey = !!g.reachKey, this.grab = Math.max(0, this.grab - A * 3.5);
    let Q = C.mode !== "play" || C.player.dead || C.player.thirdPerson || I === "hidden", i = this.mode;
    switch (this.mode = Q ? "hidden" : I, (i === "hidden" || i === "drive" != (this.mode === "drive")) && (this.snap = true), this.tL.visible = false, this.mode) {
      case "hidden":
        this.tR.visible = false;
        break;
      case "idle":
        this.idle(this.tR, 0, "relaxed");
        break;
      case "hover":
        this.idle(this.tR, 1, "open");
        break;
      case "point":
        this.idle(this.tR, 1.3, "point");
        break;
      case "hold":
        g.item && g.handObj && this.hold(this.tR, g.item, g.handObj);
        break;
      case "carry":
        g.carried && this.carry(this.tR, this.tL, g.carried, g.holdDist ?? 0.55);
        break;
      case "drive":
        this.drive(this.tR, this.tL);
        break;
    }
    let E = this.snap ? 1 : 1 - Math.exp(-A * (this.mode === "drive" ? 30 : 16));
    for (let [t, o] of [[this.right, this.tR], [this.left, this.tL]]) t.root.visible = o.visible, o.visible && (t.root.position.lerp(o.pos, E), t.root.quaternion.slerp(o.quat, E), t.setPose(o.pose), t.update(A));
    this.snap = false;
  }
};
function wu(B) {
  let A = B._handBox;
  if (A) return A;
  let I = new Jg();
  B.obj.updateMatrixWorld(true);
  let g = new TA().copy(B.obj.matrixWorld).invert();
  return B.obj.traverse((C) => {
    let Q = C;
    if (!Q.isMesh || !Q.geometry) return;
    Q.geometry.boundingBox || Q.geometry.computeBoundingBox();
    let i = Q.geometry.boundingBox.clone().applyMatrix4(new TA().multiplyMatrices(g, Q.matrixWorld));
    I.union(i);
  }), I.isEmpty() && I.set(gC(-0.04, -0.04, -0.04), gC(0.04, 0.04, 0.04)), B._handBox = I, I;
}
var _t = new Ni(), yh = class {
  constructor(A) {
    this.g = A;
    A.player.camera.add(this.handObj), this.hands = new wh(A), this.flashlight = MB(new Ji(16773848, 0, 38, 0.42, 0.55, 1.4)), this.flashlight.position.set(0.15, -0.1, 0), this.flashlight.target.position.set(0.1, -0.2, -10), A.player.camera.add(this.flashlight, this.flashlight.target);
  }
  g;
  hand = null;
  slots = [null, null, null, null];
  target = null;
  holdT = 0;
  holdMax = 0;
  holding = null;
  acts = [];
  holdDist = 0.55;
  handObj = new WA();
  flashlight;
  flashOn = false;
  swing = 0;
  swingCool = 0;
  recoil = 0;
  aiming = false;
  pouring = null;
  lastHit = null;
  money = 0;
  hands;
  get handDef() {
    return this.hand ? this.hand.def : null;
  }
  hasAction(A) {
    return this.acts.some((I) => I.btn === A);
  }
  has(A) {
    return this.hand?.def.tool === A ? true : this.slots.some((I) => I?.def.tool === A);
  }
  hasCompass() {
    return this.has("compass");
  }
  totalMoney() {
    let A = 0;
    for (let I of [this.hand, ...this.slots]) I?.def.money && (A += I.state.money ?? 0);
    return A;
  }
  spendMoney(A) {
    if (this.totalMoney() < A - 1e-6) return false;
    let I = A;
    for (let g of [this.hand, ...this.slots]) {
      if (!g?.def.money || I <= 0) continue;
      let C = Math.min(I, g.state.money ?? 0);
      g.state.money = +((g.state.money ?? 0) - C).toFixed(2), I -= C, (g.state.money ?? 0) <= 1e-3 && this.consume(g);
    }
    return true;
  }
  consume(A) {
    this.hand === A && this.setHand(null);
    let I = this.slots.indexOf(A);
    I >= 0 && (this.slots[I] = null), this.g.items.remove(A);
  }
  setHand(A) {
    this.hand && this.hand !== A && (this.hand.held = false, this.hand.obj.parent === this.handObj && this.handObj.remove(this.hand.obj), ee(this.hand.obj, false)), this.hand = A, this.aiming = false, A && (A.held = true, A.inInventory = false, this.isViewModel(A) && (this.g.items.pick(A), this.handObj.add(A.obj), ee(A.obj, true), A.obj.position.set(0, 0, 0), A.obj.quaternion.identity(), A.obj.visible = true)), this.g.player.carryMass = A && !this.isViewModel(A) ? A.mass + (A.state.amount ?? 0) * 0.8 : 0;
  }
  isViewModel(A) {
    return A.def.storable;
  }
  take(A) {
    this.hand && this.drop(false), A.spawnKey && this.g.worldgen.collected.add(A.spawnKey), A.touched = true, A.spawnKey = null, A.body && A.body.setGravityScale(0, true), this.isViewModel(A) && this.g.items.removeBody(A), this.setHand(A), this.hands.kickGrab(), this.g.audio.play("pickup", { volume: 0.6 });
  }
  storeToSlot(A) {
    let I = this.slots.indexOf(null);
    return I < 0 || !A.def.storable ? false : (A.spawnKey && this.g.worldgen.collected.add(A.spawnKey), A.touched = true, A.spawnKey = null, this.g.items.pick(A), this.hand === A && this.setHand(null), A.inInventory = true, A.held = false, A.obj.parent?.remove(A.obj), this.slots[I] = A, this.g.audio.play("zip", { volume: 0.5 }), true);
  }
  slotKey(A) {
    let I = this.slots[A], g = this.hand;
    if (g && !g.def.storable) {
      this.g.ui.toast(eM("Этот предмет не помещается в карман", "This item does not fit in a pocket"));
      return;
    }
    this.slots[A] = null, g && (this.setHand(null), g.inInventory = true, g.obj.parent?.remove(g.obj), this.slots[A] = g), I && (I.inInventory = false, this.setHand(I)), this.g.audio.play("zip", { volume: 0.35 });
  }
  drop(A) {
    let I = this.hand;
    if (!I) return;
    let g = this.g.player.camera, C = new y(0, 0, -1).applyQuaternion(g.quaternion), Q;
    if (I.body) {
      let E = I.body.translation();
      Q = new y(E.x, E.y, E.z);
    } else Q = g.position.clone().addScaledVector(C, 0.6).add(new y(0, -0.15, 0));
    let i = this.g.physics.castRay(g.position, C, 0.8, 4294901761);
    if (i && !I.body && (Q = g.position.clone().addScaledVector(C, Math.max(0.15, i.timeOfImpact - 0.25))), this.setHand(null), I.body) I.body.setGravityScale(1, true), A && I.body.applyImpulse({ x: C.x * 9 * Math.min(I.mass, 4), y: (C.y + 0.25) * 9 * Math.min(I.mass, 4), z: C.z * 9 * Math.min(I.mass, 4) }, true), I.held = false;
    else {
      let E = new nI().setFromEuler(new $I(0, this.g.player.yaw, 0));
      this.g.items.place(I, Q, E, A ? C.clone().multiplyScalar(9).add(new y(0, 2, 0)) : C.clone().multiplyScalar(1));
    }
    this.g.audio.play("throw", { volume: A ? 0.6 : 0.3 });
  }
  pick() {
    let A = this.g, I = A.player.camera;
    _t.set(I.position, new y(0, 0, -1).applyQuaternion(I.quaternion)), _t.far = A.player.car ? 1.4 : 2.7, _t.near = 0.05;
    let g = [], C = I.position;
    for (let t of A.items.items) !t.held && !t.inInventory && t.materialized && t.obj.position.distanceToSquared(C) < 25 && g.push(t.obj);
    for (let t of A.cars) t.visual.root.position.distanceToSquared(C) < 64 && g.push(t.visual.root);
    for (let t of A.worldgen.built.values()) if (t.active) {
      for (let o of t.doors) g.push(o.pivot);
      for (let o of t.interacts) g.push(o.obj);
    }
    for (let t of A.enemies.list) t.obj.position.distanceToSquared(C) < 100 && g.push(t.obj);
    let Q = _t.intersectObjects(g, true), i = A.physics.castRay(I.position, _t.ray.direction, _t.far, 4294901761), E = i ? i.timeOfImpact : 1 / 0;
    for (let t of Q) {
      let o = t.object, e = o.userData;
      if (e.item && e.item !== this.hand) {
        if (t.distance > E + 0.15) continue;
        return { kind: "item", item: e.item, point: t.point, dist: t.distance, obj: e.item.obj };
      }
      if (e.door) return { kind: "door", door: e.door, point: t.point, dist: t.distance, obj: e.door.pivot };
      if (e.interact) return { kind: "poi", poi: e.interact, point: t.point, dist: t.distance, obj: e.interact.obj };
      if (e.enemy) return { kind: "enemy", point: t.point, dist: t.distance };
      let s = null, a, n, r, c;
      for (; o; ) {
        if (!a && o.userData.slot && (a = o.userData.slot, r = o), !n && o.userData.control && (n = o.userData.control, c = o), o.userData.car) {
          s = o.userData.car;
          break;
        }
        o = o.parent;
      }
      if (s) return n && n !== "body" ? { kind: "carctl", car: s, control: n, point: t.point, dist: t.distance, obj: n === "dome" ? void 0 : c } : a ? { kind: "carpart", car: s, slot: a, point: t.point, dist: t.distance, obj: r } : { kind: "carbody", car: s, point: t.point, dist: t.distance };
    }
    return { kind: "none", point: new y(), dist: 99 };
  }
  findSlot() {
    let A = this.hand;
    if (!A || !A.part) return null;
    let I = this.g.player.camera, g = new y(0, 0, -1).applyQuaternion(I.quaternion), C = null, Q = 0.75;
    for (let i of this.g.cars) if (!(i.visual.root.position.distanceTo(I.position) > 7)) for (let E of Object.keys(QC)) {
      if (!i.canAttach(E, A.part.kind) || (E === "engine" || E === "battery" || E === "radiator") && !i.isOpen("hood")) continue;
      let t = i.localToWorld(QC[E]), o = t.clone().sub(I.position), e = o.dot(g);
      if (e < 0.2 || e > 3.2) continue;
      let s = o.clone().addScaledVector(g, -e).length();
      s < Q && (Q = s, C = { kind: "slot", car: i, slot: E, point: t, dist: e });
    }
    return C;
  }
  update(A) {
    let I = this.g, g = I.input;
    this.acts = [];
    let C = "", Q = [], i = I.ui.lang, E = (n) => this.acts.push(n), t = I.player.dead ? { kind: "none", point: new y(), dist: 99 } : this.findSlot() ?? this.pick();
    this.lastHit = t;
    let o = this.hand, e = t.car;
    if (t.kind === "slot" && e && t.slot && o?.part) C = `${J("Установить", "Install")}: ${hi(pQ[t.slot], t.slot, i)}`, E({ btn: "LMB", key: "ЛКМ", label: J("Установить", "Install"), hold: JQ[o.part.kind].bolted ? 1.2 : 0.3, done: () => this.installPart(e, t.slot) });
    else if (t.kind === "item" && t.item) {
      let n = t.item;
      C = this.itemName(n), Q.push(...this.itemInfo(n)), o || E({ btn: "LMB", key: "ЛКМ", label: J("Взять", "Pick up"), run: () => this.take(n) }), n.def.storable && this.slots.includes(null) && E({ btn: "E", key: "E", label: J("В карман", "Pocket"), run: () => this.storeToSlot(n) }), n.def.container && !n.def.breakable && E({ btn: "E", key: "E", label: J("Открыть", "Open"), run: () => I.combat.breakContainer(n) }), n.def.id === "box" && E({ btn: "E", key: "E", label: J("Открыть", "Open"), run: () => I.combat.breakContainer(n) }), n.def.tool === "note" && E({ btn: "E", key: "E", label: J("Читать", "Read"), run: () => I.ui.showNote(n.state.text ?? "note") }), o?.def.liquid && n.def.liquid && o !== n && (n.state.liquid && (n.state.amount ?? 0) > 0 && E({ btn: "LMB", key: "ЛКМ", label: J("Набрать", "Fill"), hold: 999, tick: (c) => this.transfer(n, o, c) }), o.state.liquid && (o.state.amount ?? 0) > 0 && E({ btn: "RMB", key: "ПКМ", label: J("Перелить", "Pour in"), hold: 999, tick: (c) => this.transfer(o, n, c) }));
    } else (t.kind === "carpart" || t.kind === "carctl" || t.kind === "carbody") && e ? this.carTarget(t, E, Q, (n) => C = n) : t.kind === "door" && t.door ? (C = t.door.def.kind === "gate" ? J("Ворота", "Gate") : J("Дверь", "Door"), E({ btn: "E", key: "E", label: t.door.target > 0.5 ? J("Закрыть", "Close") : J("Открыть", "Open"), run: () => {
      let n = I.worldgen.toggleDoor(t.door);
      I.audio.play(n ? "door_open" : "door_close", { pos: t.point, volume: 0.7 });
    } })) : t.kind === "poi" && t.poi && this.poiTarget(t, E, Q, (n) => C = n);
    if (o && !this.acts.some((n) => n.btn === "LMB")) {
      let n = o.def;
      n.food ? E({ btn: "LMB", key: "ЛКМ", label: n.tool === "medkit" ? J("Использовать", "Use") : n.food.sound === "drink" ? J("Выпить", "Drink") : J("Съесть", "Eat"), hold: n.food.time, done: () => this.eat(o) }) : n.liquid?.drinkable && o.state.liquid === "water" && (o.state.amount ?? 0) > 0.05 ? E({ btn: "LMB", key: "ЛКМ", label: J("Пить", "Drink"), hold: 999, tick: (r) => this.drink(o, r) }) : n.tool === "gun" ? E({ btn: "LMB", key: "ЛКМ", label: J("Выстрел", "Fire"), run: () => I.combat.shoot(o) }) : n.weapon ? E({ btn: "LMB", key: "ЛКМ", label: J("Удар", "Swing"), run: () => this.meleeSwing(o) }) : n.tool === "light" ? E({ btn: "LMB", key: "ЛКМ", label: J("Фонарь", "Light"), run: () => this.toggleFlash() }) : n.tool === "note" && E({ btn: "LMB", key: "ЛКМ", label: J("Читать", "Read"), run: () => I.ui.showNote(o.state.text ?? "note") });
    }
    o && yu(o) && !this.acts.some((n) => n.btn === "RMB") && E({ btn: "RMB", key: "ПКМ", label: J("Бросить", "Throw"), run: () => this.drop(true) }), o?.def.tool === "gun" && !this.acts.some((n) => n.btn === "RMB") && E({ btn: "RMB", key: "ПКМ", label: J("Прицел", "Aim") });
    let s = (n) => n === "LMB" ? g.mouseDown(0) : n === "RMB" ? g.mouseDown(2) : g.down("interact"), a = (n) => n === "LMB" ? g.mousePressed(0) : n === "RMB" ? g.mousePressed(2) : g.pressedA("interact");
    if (this.holding) {
      let n = this.holding;
      if (!s(n.btn) || !this.acts.some((r) => r.label === n.label && r.btn === n.btn)) this.cancelHold();
      else if (n.tick) this.holdT += A, n.tick(A) || this.cancelHold();
      else if (this.holdT += A, this.holdT >= this.holdMax) {
        let r = n.done;
        this.cancelHold(), r?.();
      }
    } else for (let n of this.acts) if (a(n.btn)) {
      n.hold || n.tick ? (this.holding = n, this.holdT = 0, this.holdMax = n.hold ?? 999, n.btn === "LMB" && (n.label.includes("Открутить") || n.label.includes("Remove") || n.label.includes("Снять")) && I.audio.play("ratchet", { volume: 0.5 })) : n.run?.();
      break;
    }
    o?.def.tool === "gun" && (this.aiming = g.mouseDown(2) && !I.player.car), g.pressedA("drop") && o && this.drop(false), g.pressedA("reload") && o?.def.tool === "gun" && !I.player.car && I.combat.reload(o, this);
    for (let n = 0; n < 4; n++) g.pressedA("slot" + (n + 1)) && this.slotKey(n);
    g.pressedA("flashlight") && !I.player.car && this.toggleFlash(), g.mouse.wheel && o?.body && (this.holdDist = yI(this.holdDist - g.mouse.wheel * 0.12, 0.4, 1.8)), !this.acts.length && (t.kind === "none" || t.kind === "carbody" || !C) ? this.target = null : this.target = { name: C, info: Q, actions: this.acts.map((n) => ({ key: n.key, label: n.label, hold: n.hold })) }, I.post.outline.selection = this.acts.length && t.obj && t.kind !== "slot" ? [t.obj] : [], this.updateGhost(t.kind === "slot" && o?.part ? t : null), this.updateHand(A);
  }
  ghost = null;
  updateGhost(A) {
    let I = A?.car && A.slot ? { car: A.car, slot: A.slot } : null;
    if (this.ghost && (!I || I.car !== this.ghost.car || I.slot !== this.ghost.slot) && (this.ghost.obj.parent?.remove(this.ghost.obj), this.ghost = null), I && !this.ghost) {
      let g = bk(I.slot);
      g.position.copy(QC[I.slot]), I.car.visual.root.add(g), this.ghost = { ...I, obj: g };
    }
    if (this.ghost) {
      let g = this.ghost.obj.userData.mat;
      g.opacity = 0.22 + 0.1 * Math.sin(performance.now() * 6e-3);
    }
  }
  cancelHold() {
    this.holding = null, this.holdT = 0, this.holdMax = 0, this.pouring && (this.pouring = null, this.g.audio.stopPour());
  }
  carTarget(A, I, g, C) {
    let Q = this.g, i = A.car, E = this.hand, t = Q.ui.lang, o = Q.player.car === i, e = E?.def.tool === "wrench";
    if (A.kind === "carctl") {
      let l = A.control;
      l === "key" ? (C(J("Замок зажигания", "Ignition")), g.push(i.running ? J("Двигатель работает", "Engine running") : i.ignition ? J("Зажигание включено", "Ignition on") : J("Выключено", "Off")), I({ btn: "LMB", key: "ЛКМ", label: i.running ? J("Заглушить", "Stop engine") : J("Завести (удерживать)", "Start (hold)"), hold: 999, tick: () => i.running && this.holdT < 0.05 ? (i.setIgnition(false), false) : (i.setCrank(true), !i.running) }), I({ btn: "RMB", key: "ПКМ", label: i.ignition ? J("Выкл. зажигание", "Ignition off") : J("Вкл. зажигание", "Ignition on"), run: () => {
        i.setIgnition(!i.ignition), Q.audio.play("key_turn", { volume: 0.5 });
      } })) : l === "radio" ? (C(J("Радио", "Radio")), g.push(i.radioOn ? `${i.radioFreq.toFixed(1)} MHz · ${Q.audio.radio.stationName || J("помехи", "static")}` : J("Выключено", "Off")), I({ btn: "LMB", key: "ЛКМ", label: i.radioOn ? J("Выключить", "Turn off") : J("Включить", "Turn on"), run: () => {
        i.radioOn = !i.radioOn, Q.audio.play("click", { volume: 0.5 });
      } }), I({ btn: "E", key: J("Колесо", "Wheel"), label: J("Настройка", "Tune") }), Q.input.mouse.wheel && (i.radioFreq = yI(i.radioFreq - Q.input.mouse.wheel * 0.1, 87.5, 108))) : l === "glovebox" ? (C(J("Бардачок", "Glovebox")), I({ btn: "E", key: "E", label: i.gloveboxOpen ? J("Закрыть", "Close") : J("Открыть", "Open"), run: () => {
        i.gloveboxOpen = !i.gloveboxOpen, Q.audio.play("latch", { volume: 0.5 });
      } })) : l === "fuelcap" ? this.fuelCapTarget(i, I, g, C) : l === "dome" && (C(J("Плафон салона", "Dome light")), g.push([J("По дверям", "Door-operated"), J("Включён", "On"), J("Выключен", "Off")][i.domeMode]), I({ btn: "E", key: "E", label: J("Переключить", "Switch"), run: () => {
        i.domeMode = (i.domeMode + 1) % 3, Q.audio.play("switch", { volume: 0.4 });
      } }));
      return;
    }
    if (A.kind === "carbody") {
      let l = i.worldToLocal(A.point);
      if (l.x > 0.8 && l.z < -1.62 && l.z > -1.98 && l.y > 0.68 && l.y < 0.98) return this.fuelCapTarget(i, I, g, C);
      o || this.seatActions(i, l, I), this.acts.length && C(J("Кузов", "Body"));
      return;
    }
    let s = A.slot, a = i.parts[s];
    if (!a) return;
    let n = pQ[s];
    C(hi(n, s, t)), g.push(`${J("Состояние", "Condition")}: ${Math.round(a.cond * 100)}%${a.flat ? " · " + J("спущено", "flat") : ""}`);
    let r = s.startsWith("door") || s === "hood" || s === "trunk", c = i.worldToLocal(A.point);
    if (s === "engine") {
      let l = i.anchor("oil");
      g.push(`${J("Масло", "Oil")}: ${(a.oil ?? 0).toFixed(1)} / ${ai} ${J("л", "L")}`), c.distanceTo(l) < 0.16 && (C(J("Крышка маслозаливной горловины", "Oil filler cap")), I({ btn: "E", key: "E", label: i.capsOpen.oil ? J("Закрыть", "Close") : J("Открыть", "Open"), run: () => {
        i.capsOpen.oil = !i.capsOpen.oil, Q.audio.play("cap_open", { volume: 0.5 });
      } }), i.capsOpen.oil && E?.def.liquid && E.state.liquid && (E.state.amount ?? 0) > 0 && I({ btn: "LMB", key: "ЛКМ", label: J("Залить", "Pour"), hold: 999, tick: (U) => this.pourInto(E, "oil", i, U) }));
    }
    if (s === "radiator" && (g.push(`${J("Охлаждающая жидкость", "Coolant")}: ${(a.coolant ?? 0).toFixed(1)} / ${NQ} ${J("л", "L")}`), C(J("Радиатор", "Radiator")), I({ btn: "E", key: "E", label: i.capsOpen.radiator ? J("Закрыть крышку", "Close cap") : J("Открыть крышку", "Open cap"), run: () => {
      i.capsOpen.radiator = !i.capsOpen.radiator, Q.audio.play("cap_open", { volume: 0.5 });
    } }), i.capsOpen.radiator && E?.def.liquid && E.state.liquid && (E.state.amount ?? 0) > 0 && I({ btn: "LMB", key: "ЛКМ", label: J("Залить", "Pour"), hold: 999, tick: (l) => this.pourInto(E, "radiator", i, l) })), s === "battery" && g.push(`${J("Заряд", "Charge")}: ${Math.round((a.charge ?? 0) * 100)}% · ${(10.5 + (a.charge ?? 0) * 2.2).toFixed(1)} V`), r && !o && I({ btn: "E", key: "E", label: i.isOpen(s) ? J("Закрыть", "Close") : J("Открыть", "Open"), run: () => {
      let l = i.toggleHinge(s);
      Q.audio.play(s === "hood" ? l ? "hood_open" : "hood_close" : s === "trunk" ? l ? "trunk_open" : "trunk_close" : l ? "door_open" : "door_close", { pos: A.point });
    } }), s.startsWith("seat") && !o && this.seatActions(i, c, I, s), s.startsWith("door") && !o) {
      let l = s === "door_fl" ? "driver" : s === "door_fr" ? "passenger" : null;
      l && I({ btn: "E", key: "F", label: l === "driver" ? J("Сесть за руль", "Drive") : J("Сесть", "Sit"), run: () => Q.enterCar(i, l) });
    }
    this.acts.some((l) => l.key === "F") && Q.input.pressedA("flashlight") && this.acts.find((U) => U.key === "F")?.run?.();
    let h = JQ[a.kind];
    (s === "engine" || s === "battery" || s === "radiator") && !i.isOpen("hood") && i.parts.hood || o || (h.bolted ? e ? I({ btn: "LMB", key: "ЛКМ", label: J("Открутить", "Unbolt"), hold: s === "engine" ? 4 : s.startsWith("wheel") ? 2.2 : 1.6, done: () => this.removePart(i, s) }) : g.push(J("Нужен гаечный ключ", "Needs a wrench")) : E || I({ btn: "LMB", key: "ЛКМ", label: J("Снять", "Remove"), hold: 0.6, done: () => this.removePart(i, s) }), E?.def.tool === "repair" && a.cond < 0.99 && I({ btn: "RMB", key: "ПКМ", label: J("Починить", "Repair"), hold: 2.5, done: () => this.repair(E, a) }));
  }
  seatActions(A, I, g, C) {
    let Q = this.g, i = (t) => !A.parts[t] || A.isOpen(t), E = I.x > 0;
    I.z > -0.9 && I.z < 0.8 && (E && (i("door_fl") || C === "seat_d") && g({ btn: "E", key: "E", label: J("Сесть за руль", "Drive"), run: () => Q.enterCar(A, "driver") }), !E && (i("door_fr") || C === "seat_p") && g({ btn: "E", key: "E", label: J("Сесть", "Sit"), run: () => Q.enterCar(A, "passenger") }));
  }
  fuelCapTarget(A, I, g, C) {
    let Q = this.hand;
    C(J("Бензобак", "Fuel tank")), g.push(`${J("Топливо", "Fuel")}: ${A.fuelTotal.toFixed(1)} / ${ni} ${J("л", "L")}`), A.fuel.diesel + A.fuel.water > 0.3 && g.push(J("Примеси в топливе!", "Fuel is contaminated!")), I({ btn: "E", key: "E", label: A.capsOpen.fuel ? J("Закрыть крышку", "Close cap") : J("Открыть крышку", "Open cap"), run: () => {
      A.capsOpen.fuel = !A.capsOpen.fuel, this.g.audio.play("cap_open", { volume: 0.5 });
    } }), A.capsOpen.fuel && Q?.def.liquid && (Q.state.liquid && (Q.state.amount ?? 0) > 0 && I({ btn: "LMB", key: "ЛКМ", label: J("Залить", "Pour"), hold: 999, tick: (i) => this.pourInto(Q, "fuel", A, i) }), A.fuelTotal > 0.05 && (Q.state.amount ?? 0) < Q.def.liquid.cap && I({ btn: "RMB", key: "ПКМ", label: J("Слить (шланг)", "Siphon"), hold: 999, tick: (i) => this.siphon(A, Q, i) }));
  }
  poiTarget(A, I, g, C) {
    let Q = this.g, i = A.poi, E = this.hand;
    switch (i.kind) {
      case "pump": {
        let t = i.data;
        if (C(`${J("Колонка", "Fuel pump")} · ${t.kind === "diesel" ? J("Дизель", "Diesel") : "АИ-76"}`), g.push(`${J("Цена", "Price")}: $${t.price.toFixed(2)} / ${J("л", "L")}`), g.push(t.fuel > 0 ? `${J("В резервуаре", "In tank")}: ${Math.round(t.fuel)} ${J("л", "L")}` : J("Резервуар пуст", "Tank empty")), g.push(`${J("Ваши деньги", "Your money")}: $${this.totalMoney().toFixed(0)}`), t.fuel > 0) {
          E?.def.liquid && (!E.state.liquid || E.state.liquid === t.kind) && I({ btn: "LMB", key: "ЛКМ", label: J("Наполнить канистру", "Fill container"), hold: 999, tick: (e) => this.pumpFill(i, e, E) });
          let o = Q.playerCar;
          o && o.visual.root.position.distanceTo(A.point) < 7 && I({ btn: "E", key: "E", label: J("Заправить машину", "Refuel car"), hold: 999, tick: (e) => this.pumpFill(i, e, null, o) });
        }
        break;
      }
      case "well":
      case "tap":
        C(i.kind === "well" ? J("Колодец", "Well") : J("Кран", "Tap")), I({ btn: "E", key: "E", label: J("Попить", "Drink"), hold: 1.2, done: () => {
          Q.player.stats.thirst = Math.min(100, Q.player.stats.thirst + 30), Q.audio.play("gulp");
        } }), E?.def.liquid && (!E.state.liquid || E.state.liquid === "water") && I({ btn: "LMB", key: "ЛКМ", label: J("Набрать воды", "Fill water"), hold: 999, tick: (t) => this.fillFrom(E, "water", t) });
        break;
      case "bed":
        C(J("Кровать", "Bed")), g.push(`${J("Бодрость", "Energy")}: ${Math.round(Q.player.stats.energy)}%`), I({ btn: "E", key: "E", label: J("Спать", "Sleep"), run: () => Q.sleep() });
        break;
      case "mailbox":
        C(J("Почтовый ящик", "Mailbox")), I({ btn: "E", key: "E", label: J("Открыть", "Open"), run: () => Q.ui.showNote("letter") });
        break;
      case "sign":
        C(J("ОСТОРОЖНО, МИНЫ!", "DANGER: MINES!")), g.push(J("Территория заминирована", "Minefield ahead"));
        break;
    }
  }
  removePart(A, I) {
    let g = A.detach(I);
    if (!g) return;
    let C = this.g;
    C.audio.play("bolt_loosen", { pos: A.localToWorld(QC[I]) });
    let Q = A.localToWorld(QC[I]), i = A.visual.root.quaternion.clone(), E = C.items.spawn("part", Q.x + C.physics.originX, Q.y, Q.z + C.physics.originZ, i, { part: g.state }, { partVisual: g.visual });
    E.touched = true, !this.hand && !JQ[g.state.kind].heavy && this.take(E), C.ui.toast(`${hi(g.state.kind, I, C.ui.lang)} — ${J("снято", "removed")}`), C.hints.trigger("partRemoved");
  }
  installPart(A, I) {
    let g = this.hand;
    if (!g?.part) return;
    let C = this.g, Q = g.partVisual;
    this.setHand(null), C.items.remove(g), Q && Q.root.position.set(0, 0, 0), A.attach(I, g.part, Q ?? void 0), C.audio.play("bolt_tighten", { pos: A.localToWorld(QC[I]) }), C.ui.toast(`${hi(g.part.kind, I, C.ui.lang)} — ${J("установлено", "installed")}`), C.hints.trigger("partInstalled:" + g.part.kind);
  }
  repair(A, I) {
    let g = A.def.id === "repairkit" ? 0.35 : 0.12;
    I.cond = Math.min(1, I.cond + g), I.flat && A.def.id === "repairkit" && (I.flat = false), A.state.used = (A.state.used ?? 0) + 1, this.g.audio.play("wrench_clank"), A.state.used >= (A.def.id === "repairkit" ? 4 : 3) && this.consume(A);
  }
  eat(A) {
    let I = A.def.food, g = this.g.player.stats;
    g.hunger = yI(g.hunger + I.hunger, 0, 100), g.thirst = yI(g.thirst + I.thirst, 0, 100), I.energy && (g.energy = yI(g.energy + I.energy, 0, 100)), I.health && (g.health = yI(g.health + I.health, 0, 100)), this.g.audio.play(I.sound === "drink" ? "drink" : "eat"), this.consume(A);
  }
  drink(A, I) {
    let g = this.g.player.stats, C = Math.min(A.state.amount ?? 0, I * 0.25);
    return C <= 0 || g.thirst >= 100 ? false : (A.state.amount = (A.state.amount ?? 0) - C, g.thirst = Math.min(100, g.thirst + C * 70), Math.random() < I * 2 && this.g.audio.play("gulp", { volume: 0.6 }), (A.state.amount ?? 0) <= 0.01 && (A.state.amount = 0, A.state.liquid = null), this.refreshHandModel(), true);
  }
  startPour(A, I) {
    this.pouring || (this.pouring = { liquid: A, target: I }, this.g.audio.startPour());
  }
  pourInto(A, I, g, C) {
    let Q = A.state.liquid;
    if (!Q) return false;
    let i = A.def.liquid.rate, E = Math.min(A.state.amount ?? 0, i * C);
    if (E <= 0) return false;
    let t = 0;
    if (I === "fuel") t = g.addFuel(Q, E), Q !== "petrol" && this.g.hints.trigger("wrongFuel");
    else if (I === "oil") {
      let o = g.parts.engine;
      if (!o) return false;
      let e = ai - (o.oil ?? 0);
      t = Math.min(e, E), Q === "oil" ? o.oil = (o.oil ?? 0) + t : t > 0 && (o.cond = Math.max(0, o.cond - t * 0.05));
    } else {
      let o = g.parts.radiator;
      if (!o) return false;
      t = Math.min(NQ - (o.coolant ?? 0), E), Q === "water" ? o.coolant = (o.coolant ?? 0) + t : t > 0 && (o.coolant = (o.coolant ?? 0) + t * 0.3, o.cond = Math.max(0, o.cond - t * 0.02));
    }
    return t <= 1e-4 ? false : (A.state.amount = (A.state.amount ?? 0) - t, (A.state.amount ?? 0) <= 5e-3 && (A.state.amount = 0, A.state.liquid = null), this.startPour(Q, I), g.updateMass(), true);
  }
  transfer(A, I, g) {
    let C = A.state.liquid;
    if (!C || !I.def.liquid || I.state.liquid && I.state.liquid !== C && (I.state.amount ?? 0) > 0.01) return false;
    let Q = I.def.liquid.cap - (I.state.amount ?? 0), i = Math.min(A.state.amount ?? 0, Q, Math.max(A.def.liquid.rate, I.def.liquid.rate) * g);
    return i <= 1e-4 ? false : (A.state.amount = (A.state.amount ?? 0) - i, I.state.amount = (I.state.amount ?? 0) + i, I.state.liquid = C, (A.state.amount ?? 0) <= 5e-3 && (A.state.amount = 0, A.state.liquid = null), this.startPour(C, "container"), this.refreshHandModel(), true);
  }
  siphon(A, I, g) {
    let C = I.def.liquid.cap - (I.state.amount ?? 0), Q = A.fuelTotal;
    if (Q <= 0.01 || C <= 1e-3) return false;
    let i = A.fuel.petrol >= A.fuel.diesel ? "petrol" : "diesel";
    if (I.state.liquid && I.state.liquid !== i && (I.state.amount ?? 0) > 0.01) return false;
    let E = Math.min(C, Q, 0.6 * g), t = E / Q;
    return A.fuel.petrol -= A.fuel.petrol * t, A.fuel.diesel -= A.fuel.diesel * t, A.fuel.water -= A.fuel.water * t, I.state.amount = (I.state.amount ?? 0) + E, I.state.liquid = i, A.modified = true, this.startPour(i, "container"), true;
  }
  pumpFill(A, I, g, C) {
    let Q = A.data;
    if (Q.fuel <= 0) return this.g.ui.toast(J("Колонка пуста", "Pump is empty")), false;
    let i = 2.2 * I, E = 0;
    g ? E = g.def.liquid.cap - (g.state.amount ?? 0) : C && (E = ni - C.fuelTotal);
    let t = Math.min(i, E, Q.fuel);
    if (t <= 1e-4) return false;
    let o = t * Q.price;
    return this.spendMoney(o) ? (Q.fuel -= t, this.g.worldgen.pumpFuel.set(A.key, Q.fuel), g ? (g.state.amount = (g.state.amount ?? 0) + t, g.state.liquid = Q.kind) : C && C.addFuel(Q.kind, t), this.g.audio.pumpLoop(true), this.startPour(Q.kind, "pump"), true) : (this.g.ui.toast(J("Недостаточно денег", "Not enough money")), false);
  }
  fillFrom(A, I, g) {
    let C = A.def.liquid.cap - (A.state.amount ?? 0), Q = Math.min(C, 1.2 * g);
    return Q <= 1e-4 ? false : (A.state.amount = (A.state.amount ?? 0) + Q, A.state.liquid = I, this.startPour(I, "water"), this.refreshHandModel(), true);
  }
  refreshHandModel() {
    let A = this.hand;
    if (!A || A.def.id !== "water") return;
    let I = Math.round((A.state.amount ?? 0) * 10);
    if (A.obj.userData.fillT === I) return;
    let g = A.def.build(this.g.mats, A.state), C = A.obj.parent, Q = A.obj.position.clone(), i = A.obj.quaternion.clone();
    C?.remove(A.obj), g.position.copy(Q), g.quaternion.copy(i), g.traverse((E) => E.userData.item = A), g.userData.fillT = I, A.obj = g, C?.add(g);
  }
  toggleFlash() {
    this.has("light") && (this.flashOn = !this.flashOn, this.g.audio.play("switch", { volume: 0.5 }));
  }
  meleeSwing(A) {
    this.swingCool > 0 || (this.swingCool = A.def.weapon.rate, this.swing = 1, this.g.audio.play("swing", { volume: 0.6 }), setTimeout(() => this.g.combat.melee(A), 120));
  }
  updateHand(A) {
    let I = this.g, g = this.hand;
    if (this.swingCool = Math.max(0, this.swingCool - A), this.swing = Math.max(0, this.swing - A * 3.2), this.recoil = Math.max(0, this.recoil - A * 5), this.has("light") || (this.flashOn = false), this.flashlight.intensity = this.flashOn ? 60 : 0, this.flashlight.visible = this.flashOn, this.updateArms(A), !!g) {
      if (g.obj.parent === this.handObj) {
        let Q = I.player.bob, i = I.player.vel.length() > 0.5 ? 1 : 0, E = Math.sin(Q * Math.PI) * 0.012 * i, t = Math.abs(Math.cos(Q * Math.PI)) * 0.01 * i, o = 0.24, e = -0.22, s = -0.46, a = 0, n = -0.35, r = 0;
        g.def.tool === "gun" && (o = this.aiming ? 0 : 0.18, e = this.aiming ? -0.1 : -0.17, s = this.aiming ? -0.38 : -0.42, n = this.aiming ? 0 : -0.08, a = this.recoil * 0.5, s += this.recoil * 0.05), g.def.weapon && g.def.tool !== "gun" && (a = -0.3 - Math.sin(this.swing * Math.PI) * 1.4, r = 0.3, e += Math.sin(this.swing * Math.PI) * 0.05), g.def.tool === "light" && (o = 0.2, e = -0.2, s = -0.4, n = 0), I.player.car && (e -= 0.06), this.handObj.position.set(o + E, e + t, s), this.handObj.rotation.set(a, n, r), this.g.player.camera.fov = KI(this.g.player.camera.fov, this.aiming ? I.baseFov * 0.72 : I.baseFov, 10, A);
      } else if (g.body) {
        let Q = I.player.camera, i = new y(0, 0, -1).applyQuaternion(Q.quaternion), E = Q.position.clone().addScaledVector(i, this.holdDist + Math.max(g.half.x, g.half.z) * 0.8).add(new y(0, -0.15, 0)), t = I.physics.castRay(E.clone().setY(E.y + 1.5), new y(0, -1, 0), 3, 4294901761);
        t && (E.y = Math.max(E.y, E.y + 1.5 - t.timeOfImpact + g.half.y + 0.03));
        let o = g.body.translation(), e = new y(o.x, o.y, o.z), s = E.sub(e);
        if (s.length() > 2.4) {
          this.drop(false);
          return;
        }
        let a = g.mass > 30, n = a ? 5 : 12, r = s.multiplyScalar(n);
        r.length() > 12 && r.setLength(12), g.body.setLinvel({ x: r.x, y: r.y, z: r.z }, true);
        let c = new nI().setFromEuler(new $I(0, I.player.yaw, 0)), h = g.body.rotation(), D = new nI(h.x, h.y, h.z, h.w), l = c.clone().multiply(D.clone().invert());
        l.w < 0 && (l.x *= -1, l.y *= -1, l.z *= -1, l.w *= -1);
        let U = 2 * Math.acos(yI(l.w, -1, 1)), S = Math.sqrt(1 - l.w * l.w), K = (S > 1e-4 ? new y(l.x / S, l.y / S, l.z / S) : new y()).multiplyScalar(U * (a ? 3 : 6));
        g.body.setAngvel({ x: K.x, y: K.y, z: K.z }, true);
      }
    }
  }
  updateArms(A) {
    let I = this.g, g = this.hand, C = this.lastHit, Q = "idle", i = false;
    I.player.car ? (Q = I.player.seat === "driver" ? "drive" : "hidden", i = C?.kind === "carctl" && C.control === "key" && this.holding !== null) : g && g.obj.parent === this.handObj ? Q = "hold" : g?.body ? Q = "carry" : this.acts.length && C && (Q = C.kind === "carctl" || C.kind === "poi" ? "point" : "hover"), this.hands.update(A, Q, { item: g, handObj: this.handObj, carried: g?.body ? g : null, reachKey: i, holdDist: this.holdDist });
  }
  kickRecoil() {
    this.recoil = 1;
  }
  itemName(A) {
    let I = this.g.ui.lang;
    return A.part ? hi(A.part.kind, Ch[A.part.kind], I) : A.def.name[I === "ru" ? 0 : 1];
  }
  itemInfo(A) {
    let I = [], g = A.state, C = this.g.ui.lang;
    return A.def.liquid && I.push(g.liquid && (g.amount ?? 0) > 0.01 ? `${Ry[g.liquid][C === "ru" ? 0 : 1]}: ${(g.amount ?? 0).toFixed(1)} / ${A.def.liquid.cap} ${J("л", "L")}` : J("Пусто", "Empty")), A.def.money && I.push(`$${(g.money ?? 0).toFixed(0)}`), A.def.ammo && I.push(`${g.ammo ?? 0} ${J("шт.", "rounds")}`), A.def.tool === "gun" && I.push(`${J("Заряжено", "Loaded")}: ${g.loaded ?? 0}/6`), A.part && (I.push(`${J("Состояние", "Condition")}: ${Math.round(A.part.cond * 100)}%`), A.part.kind === "engine" && I.push(`${J("Масло", "Oil")}: ${(A.part.oil ?? 0).toFixed(1)} ${J("л", "L")}`), A.part.kind === "battery" && I.push(`${J("Заряд", "Charge")}: ${Math.round((A.part.charge ?? 0) * 100)}%`), A.part.kind === "radiator" && I.push(`${J("Вода", "Water")}: ${(A.part.coolant ?? 0).toFixed(1)} ${J("л", "L")}`), A.part.flat && I.push(J("Колесо спущено", "Flat tyre"))), I;
  }
};
function yu(B) {
  return B.def.tool !== "gun";
}
var rM = { intro: () => J("Мать оставила письмо на столе в доме. Наведите прицел на предмет: <b>ЛКМ</b> — взять, <b>E</b> — действие.", "Your mother left a letter on the table in the house. Aim at an object: <b>LMB</b> to take, <b>E</b> to interact."), letter: () => J("Машина в гараже. Возьмите аккумулятор с верстака, откройте капот (<b>E</b>) и поднесите деталь к пустому месту — <b>ЛКМ</b>, чтобы установить.", "The car is in the garage. Take the battery from the workbench, open the hood (<b>E</b>) and bring the part to the empty spot — <b>LMB</b> to install."), "partInstalled:battery": () => J("Аккумулятор на месте. Теперь бензин: откройте лючок бака сзади слева (<b>E</b>) и удерживайте <b>ЛКМ</b> с канистрой в руках.", "Battery installed. Now fuel: open the fuel door at the rear left (<b>E</b>) and hold <b>LMB</b> with the jerry can in hand."), firstCar: () => J("<b>I</b> — зажигание (удерживайте, чтобы крутить стартер). <b>W/S</b> — газ/тормоз, <b>Пробел</b> — ручник, <b>L</b> — фары, <b>N</b> — радио, <b>E</b> — выйти.", "<b>I</b> — ignition (hold to crank). <b>W/S</b> — throttle/brake, <b>Space</b> — handbrake, <b>L</b> — lights, <b>N</b> — radio, <b>E</b> — exit."), garageDoor: () => J("Ворота гаража открываются клавишей <b>E</b>.", "Open the garage gate with <b>E</b>."), partRemoved: () => J("Снятую деталь можно положить (<b>Q</b>) или установить на любую машину — поднесите её к пустому месту.", "A removed part can be dropped (<b>Q</b>) or installed on any car — bring it to an empty slot."), wrongFuel: () => J("Это не бензин! Примеси в баке заглушат мотор. Слейте топливо шлангом: <b>ПКМ</b> с пустой канистрой у открытого бака.", "That is not petrol! Contaminated fuel will stall the engine. Siphon it out: <b>RMB</b> with an empty can at the open filler."), lowFuel: () => J("Топливо на исходе. Ищите заправки вдоль трассы или сливайте бензин из брошенных машин.", "Fuel is running low. Look for gas stations along the highway or siphon petrol from abandoned cars."), overheat: () => J("Двигатель перегревается! Остановитесь, откройте капот и долейте воду в радиатор.", "The engine is overheating! Stop, open the hood and top up the radiator with water."), noBattery: () => J("Стартер молчит: нет аккумулятора или он разряжен. Заряд восстанавливается, пока мотор работает.", "The starter is silent: no battery or it is flat. It recharges while the engine runs."), noOil: () => J("Масла почти нет — двигатель может заклинить. Долейте масло под капотом.", "Oil is almost gone — the engine may seize. Top it up under the hood."), night: () => J("Темнеет. Включите фары (<b>L</b>) и фонарик (<b>F</b>). Ночью в пустыне выходят твари — держитесь машины.", "Night is falling. Use the headlights (<b>L</b>) and flashlight (<b>F</b>). Creatures roam the desert at night — stay near the car."), storm: () => J("Песчаная буря! Видимость падает до десятков метров. Сбавьте скорость или переждите в машине.", "Sandstorm! Visibility drops to a few dozen metres. Slow down or wait it out in the car."), rain: () => J("Дождь. Асфальт становится скользким — тормозите заранее. Воду можно набирать из колодцев.", "Rain. The asphalt gets slippery — brake early. Water can be drawn from wells."), thirst: () => J("Вас мучает жажда. Возьмите бутылку воды и нажмите <b>ЛКМ</b>, чтобы выпить, или найдите колодец.", "You are thirsty. Take a bottle of water and press <b>LMB</b> to drink, or find a well."), hunger: () => J("Вы голодны. Консервы попадаются в домах, мотелях и на заправках.", "You are hungry. Canned food can be found in houses, motels and gas stations."), tired: () => J("Вы устали. Поспите на кровати или в машине (<b>X</b> на сиденье).", "You are tired. Sleep in a bed or in the car (<b>X</b> while seated)."), enemy: () => J("Рядом враг! Бейте ближним оружием (<b>ЛКМ</b>), стреляйте или уезжайте.", "An enemy is close! Hit it with a melee weapon (<b>LMB</b>), shoot, or drive away."), gun: () => J("Револьвер: <b>ЛКМ</b> — выстрел, <b>ПКМ</b> — прицел, <b>R</b> — перезарядка (нужны патроны в кармане).", "Revolver: <b>LMB</b> — fire, <b>RMB</b> — aim, <b>R</b> — reload (needs ammo in a pocket)."), station: () => J("Заправка: наведитесь на колонку. <b>E</b> — заправить машину, <b>ЛКМ</b> — наполнить канистру. Топливо стоит денег.", "Gas station: aim at a pump. <b>E</b> — refuel the car, <b>LMB</b> — fill a can. Fuel costs money."), wreck: () => J("Брошенные машины — источник деталей и бензина. Гаечным ключом можно открутить почти всё (удерживайте <b>ЛКМ</b>).", "Abandoned cars are a source of parts and petrol. A wrench unbolts almost anything (hold <b>LMB</b>)."), inventory: () => J("Мелкие предметы убираются в карманы: <b>1–4</b> — положить/достать.", "Small items fit in pockets: <b>1–4</b> to stow/take out."), mines: () => J("Знак предупреждает о минах. Не сходите с дороги возле военных объектов.", "The sign warns of mines. Do not leave the road near military sites."), flatTire: () => J("Спущено колесо — машину тянет в сторону. Замените колесо: снимите ключом и поставьте другое.", "Flat tyre — the car pulls to one side. Replace it: unbolt with a wrench and fit another wheel.") }, kh = class {
  constructor(A) {
    this.g = A;
  }
  g;
  shown = /* @__PURE__ */ new Set();
  queue = [];
  cool = 0;
  checkT = 0;
  trigger(A) {
    this.shown.has(A) || this.queue.includes(A) || rM[A] && this.queue.push(A);
  }
  update(A) {
    let I = this.g;
    if (this.cool -= A, this.queue.length && this.cool <= 0) {
      let t = this.queue.shift();
      this.shown.has(t) || (this.shown.add(t), I.ui.hint(rM[t](), 11), I.audio.play("notify", { volume: 0.35 }), this.cool = 9);
    }
    if (this.checkT -= A, this.checkT > 0) return;
    this.checkT = 0.5;
    let g = I.player, C = g.stats;
    C.thirst < 30 && this.trigger("thirst"), C.hunger < 30 && this.trigger("hunger"), C.energy < 25 && this.trigger("tired"), I.env.night > 0.45 && this.trigger("night"), I.env.cur.sand > 0.4 && this.trigger("storm"), I.env.cur.rain > 0.4 && this.trigger("rain");
    let Q = I.playerCar;
    Q && (Q.running && Q.fuelTotal < 5 && this.trigger("lowFuel"), Q.temp > 110 && this.trigger("overheat"), Q.running && (Q.parts.engine?.oil ?? 1) < 0.6 && this.trigger("noOil"), g.car === Q && ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"].some((t) => Q.parts[t]?.flat) && this.trigger("flatTire"));
    let i = I.interaction.hand;
    i?.def.tool === "gun" && this.trigger("gun"), i?.def.storable && !I.interaction.slots.some(Boolean) && this.trigger("inventory");
    let E = g.camera.position;
    for (let t of I.enemies.list) if (t.alive && t.obj.position.distanceTo(E) < 22) {
      this.trigger("enemy");
      break;
    }
    for (let t of I.worldgen.built.values()) !t.active || Math.hypot(t.plan.x - (E.x + I.physics.originX), t.plan.z - (E.z + I.physics.originZ)) > 30 || (t.plan.type === "station" && this.trigger("station"), t.plan.type === "military" && this.trigger("mines"), t.wrecks.length && t.plan.type !== "homestead" && this.trigger("wreck"));
  }
};
function hM(B) {
  let A = B, I = A.isMesh ? new cA(A.geometry, A.material) : new WA();
  I.position.copy(B.position), I.quaternion.copy(B.quaternion), I.scale.copy(B.scale), I.visible = B.visible;
  for (let g of B.children) g.isLight || I.add(hM(g));
  return I;
}
var Mh = class {
  constructor(A, I = 112) {
    this.renderer = A;
    this.size = I;
    this.rt = new zI(I, I, { samples: 4, type: _g }), this.rt.texture.colorSpace = mg, this.canvas.width = this.canvas.height = I, this.ctx = this.canvas.getContext("2d"), this.buf = new Uint8Array(I * I * 4), this.img = this.ctx.createImageData(I, I);
    let g = new pi(16774368, 5917242, 1.1), C = new VQ(16773340, 1.9);
    C.position.set(2, 3, 2.5);
    let Q = new VQ(13162751, 0.9);
    Q.position.set(-2.5, 1, -2), this.scene.add(g, C, Q);
  }
  renderer;
  size;
  cache = /* @__PURE__ */ new Map();
  rt;
  scene = new mC();
  cam = new vg(26, 1, 0.01, 60);
  canvas = document.createElement("canvas");
  ctx;
  buf;
  img;
  key(A) {
    let I = A.state;
    return [A.def.id, A.part?.kind ?? "", I.liquid ?? "", I.color ?? "", I.label ?? ""].join("|");
  }
  get(A, I) {
    let g = this.key(A), C = this.cache.get(g);
    return C || (C = this.render(A.obj, I), this.cache.set(g, C), C);
  }
  render(A, I) {
    let g = hM(A);
    g.position.set(0, 0, 0), g.quaternion.identity(), g.scale.set(1, 1, 1), g.visible = true;
    let C = new WA();
    C.add(g), C.rotation.set(0.35, -0.75, 0.08), C.updateMatrixWorld(true);
    let Q = new Jg().setFromObject(C), i = Q.getCenter(new y()), E = Q.getSize(new y());
    C.position.sub(i);
    let o = (Math.max(E.x, E.y, E.z * 0.8) * 0.5 + 1e-3) / Math.tan(Ai.degToRad(this.cam.fov * 0.5)) * 1.12;
    this.cam.position.set(0, 0, o), this.cam.near = o * 0.05, this.cam.far = o * 4, this.cam.lookAt(0, 0, 0), this.cam.updateProjectionMatrix(), this.scene.add(C), this.scene.environment = I, this.scene.environmentIntensity = 0.6;
    let e = this.renderer, s = e.getRenderTarget(), a = e.getClearColor(new nA()), n = e.getClearAlpha(), r = e.shadowMap.autoUpdate;
    e.shadowMap.autoUpdate = false, e.setRenderTarget(this.rt), e.setClearColor(0, 0), e.clear(true, true, true), e.render(this.scene, this.cam), e.readRenderTargetPixels(this.rt, 0, 0, this.size, this.size, this.buf), e.setRenderTarget(s), e.setClearColor(a, n), e.shadowMap.autoUpdate = r, this.scene.remove(C);
    let c = this.size, h = this.img.data;
    for (let D = 0; D < c; D++) {
      let l = (c - 1 - D) * c * 4;
      h.set(this.buf.subarray(l, l + c * 4), D * c * 4);
    }
    return this.ctx.clearRect(0, 0, c, c), this.ctx.putImageData(this.img, 0, 0), this.canvas.toDataURL("image/png");
  }
};
var Ll = `
class Reso {
  constructor(){ this.x1=0; this.x2=0; this.y1=0; this.y2=0; this.set(100, 5, 44100); }
  set(f, q, sr){
    const w = 2*Math.PI*Math.min(f, sr*0.45)/sr, a = Math.sin(w)/(2*q), c = Math.cos(w);
    const a0 = 1 + a;
    this.b0 = a/a0; this.b1 = 0; this.b2 = -a/a0; this.a1 = -2*c/a0; this.a2 = (1-a)/a0;
  }
  run(x){
    const y = this.b0*x + this.b1*this.x1 + this.b2*this.x2 - this.a1*this.y1 - this.a2*this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}
class EngineProc extends AudioWorkletProcessor {
  constructor(){
    super();
    this.p = { rpm: 0, throttle: 0, load: 0, running: 0, crank: 0, crankStrength: 1, misfire: 0, damage: 0, cyl: 8 };
    this.s = { rpm: 0, throttle: 0, run: 0, crank: 0 };
    this.phase = 0; this.lastQ = 0; this.env = 0; this.envN = 0; this.amp = 0;
    this.r1 = new Reso(); this.r2 = new Reso(); this.r3 = new Reso(); this.r4 = new Reso();
    this.lp = 0; this.lp2 = 0; this.hp = 0; this.noiseLp = 0;
    this.crankPh = 0; this.whine = 0; this.tick = 0; this.knock = 0;
    // cross-plane V8: slightly uneven pulses give the burble
    this.cylAmp = [1, 0.9, 1.07, 0.95, 1.03, 0.91, 1.08, 0.96];
    this.port.onmessage = (e) => Object.assign(this.p, e.data);
  }
  process(inputs, outputs){
    const out = outputs[0][0];
    if (!out) return true;
    const sr = sampleRate, p = this.p, s = this.s;
    const k = 1 - Math.exp(-1 / (sr * 0.03));
    const kf = 1 - Math.exp(-1 / (sr * 0.004));
    for (let i = 0; i < out.length; i++) {
      s.rpm += (p.rpm - s.rpm) * kf;
      s.throttle += (p.throttle - s.throttle) * k;
      s.run += ((p.running ? 1 : 0) - s.run) * k * 0.5;
      s.crank += ((p.crank ? 1 : 0) - s.crank) * k;
      let y = 0;
      const rpm = Math.max(s.rpm, 1);
      if (i === 0) {
        const f0 = 38 + rpm * 0.012;
        this.r1.set(f0 * 2.1, 3.5, sr);
        this.r2.set(f0 * 5.3 + s.throttle * 90, 4, sr);
        this.r3.set(760 + rpm * 0.05, 2.2, sr);
        this.r4.set(95 + rpm * 0.018, 6, sr);
      }
      // --- combustion
      if (s.run > 0.001) {
        const cyc = rpm / 120;
        this.phase += cyc / sr;
        if (this.phase >= 1) this.phase -= 1;
        const n = p.cyl || 8;
        const q = Math.floor(this.phase * n);
        if (q !== this.lastQ) {
          this.lastQ = q;
          const mis = Math.random() < p.misfire * 0.35;
          const a = (0.55 + 0.65 * s.throttle + 0.2 * p.load) * this.cylAmp[q % 8] * (0.85 + Math.random() * 0.3);
          this.env = mis ? 0.04 : a;
          this.envN = mis ? 0 : a;
          if (mis && Math.random() < 0.3) this.env = 1.8;
          if (p.damage > 0.2 && Math.random() < p.damage * 0.5) this.knock = 0.6 * p.damage;
        }
        const decay = Math.exp(-1 / (sr * (0.0022 + 0.0035 * (1 - s.throttle) + 600 / (rpm * 1000))));
        this.env *= decay;
        this.envN *= Math.exp(-1 / (sr * 0.006));
        const imp = this.env;
        const noise = (Math.random() * 2 - 1);
        this.noiseLp += (noise - this.noiseLp) * (0.12 + s.throttle * 0.3);
        const exc = imp * (0.7 + 0.3 * noise) + this.envN * this.noiseLp * 0.6;
        y += this.r1.run(exc) * 2.2 + this.r2.run(exc) * 1.2 + this.r3.run(exc) * 0.5 * (0.3 + s.throttle) + this.r4.run(exc) * 2.6;
        // intake hiss and valvetrain tick
        y += noise * 0.012 * (s.throttle * 1.5 + rpm / 7000);
        this.tick += rpm / 60 / sr;
        if (this.tick >= 1) { this.tick -= 1; this.knock = Math.max(this.knock, 0.02 + rpm / 60000); }
        this.knock *= Math.exp(-1 / (sr * 0.0015));
        y += this.knock * (Math.random() * 2 - 1);
        y *= s.run;
      }
      // --- starter motor
      if (s.crank > 0.001) {
        const cs = Math.max(0.15, p.crankStrength);
        this.crankPh += (4.2 * cs) / sr;
        if (this.crankPh >= 1) this.crankPh -= 1;
        const comp = Math.pow(Math.sin(this.crankPh * Math.PI), 6);
        this.whine += (180 + 120 * cs - comp * 60) / sr;
        if (this.whine >= 1) this.whine -= 1;
        const w = (this.whine * 2 - 1) * 0.16 + Math.sin(this.whine * Math.PI * 4) * 0.08;
        const chug = comp * 0.5 * (Math.random() * 0.4 + 0.8);
        y += (w * (0.4 + 0.6 * (1 - comp)) + this.r4.run(chug * 0.4) * 2 + chug * 0.25 * (Math.random() * 2 - 1)) * s.crank * cs;
      }
      // soft saturation for growl
      const drive = 1.4 + s.throttle * 2.2;
      y = Math.tanh(y * drive) / Math.tanh(drive);
      this.hp += (y - this.hp) * 0.0035;
      out[i] = (y - this.hp) * 0.55;
    }
    return true;
  }
}
registerProcessor('engine-proc', EngineProc);
`;
var CQ = (B) => 440 * Math.pow(2, (B - 69) / 12), Uh = class {
  constructor(A, I) {
    this.ctx = A;
    this.noise = I;
  }
  ctx;
  noise;
  ks = /* @__PURE__ */ new Map();
  g(A, I, g, C, Q, i = 0, E = 0) {
    let t = this.ctx.createGain();
    return t.gain.setValueAtTime(1e-4, I), t.gain.linearRampToValueAtTime(Q, I + g), i > 0 ? (t.gain.setTargetAtTime(Q * 0.7, I + g, C * 0.3), t.gain.setValueAtTime(Q * 0.7, I + g + i), t.gain.exponentialRampToValueAtTime(1e-4, I + g + i + E)) : t.gain.exponentialRampToValueAtTime(1e-4, I + g + C), t.connect(A), t;
  }
  osc(A, I, g, C, Q, i = 0) {
    let E = this.ctx.createOscillator();
    return E.type = A, E.frequency.value = I, E.detune.value = i, E.connect(Q), E.start(g), E.stop(g + C + 0.1), E;
  }
  pad(A, I, g, C, Q = 0.05, i = 1400) {
    let E = this.ctx.createBiquadFilter();
    E.type = "lowpass", E.frequency.setValueAtTime(i * 0.6, I), E.frequency.linearRampToValueAtTime(i, I + C * 0.5), E.frequency.linearRampToValueAtTime(i * 0.7, I + C);
    let t = this.g(A, I, C * 0.25, C, Q, C * 0.55, C * 0.35);
    E.connect(t);
    for (let o of g) for (let e of [-7, 7]) this.osc("sawtooth", CQ(o), I, C * 1.2, E, e);
  }
  arp(A, I, g, C, Q = 0.04, i = "square") {
    let E = this.ctx.createBiquadFilter();
    E.type = "lowpass", E.frequency.setValueAtTime(3200, I), E.frequency.exponentialRampToValueAtTime(600, I + C);
    let t = this.g(A, I, 5e-3, C, Q);
    E.connect(t), this.osc(i, CQ(g), I, C, E);
  }
  bass(A, I, g, C, Q = 0.18) {
    let i = this.ctx.createBiquadFilter();
    i.type = "lowpass", i.frequency.value = 700;
    let E = this.g(A, I, 0.01, C, Q);
    i.connect(E), this.osc("triangle", CQ(g), I, C, i), this.osc("sine", CQ(g - 12), I, C, E);
  }
  upright(A, I, g, C, Q = 0.22) {
    let i = this.ctx.createBiquadFilter();
    i.type = "lowpass", i.frequency.setValueAtTime(1200, I), i.frequency.exponentialRampToValueAtTime(300, I + 0.3);
    let E = this.g(A, I, 8e-3, C * 1.2, Q);
    i.connect(E), this.osc("triangle", CQ(g), I, C * 1.2, i);
  }
  epiano(A, I, g, C, Q = 0.05) {
    for (let i of g) {
      let E = this.ctx.createOscillator(), t = this.ctx.createOscillator(), o = this.ctx.createGain();
      E.frequency.value = CQ(i), t.frequency.value = CQ(i) * 1, o.gain.setValueAtTime(CQ(i) * 2.2, I), o.gain.exponentialRampToValueAtTime(CQ(i) * 0.2, I + 0.6), t.connect(o).connect(E.frequency);
      let e = this.g(A, I, 4e-3, C, Q);
      E.connect(e), E.start(I), t.start(I), E.stop(I + C + 0.1), t.stop(I + C + 0.1);
    }
  }
  pluck(A, I, g, C = 0.25, Q = 1) {
    let i = this.ks.get(g);
    if (!i) {
      let o = this.ctx.sampleRate, e = Math.floor(o * 2.4);
      i = this.ctx.createBuffer(1, e, o);
      let s = i.getChannelData(0), a = Math.max(2, Math.round(o / CQ(g))), n = new Float32Array(a);
      for (let D = 0; D < a; D++) n[D] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(D / a * Math.PI));
      let r = 0, c = 0, h = 0.996 - Math.max(0, (g - 60) * 4e-4);
      for (let D = 0; D < e; D++) {
        let l = n[r], U = n[(r + 1) % a], S = (l + U) * 0.5 * h;
        n[r] = S, s[D] = l * 0.8 + c * 0.2, c = l, r = (r + 1) % a;
      }
      this.ks.set(g, i);
    }
    let E = this.ctx.createBufferSource();
    E.buffer = i, E.playbackRate.value = Q;
    let t = this.ctx.createGain();
    t.gain.value = C, E.connect(t).connect(A), E.start(I), E.stop(I + 2.4);
  }
  noiseHit(A, I, g, C, Q, i, E) {
    let t = this.ctx.createBufferSource();
    t.buffer = this.noise;
    let o = this.ctx.createBiquadFilter();
    o.type = g, o.frequency.value = C, o.Q.value = Q;
    let e = this.g(A, I, 2e-3, i, E);
    t.connect(o).connect(e), t.start(I, Math.random()), t.stop(I + i + 0.05);
  }
  kick(A, I, g = 0.5) {
    let C = this.ctx.createOscillator();
    C.frequency.setValueAtTime(130, I), C.frequency.exponentialRampToValueAtTime(45, I + 0.12);
    let Q = this.g(A, I, 2e-3, 0.28, g);
    C.connect(Q), C.start(I), C.stop(I + 0.35);
  }
  snare(A, I, g = 0.18) {
    this.noiseHit(A, I, "bandpass", 1900, 0.8, 0.16, g);
    let C = this.ctx.createOscillator();
    C.frequency.value = 190;
    let Q = this.g(A, I, 2e-3, 0.08, g * 0.6);
    C.connect(Q), C.start(I), C.stop(I + 0.12);
  }
  hat(A, I, g = 0.06, C = false) {
    this.noiseHit(A, I, "highpass", 7500, 0.5, C ? 0.2 : 0.035, g);
  }
  brush(A, I, g = 0.08) {
    this.noiseHit(A, I, "bandpass", 3500, 0.6, 0.18, g);
  }
  ride(A, I, g = 0.05) {
    this.noiseHit(A, I, "bandpass", 6e3, 3, 0.5, g);
    for (let C of [1, 1.47, 2.11]) {
      let Q = this.ctx.createOscillator();
      Q.frequency.value = 3200 * C;
      let i = this.g(A, I, 1e-3, 0.4, g * 0.08);
      Q.connect(i), Q.start(I), Q.stop(I + 0.5);
    }
  }
  beep(A, I, g, C, Q = 0.1) {
    let i = this.g(A, I, 5e-3, C, Q);
    this.osc("sine", g, I, C, i);
  }
  voice(A, I, g, C, Q = 0.12) {
    let i = this.ctx.createOscillator();
    i.type = "sawtooth", i.frequency.setValueAtTime(g, I), i.frequency.linearRampToValueAtTime(g * 0.92, I + C);
    let E = this.ctx.createBiquadFilter();
    E.type = "bandpass", E.frequency.value = 650 + Math.random() * 300, E.Q.value = 8;
    let t = this.ctx.createBiquadFilter();
    t.type = "bandpass", t.frequency.value = 1100 + Math.random() * 900, t.Q.value = 10;
    let o = this.g(A, I, 0.02, C, Q);
    i.connect(E).connect(o), i.connect(t).connect(o), i.start(I), i.stop(I + C + 0.1);
  }
}, SC = { Am: [57, 60, 64], F: [53, 57, 60], C: [48, 52, 55], G: [55, 59, 62], Dm: [50, 53, 57], E: [52, 56, 59], Em: [52, 55, 59], D: [50, 54, 57] };
function ku() {
  return [{ freq: 89.3, name: "Пустыня FM", bpm: 104, beats: 4, bar: (B, A, I, g, C, Q) => {
    let i = Math.floor(g / 8) % 3, t = (i === 1 ? [SC.Am, SC.F, SC.Dm, SC.E] : [SC.Am, SC.F, SC.C, SC.G])[g % 4];
    B.pad(A, I, t.map((e) => e + 12), C * 4, 0.022, 1600);
    let o = i !== 2 || g % 8 > 3;
    for (let e = 0; e < 16; e++) {
      let s = I + e * C / 4;
      (i !== 2 || e % 2 === 0) && B.arp(A, s, t[(e + g % 2) % 3] + (e % 8 < 4 ? 24 : 12) + (Q() < 0.08 ? 7 : 0), C / 3, 0.022), o && ((e % 8 === 0 || e === 10 && Q() < 0.5) && B.kick(A, s, 0.4), e % 8 === 4 && B.snare(A, s, 0.13), e % 2 === 0 && B.hat(A, s, 0.035, e % 8 === 6)), e % 2 === 0 && B.bass(A, s, t[0] - 12, C / 2.2, 0.13);
    }
  } }, { freq: 94.2, name: "Радио «Дорожник»", bpm: 96, beats: 4, bar: (B, A, I, g, C, Q) => {
    let i = Math.floor(g / 8) % 2, t = (i ? [SC.Em, SC.C, SC.G, SC.D] : [SC.G, SC.C, SC.D, SC.G])[g % 4], o = [t[0] - 12, t[0], t[1], t[2], t[0] + 12, t[1] + 12];
    for (let e of [0, 2, 2.5, 3]) o.forEach((s, a) => B.pluck(A, I + e * C + a * 0.012, s, e === 0 ? 0.13 : 0.09));
    for (let e = 0; e < 4; e++) B.upright(A, I + e * C, (e % 2 ? t[2] : t[0]) - 24, C * 0.9, 0.2);
    if (B.brush(A, I + C, 0.07), B.brush(A, I + C * 3, 0.07), i && Q() < 0.7) {
      let e = [67, 69, 71, 74, 76, 79];
      for (let s = 0; s < 4; s++) Q() < 0.6 && B.pluck(A, I + s * C + C / 2, e[Math.floor(Q() * e.length)], 0.12);
    }
  } }, { freq: 99.7, name: "Джаз 99.7", bpm: 118, beats: 4, bar: (B, A, I, g, C, Q) => {
    let E = [[48, 51, 55, 58], [53, 57, 60, 63], [46, 50, 53, 57], [55, 59, 62, 65]][g % 4], t = C * 0.66;
    for (let e = 0; e < 4; e++) {
      let s = [E[0], E[1], E[2], E[3] - 1][e] - 12;
      B.upright(A, I + e * C, s + (Q() < 0.2 ? 2 : 0), C * 0.95, 0.22), B.ride(A, I + e * C, 0.04), e % 2 === 1 && B.ride(A, I + e * C + t, 0.03);
    }
    let o = [0, 1.66, 2.66, 3.33].filter(() => Q() < 0.55);
    for (let e of o) B.epiano(A, I + e * C, E.map((s) => s + 12), C * 1.2, 0.028);
    g % 4 === 3 && B.hat(A, I + C * 3.66, 0.03);
  } }, { freq: 103.5, name: "Кочевник", bpm: 62, beats: 4, bar: (B, A, I, g, C, Q) => {
    let E = [50, 53, 48, 55][Math.floor(g / 2) % 4];
    g % 2 === 0 && B.pad(A, I, [E, E + 7, E + 14, E + 15], C * 8, 0.018, 900), B.bass(A, I, 38, C * 4, 0.08);
    let t = [62, 64, 65, 67, 69, 72, 74];
    for (let o = 0; o < 8; o++) Q() < 0.3 && B.pluck(A, I + o * C / 2, t[Math.floor(Q() * t.length)] + (Q() < 0.3 ? 12 : 0), 0.1, 1);
  } }, { freq: 106.1, name: "—", bpm: 60, beats: 4, bar: (B, A, I, g, C, Q) => {
    if (g % 4 === 0) {
      for (let E = 0; E < 3; E++) B.beep(A, I + E * 0.4, 1100, 0.25, 0.06);
      return;
    }
    let i = Math.floor(Q() * 10);
    for (let E = 0; E < 4; E++) B.voice(A, I + E * C * 0.9, 140 + (i + E) * 4, 0.45, 0.1);
    B.beep(A, I + C * 3.7, 700 + i * 40, 0.1, 0.03);
  } }];
}
var Kh = class {
  constructor(A, I, g, C) {
    this.ctx = A;
    this.inst = new Uh(A, g), this.stationBus = A.createGain();
    let Q = A.createBiquadFilter();
    Q.type = "highpass", Q.frequency.value = 220;
    let i = A.createBiquadFilter();
    i.type = "lowpass", i.frequency.value = 4800;
    let E = A.createWaveShaper(), t = new Float32Array(1024);
    for (let e = 0; e < 1024; e++) {
      let s = e / 1023 * 2 - 1;
      t[e] = Math.tanh(s * 1.6) / Math.tanh(1.6);
    }
    E.curve = t, this.staticSrc = A.createBufferSource(), this.staticSrc.buffer = g, this.staticSrc.loop = true;
    let o = A.createBiquadFilter();
    o.type = "bandpass", o.frequency.value = 2200, o.Q.value = 0.5, this.staticGain = A.createGain(), this.staticGain.gain.value = 0, this.staticSrc.connect(o).connect(this.staticGain), this.staticSrc.start(), this.out = A.createGain(), this.out.gain.value = 0, this.muff = A.createBiquadFilter(), this.muff.type = "lowpass", this.muff.frequency.value = 2e4, this.panner = C(1.5), this.stationBus.connect(Q).connect(i).connect(E).connect(this.out), this.staticGain.connect(this.out), this.out.connect(this.muff).connect(this.panner).connect(I);
  }
  ctx;
  on = false;
  freq = 94.2;
  list = ku();
  inst;
  stationBus;
  staticSrc;
  staticGain;
  out;
  muff;
  panner;
  cur = null;
  nextBar = 0;
  barN = 0;
  seed = 1;
  signal = 0;
  stationName = "";
  power = 0;
  setPos(A, I) {
    let g = this.ctx.currentTime;
    this.panner.positionX && (this.panner.positionX.setTargetAtTime(A.x, g, 0.02), this.panner.positionY.setTargetAtTime(A.y, g, 0.02), this.panner.positionZ.setTargetAtTime(A.z, g, 0.02)), this.muff.frequency.setTargetAtTime(I ? 2e4 : 1300, g, 0.1);
  }
  update(A) {
    let I = this.ctx;
    this.power += ((this.on ? 1 : 0) - this.power) * Math.min(1, A * 6);
    let g = null, C = 0;
    for (let E of this.list) {
      let t = Math.max(0, 1 - Math.abs(this.freq - E.freq) / 0.35);
      t > C && (C = t, g = E);
    }
    this.signal = C, this.stationName = g && C > 0.3 ? g.name : "";
    let Q = I.currentTime;
    if (this.out.gain.setTargetAtTime(this.power * 0.9, Q, 0.05), this.stationBus.gain.setTargetAtTime(Math.pow(C, 0.7), Q, 0.08), this.staticGain.gain.setTargetAtTime((1 - C) * 0.09 + (Math.random() < 0.02 ? 0.05 : 0), Q, 0.05), !this.on || this.power < 0.01) {
      this.cur = null;
      return;
    }
    if (g !== this.cur && (this.cur = C > 0.02 ? g : null, this.nextBar = Q + 0.05, this.barN = Math.floor(Math.random() * 16)), !this.cur) return;
    let i = 60 / this.cur.bpm;
    for (; this.nextBar < Q + 0.35; ) {
      let E = this.seed = this.seed * 16807 % 2147483647, t = () => (E = E * 16807 % 2147483647) / 2147483647;
      this.cur.bar(this.inst, this.stationBus, this.nextBar, this.barN, i, t), this.nextBar += i * this.cur.beats, this.barN++;
    }
  }
  get stations() {
    return this.list.map((A) => ({ freq: A.freq, name: A.name }));
  }
}, Gh = class {
  constructor(A, I, g) {
    this.ctx = A;
    this.inst = new Uh(A, g), this.bus = A.createGain(), this.bus.gain.value = 0;
    let C = A.createConvolver(), Q = A.sampleRate * 3, i = A.createBuffer(2, Q, A.sampleRate);
    for (let t = 0; t < 2; t++) {
      let o = i.getChannelData(t);
      for (let e = 0; e < Q; e++) o[e] = (Math.random() * 2 - 1) * Math.pow(1 - e / Q, 2.5) * 0.4;
    }
    C.buffer = i;
    let E = A.createGain();
    E.gain.value = 0.45, this.bus.connect(I), this.bus.connect(C).connect(E).connect(I);
  }
  ctx;
  inst;
  bus;
  next = 0;
  bar = 0;
  playing = false;
  start() {
    this.playing || (this.playing = true, this.next = this.ctx.currentTime + 0.2, this.bus.gain.cancelScheduledValues(this.ctx.currentTime), this.bus.gain.setTargetAtTime(0.9, this.ctx.currentTime, 1.5));
  }
  stop() {
    this.playing && (this.playing = false, this.bus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8));
  }
  update() {
    if (!this.playing) return;
    let A = 60 / 68, I = this.ctx.currentTime;
    for (; this.next < I + 0.4; ) {
      let C = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 56, 59]][this.bar % 4], Q = this.next;
      if (this.inst.pad(this.bus, Q, [C[1], C[2], C[3]], A * 4, 0.012, 800), [0, 2, 3, 4, 3, 2, 4, 1].forEach((E, t) => this.inst.pluck(this.bus, Q + t * A / 2, C[E], 0.16 - t % 2 * 0.04)), this.bar % 8 >= 4 && Math.random() < 0.8) {
        let E = [69, 72, 71, 67, 64, 67, 69];
        this.inst.pluck(this.bus, Q + A * (1 + Math.floor(Math.random() * 3)), E[Math.floor(Math.random() * E.length)] + 12, 0.1, 1);
      }
      this.next += A * 4, this.bar++;
    }
  }
};
var ml = class {
  constructor(A, I, g) {
    this.ctx = A;
    this.out = A.createGain(), this.out.gain.value = 0.55;
    let C = A.createWaveShaper(), Q = new Float32Array(2048);
    for (let e = 0; e < 2048; e++) {
      let s = e / 2047 * 2 - 1;
      Q[e] = Math.tanh(s * 2.2);
    }
    C.curve = Q;
    let i = (e, s) => {
      let a = A.createOscillator();
      a.type = e, a.frequency.value = 20;
      let n = A.createGain();
      return n.gain.value = s, a.connect(n).connect(C), a.start(), [a, n];
    };
    [this.fire, this.gFire] = i("sawtooth", 0.5), [this.sub, this.gSub] = i("square", 0.22), [this.harm, this.gHarm] = i("triangle", 0.12);
    let E = A.createBufferSource();
    E.buffer = g, E.loop = true, this.noiseFilt = A.createBiquadFilter(), this.noiseFilt.type = "bandpass", this.noiseFilt.frequency.value = 300, this.noiseFilt.Q.value = 0.8, this.noiseGain = A.createGain(), this.noiseGain.gain.value = 0, E.connect(this.noiseFilt).connect(this.noiseGain).connect(C);
    let t = A.createGain();
    t.gain.value = 0.35, this.fire.connect(t).connect(this.noiseGain.gain), E.start(), this.starter = A.createOscillator(), this.starter.type = "sawtooth", this.starter.frequency.value = 700, this.gStarter = A.createGain(), this.gStarter.gain.value = 0;
    let o = A.createBiquadFilter();
    o.type = "bandpass", o.frequency.value = 900, o.Q.value = 2, this.starter.connect(o).connect(this.gStarter).connect(this.out), this.starter.start(), C.connect(this.out).connect(I);
  }
  ctx;
  fire;
  sub;
  harm;
  gFire;
  gSub;
  gHarm;
  noiseGain;
  noiseFilt;
  starter;
  gStarter;
  out;
  set(A) {
    let I = this.ctx.currentTime, g = Math.max(A.rpm, 1), C = g / 15, Q = 1 + (Math.random() - 0.5) * (0.03 + A.misfire * 0.25 + A.damage * 0.08);
    this.fire.frequency.setTargetAtTime(C * Q, I, 0.03), this.sub.frequency.setTargetAtTime(C * 0.5, I, 0.03), this.harm.frequency.setTargetAtTime(C * 2.01, I, 0.03);
    let i = Math.max(A.throttle, A.load);
    this.gFire.gain.setTargetAtTime(0.35 + i * 0.35, I, 0.05), this.gHarm.gain.setTargetAtTime(0.06 + i * 0.16 + g / 6e3 * 0.1, I, 0.05), this.noiseFilt.frequency.setTargetAtTime(180 + g * 0.12 + i * 400, I, 0.05), this.noiseGain.gain.setTargetAtTime(A.running ? 0.25 + i * 0.35 : A.cranking ? 0.2 : 0, I, 0.05), this.gStarter.gain.setTargetAtTime(A.cranking ? 0.1 * (0.4 + A.crankStrength) : 0, I, 0.03), this.starter.frequency.setTargetAtTime(420 + A.crankStrength * 480, I, 0.1);
  }
  dispose() {
    try {
      this.out.disconnect(), this.fire.stop(), this.sub.stop(), this.harm.stop(), this.starter.stop();
    } catch {
    }
  }
}, ql = class {
  constructor(A, I, g) {
    this.a = A;
    if (this.lp = I.createBiquadFilter(), this.lp.type = "lowpass", this.lp.frequency.value = 5e3, this.shelf = I.createBiquadFilter(), this.shelf.type = "lowshelf", this.shelf.frequency.value = 180, this.gain = I.createGain(), this.gain.gain.value = 0, this.panner = A.makePanner(3), this.lp.connect(this.shelf).connect(this.gain).connect(this.panner).connect(g), A.workletReady) try {
      this.node = new AudioWorkletNode(I, "engine-proc", { numberOfInputs: 0, outputChannelCount: [1] }), this.node.connect(this.lp);
    } catch {
      this.node = null;
    }
    this.node || (this.osc = new ml(I, this.lp, A.noiseBuffer));
  }
  a;
  node = null;
  osc = null;
  lp;
  shelf;
  gain;
  panner;
  set(A) {
    this.node ? this.node.port.postMessage({ rpm: A.rpm, throttle: A.throttle, load: A.load, running: A.running ? 1 : 0, crank: A.cranking ? 1 : 0, crankStrength: A.crankStrength, misfire: A.misfire, damage: A.damage }) : this.osc?.set(A);
    let I = this.a.ctx.currentTime, g = A.running || A.cranking;
    this.gain.gain.setTargetAtTime(g ? A.inside ? 1.05 : 1.3 : 0, I, 0.08), this.lp.frequency.setTargetAtTime(A.inside ? 1400 + A.throttle * 1600 : 3500 + A.throttle * 4500, I, 0.1), this.shelf.gain.setTargetAtTime(A.inside ? 5 : 0, I, 0.2), this.a.placePanner(this.panner, A.pos);
  }
  dispose() {
    try {
      this.node?.disconnect(), this.gain.disconnect();
    } catch {
    }
    this.osc?.dispose();
  }
}, Fh = class {
  ctx = null;
  workletReady = false;
  master;
  comp;
  buses = {};
  world;
  reverb;
  reverbSend;
  noise;
  get noiseBuffer() {
    return this.brown;
  }
  brown;
  vols = { master: 0.8, sfx: 0.9, ambient: 0.8, radio: 0.7, music: 0.6, engine: 0.9 };
  radio;
  menu = null;
  amb = {};
  loops = {};
  hornNodes = null;
  pourT = 0;
  pumpT = 0;
  cricketT = 0;
  birdT = 20;
  listenerPos = new y();
  insideCar = false;
  voices = 0;
  paused = false;
  initialized = false;
  get ready() {
    return this.initialized;
  }
  async init() {
    if (this.ctx) {
      this.ctx.state !== "running" && await this.ctx.resume().catch(() => {
      });
      return;
    }
    let A = window.AudioContext || window.webkitAudioContext;
    if (!A) return;
    let I = new A({ latencyHint: "interactive" });
    this.ctx = I, this.comp = I.createDynamicsCompressor(), this.comp.threshold.value = -14, this.comp.knee.value = 10, this.comp.ratio.value = 5, this.comp.attack.value = 4e-3, this.comp.release.value = 0.25, this.master = I.createGain(), this.master.connect(this.comp).connect(I.destination), this.world = I.createGain(), this.world.connect(this.master);
    for (let g of ["sfx", "ambient", "radio", "engine"]) this.buses[g] = I.createGain(), this.buses[g].connect(this.world);
    this.buses.music = I.createGain(), this.buses.music.connect(this.master), this.buses.ui = I.createGain(), this.buses.ui.connect(this.master), this.noise = this.makeNoise(2.5, "white"), this.brown = this.makeNoise(4, "brown"), this.reverb = I.createConvolver(), this.reverb.buffer = this.makeIR(2.4, 2.2), this.reverbSend = I.createGain(), this.reverbSend.gain.value = 0.5, this.reverbSend.connect(this.reverb).connect(this.buses.sfx);
    for (let g of ["data:text/javascript;charset=utf-8," + encodeURIComponent(Ll), URL.createObjectURL(new Blob([Ll], { type: "application/javascript" }))]) try {
      await I.audioWorklet.addModule(g), this.workletReady = true;
      break;
    } catch {
    }
    this.workletReady || console.warn("engine worklet unavailable, using oscillator engine"), this.radio = new Kh(I, this.buses.radio, this.noise, (g) => this.makePanner(g)), this.startAmbient(), this.initialized = true, this.applyVolumes(), I.state !== "running" && await I.resume().catch(() => {
    });
  }
  makeNoise(A, I) {
    let g = this.ctx, C = Math.floor(g.sampleRate * A), Q = g.createBuffer(1, C, g.sampleRate), i = Q.getChannelData(0), E = 0;
    for (let t = 0; t < C; t++) {
      let o = Math.random() * 2 - 1;
      I === "white" ? i[t] = o : (E = (E + 0.02 * o) / 1.02, i[t] = E * 3.5);
    }
    return Q;
  }
  makeIR(A, I) {
    let g = this.ctx, C = Math.floor(g.sampleRate * A), Q = g.createBuffer(2, C, g.sampleRate);
    for (let i = 0; i < 2; i++) {
      let E = Q.getChannelData(i);
      for (let t = 0; t < C; t++) {
        let o = t / C, e = t > g.sampleRate * 0.09 && t < g.sampleRate * 0.1 ? 0.6 : 0;
        E[t] = ((Math.random() * 2 - 1) * Math.pow(1 - o, I) + e * (Math.random() * 2 - 1)) * 0.6;
      }
    }
    return Q;
  }
  makePanner(A = 2.5) {
    let I = this.ctx.createPanner();
    return I.panningModel = "HRTF", I.distanceModel = "inverse", I.refDistance = A, I.rolloffFactor = 1.1, I.maxDistance = 600, I;
  }
  placePanner(A, I) {
    let g = this.ctx.currentTime;
    A.positionX ? (A.positionX.setTargetAtTime(I.x, g, 0.02), A.positionY.setTargetAtTime(I.y, g, 0.02), A.positionZ.setTargetAtTime(I.z, g, 0.02)) : A.setPosition(I.x, I.y, I.z);
  }
  setVolumes(A) {
    Object.assign(this.vols, A), this.applyVolumes();
  }
  applyVolumes() {
    if (!this.ctx) return;
    let A = this.ctx.currentTime, I = this.vols;
    this.master.gain.setTargetAtTime(I.master, A, 0.05), this.buses.sfx.gain.setTargetAtTime(I.sfx, A, 0.05), this.buses.ambient.gain.setTargetAtTime(I.ambient * 0.9, A, 0.05), this.buses.radio.gain.setTargetAtTime(I.radio, A, 0.05), this.buses.music.gain.setTargetAtTime(I.music * 0.7, A, 0.05), this.buses.engine.gain.setTargetAtTime(I.engine * 0.8, A, 0.05), this.buses.ui.gain.setTargetAtTime(I.sfx * 0.6, A, 0.05);
  }
  setPaused(A) {
    this.paused = A, this.ctx && this.world.gain.setTargetAtTime(A ? 0 : 1, this.ctx.currentTime, 0.12);
  }
  duck(A, I) {
    if (!this.ctx) return;
    let g = this.ctx.currentTime;
    this.world.gain.cancelScheduledValues(g), this.world.gain.setValueAtTime(this.world.gain.value, g), this.world.gain.linearRampToValueAtTime(1 - A, g + 0.05), this.world.gain.linearRampToValueAtTime(1, g + I);
  }
  setListener(A, I, g) {
    if (!this.initialized) return;
    this.listenerPos.copy(A);
    let C = this.ctx.listener, Q = this.ctx.currentTime;
    C.positionX ? (C.positionX.setTargetAtTime(A.x, Q, 0.02), C.positionY.setTargetAtTime(A.y, Q, 0.02), C.positionZ.setTargetAtTime(A.z, Q, 0.02), C.forwardX.setTargetAtTime(I.x, Q, 0.02), C.forwardY.setTargetAtTime(I.y, Q, 0.02), C.forwardZ.setTargetAtTime(I.z, Q, 0.02), C.upX.setTargetAtTime(g.x, Q, 0.02), C.upY.setTargetAtTime(g.y, Q, 0.02), C.upZ.setTargetAtTime(g.z, Q, 0.02)) : (C.setPosition(A.x, A.y, A.z), C.setOrientation(I.x, I.y, I.z, g.x, g.y, g.z));
  }
  out(A, I, g, C = 0) {
    let Q = this.ctx, i = Q.createGain();
    i.gain.value = A?.volume ?? 1;
    let E = i;
    if (A?.muffled) {
      let t = Q.createBiquadFilter();
      t.type = "lowpass", t.frequency.value = 900, i.connect(t), E = t;
    }
    if (A?.pos) {
      let t = this.makePanner(2.5);
      this.placePanner(t, A.pos), E.connect(t), E = t;
    }
    if (E.connect(I), C > 0) {
      let t = Q.createGain();
      t.gain.value = C, E.connect(t).connect(this.reverbSend), setTimeout(() => t.disconnect(), (g + 3) * 1e3);
    }
    return this.voices++, setTimeout(() => {
      try {
        i.disconnect(), E.disconnect();
      } catch {
      }
      this.voices--;
    }, (g + 0.3 + (A?.delay ?? 0)) * 1e3), i;
  }
  env(A, I, g, C, Q = 1, i = "exp") {
    A.gain.setValueAtTime(1e-4, I), A.gain.linearRampToValueAtTime(Q, I + g), i === "exp" ? A.gain.exponentialRampToValueAtTime(1e-4, I + g + C) : A.gain.linearRampToValueAtTime(1e-4, I + g + C);
  }
  burst(A, I, g) {
    let C = this.ctx, Q = C.createBufferSource();
    Q.buffer = g.brown ? this.brown : this.noise, Q.playbackRate.value = g.rate ?? 1;
    let i = C.createBiquadFilter();
    i.type = g.type ?? "bandpass", i.frequency.setValueAtTime(g.f, I), g.f2 && i.frequency.exponentialRampToValueAtTime(Math.max(20, g.f2), I + (g.a ?? 2e-3) + g.d), i.Q.value = g.q ?? 1;
    let E = C.createGain();
    this.env(E, I, g.a ?? 2e-3, g.d, g.g ?? 1), Q.connect(i).connect(E).connect(A), Q.start(I, Math.random() * 1.5), Q.stop(I + (g.a ?? 2e-3) + g.d + 0.05);
  }
  tone(A, I, g) {
    let C = this.ctx, Q = C.createOscillator();
    Q.type = g.type ?? "sine", Q.frequency.setValueAtTime(g.f, I), g.f2 && Q.frequency.exponentialRampToValueAtTime(Math.max(10, g.f2), I + (g.a ?? 3e-3) + g.d), g.detune && (Q.detune.value = g.detune);
    let i = C.createGain();
    this.env(i, I, g.a ?? 3e-3, g.d, g.g ?? 1), Q.connect(i).connect(A), Q.start(I), Q.stop(I + (g.a ?? 3e-3) + g.d + 0.05);
  }
  modal(A, I, g, C, Q, i = 0.3) {
    C.forEach((E, t) => this.tone(A, I, { f: g * E * (1 + (Math.random() - 0.5) * 0.02), d: Q / (1 + t * 0.6), g: i / (1 + t * 0.7), a: 1e-3 }));
  }
  play(A, I = {}) {
    if (!this.initialized || this.voices > 40) return;
    let g = this.ctx, C = g.currentTime + (I.delay ?? 0) + 5e-3, Q = Math.random, i = I.pitch ?? 1, E = A.startsWith("ui_"), t = E ? this.buses.ui : this.buses.sfx;
    !E && I.pos && I.muffled === void 0 && (I.muffled = this.insideCar && this.listenerPos.distanceTo(I.pos) > 2.2);
    let o = (e, s = 0) => this.out(I, t, e, s);
    switch (A) {
      case "door_open": {
        let e = o(0.9);
        this.burst(e, C, { type: "highpass", f: 2500, d: 0.03, g: 0.6 }), this.tone(e, C + 0.05, { type: "sawtooth", f: 520 * i, f2: 380, a: 0.08, d: 0.35, g: 0.025 }), this.burst(e, C + 0.02, { f: 900, q: 6, a: 0.05, d: 0.4, g: 0.12 });
        break;
      }
      case "door_close":
      case "trunk_close":
      case "hood_close": {
        let e = A !== "door_close" ? 1.2 : 1, s = o(0.8);
        this.tone(s, C, { f: 85 * e * i, f2: 50, d: 0.25, g: 0.9 }), this.burst(s, C, { type: "lowpass", f: 900, d: 0.18, g: 0.9 }), this.modal(s, C, 180 * i, [1, 2.3, 3.9], 0.25, 0.12), this.burst(s, C + 0.06, { type: "highpass", f: 3e3, d: 0.025, g: 0.4 });
        break;
      }
      case "hood_open":
      case "trunk_open": {
        let e = o(1);
        this.burst(e, C, { type: "highpass", f: 2200, d: 0.03, g: 0.5 }), this.tone(e, C + 0.02, { type: "triangle", f: 300, f2: 180, a: 0.2, d: 0.5, g: 0.04 }), this.burst(e, C + 0.1, { f: 600, q: 3, a: 0.15, d: 0.4, g: 0.12 });
        break;
      }
      case "latch":
      case "click":
      case "switch":
      case "key_turn":
      case "cap_open":
      case "cap_close":
      case "battery_click": {
        let e = o(0.3);
        this.burst(e, C, { type: "highpass", f: A === "key_turn" ? 2600 : 3200, d: 0.018, g: 0.7 }), this.tone(e, C, { type: "square", f: 1800 * i, d: 0.012, g: 0.05 }), A === "key_turn" && this.modal(e, C + 0.02, 2200, [1, 1.7, 2.4], 0.15, 0.04), A === "cap_open" && this.burst(e, C + 0.03, { f: 1200, q: 2, d: 0.12, g: 0.2 });
        break;
      }
      case "starter_fail": {
        let e = o(0.8);
        for (let s = 0; s < 3; s++) this.burst(e, C + s * 0.18, { type: "highpass", f: 1800, d: 0.03, g: 0.7 });
        break;
      }
      case "pickup":
      case "zip":
      case "paper": {
        let e = o(0.4);
        A === "zip" ? this.burst(e, C, { f: 3e3, f2: 5e3, q: 1.5, a: 0.02, d: 0.12, g: 0.3 }) : this.burst(e, C, { f: A === "paper" ? 4e3 : 1400, q: 0.8, a: 0.01, d: 0.12, g: 0.45 });
        break;
      }
      case "drop":
      case "throw":
      case "swing": {
        let e = o(0.5);
        this.burst(e, C, { f: 700, f2: A === "swing" ? 1800 : 300, q: 1, a: 0.04, d: 0.2, g: A === "swing" ? 0.35 : 0.2 });
        break;
      }
      case "impact_metal":
      case "wrench_clank":
      case "melee_hit": {
        let e = o(1.2), s = (200 + Q() * 400) * i;
        this.modal(e, C, s, [1, 2.76, 5.4, 8.9], 0.5 + Q() * 0.4, 0.28), this.burst(e, C, { type: "highpass", f: 1500, d: 0.05, g: 0.5 }), this.tone(e, C, { f: 90, f2: 50, d: 0.12, g: 0.5 });
        break;
      }
      case "impact_wood": {
        let e = o(0.6);
        this.tone(e, C, { f: (180 + Q() * 80) * i, f2: 120, d: 0.12, g: 0.7 }), this.burst(e, C, { f: 700 + Q() * 400, q: 3, d: 0.1, g: 0.6 });
        break;
      }
      case "impact_soft":
      case "flesh_hit":
      case "land": {
        let e = o(0.5);
        this.tone(e, C, { f: 110 * i, f2: 55, d: 0.14, g: 0.7 }), this.burst(e, C, { type: "lowpass", f: A === "flesh_hit" ? 1400 : 700, d: 0.12, g: 0.7 });
        break;
      }
      case "impact_plastic": {
        let e = o(0.4);
        this.burst(e, C, { f: 1600 + Q() * 800, q: 4, d: 0.07, g: 0.6 }), this.tone(e, C, { f: 400 * i, f2: 250, d: 0.06, g: 0.3 });
        break;
      }
      case "impact_glass":
      case "glass_break": {
        let e = o(1.5);
        this.burst(e, C, { type: "highpass", f: 3e3, d: A === "glass_break" ? 0.5 : 0.05, g: 0.6 });
        for (let s = 0; s < (A === "glass_break" ? 14 : 3); s++) this.modal(e, C + Q() * (A === "glass_break" ? 0.6 : 0.05), 2e3 + Q() * 4e3, [1, 2.2], 0.2, 0.05);
        break;
      }
      case "footstep_sand":
      case "footstep_asphalt":
      case "footstep_concrete":
      case "footstep_wood":
      case "footstep_metal": {
        let e = o(0.4), s = 0.8 + Q() * 0.4;
        A === "footstep_sand" ? (this.burst(e, C, { f: 900 * s, q: 0.7, a: 0.012, d: 0.12, g: 0.55 }), this.burst(e, C + 0.03, { type: "highpass", f: 3500, a: 0.01, d: 0.07, g: 0.15 })) : A === "footstep_wood" ? (this.tone(e, C, { f: 120 * s, f2: 80, d: 0.09, g: 0.6 }), this.burst(e, C, { f: 500 * s, q: 3, d: 0.06, g: 0.4 })) : A === "footstep_metal" ? (this.modal(e, C, 300 * s, [1, 2.6, 4.1], 0.2, 0.12), this.burst(e, C, { type: "highpass", f: 2e3, d: 0.03, g: 0.3 })) : (this.burst(e, C, { f: 1600 * s, q: 1.1, d: 0.05, g: 0.45 }), this.tone(e, C, { f: 90, f2: 60, d: 0.05, g: 0.3 }));
        break;
      }
      case "eat": {
        let e = o(1.3);
        for (let s = 0; s < 4; s++) this.burst(e, C + s * 0.28 + Q() * 0.05, { f: 1200 + Q() * 800, q: 1.5, a: 0.02, d: 0.08, g: 0.35 });
        break;
      }
      case "drink":
      case "gulp": {
        let e = o(1.2), s = A === "gulp" ? 1 : 3;
        for (let a = 0; a < s; a++) this.tone(e, C + a * 0.35, { f: 180, f2: 420, a: 0.02, d: 0.12, g: 0.4 }), this.burst(e, C + a * 0.35, { f: 500, q: 5, d: 0.1, g: 0.2 });
        break;
      }
      case "gunshot": {
        let e = o(2.5, 0.9);
        this.burst(e, C, { type: "highpass", f: 800, d: 0.06, g: 1.4 }), this.burst(e, C, { type: "lowpass", f: 2400, f2: 300, d: 0.35, g: 1.2 }), this.tone(e, C, { f: 160, f2: 40, d: 0.3, g: 1.2 }), this.burst(e, C + 1e-3, { f: 4e3, q: 2, d: 0.02, g: 0.8 });
        break;
      }
      case "reload":
      case "revolver_cock": {
        let e = o(0.8);
        this.modal(e, C, 1800, [1, 1.6], 0.08, 0.1), this.burst(e, C + 0.25, { type: "highpass", f: 2500, d: 0.03, g: 0.4 }), this.modal(e, C + 0.45, 1600, [1, 1.9], 0.1, 0.12);
        break;
      }
      case "empty_click": {
        let e = o(0.3);
        this.burst(e, C, { type: "highpass", f: 3e3, d: 0.015, g: 0.6 });
        break;
      }
      case "explosion": {
        let e = o(5, 1.2);
        this.burst(e, C, { type: "lowpass", f: 3e3, f2: 120, a: 4e-3, d: 2.5, g: 1.6, brown: false }), this.burst(e, C, { type: "lowpass", f: 400, f2: 60, a: 0.01, d: 3.8, g: 1.8, brown: true }), this.tone(e, C, { f: 70, f2: 22, d: 1.5, g: 1.6 });
        for (let s = 0; s < 10; s++) this.burst(e, C + 0.2 + Q() * 1.5, { f: 600 + Q() * 2e3, q: 2, d: 0.05, g: 0.3 });
        break;
      }
      case "thunder": {
        let e = o(7, 0.6), s = 0.2 + Q() * 0.3;
        this.burst(e, C + s, { type: "lowpass", f: 900, f2: 90, a: 0.05, d: 4.5, g: 1.4, brown: true }), this.burst(e, C + s + 0.4, { type: "lowpass", f: 300, f2: 60, a: 0.6, d: 4, g: 1.2, brown: true });
        break;
      }
      case "crash_light":
      case "crash_heavy": {
        let e = A === "crash_heavy", s = o(2, 0.3);
        if (this.tone(s, C, { f: e ? 60 : 90, f2: 30, d: e ? 0.5 : 0.25, g: 1.3 }), this.burst(s, C, { type: "lowpass", f: 1800, d: e ? 0.6 : 0.25, g: 1.1 }), this.modal(s, C, 150 + Q() * 100, [1, 2.4, 3.7, 5.3], e ? 1.2 : 0.6, 0.3), e) for (let a = 0; a < 8; a++) this.modal(s, C + Q() * 0.5, 800 + Q() * 3e3, [1, 2.1], 0.2, 0.06);
        break;
      }
      case "bolt_loosen":
      case "bolt_tighten":
      case "ratchet": {
        let e = o(1), s = A === "ratchet" ? 6 : 4;
        for (let a = 0; a < s; a++) this.burst(e, C + a * 0.09, { type: "highpass", f: 2800, d: 0.02, g: 0.5 }), this.modal(e, C + a * 0.09, 1400 + a * 30, [1, 1.8], 0.06, 0.05);
        A !== "ratchet" && this.modal(e, C + s * 0.09 + 0.05, 900, [1, 2.7], 0.3, 0.12);
        break;
      }
      case "crate_break": {
        let e = o(1.2, 0.2);
        for (let s = 0; s < 6; s++) this.tone(e, C + Q() * 0.15, { f: 150 + Q() * 200, f2: 90, d: 0.1, g: 0.5 }), this.burst(e, C + Q() * 0.2, { f: 800 + Q() * 1500, q: 3, d: 0.08, g: 0.4 });
        break;
      }
      case "rabbit_squeal":
      case "rabbit_attack":
      case "rabbit_die": {
        let e = o(1), s = (A === "rabbit_attack" ? 1500 : A === "rabbit_die" ? 1100 : 1900) * (0.85 + Q() * 0.3), a = A === "rabbit_die" ? 1 : 2 + Math.floor(Q() * 3);
        for (let n = 0; n < a; n++) {
          let r = C + n * 0.09;
          this.tone(e, r, { type: "sawtooth", f: s, f2: s * (A === "rabbit_die" ? 0.4 : 1.35), a: 0.01, d: A === "rabbit_die" ? 0.5 : 0.07, g: 0.08 }), this.burst(e, r, { f: s * 1.5, q: 6, d: 0.07, g: 0.25 });
        }
        break;
      }
      case "husk_growl":
      case "husk_attack":
      case "husk_die": {
        let e = o(1.8, 0.2), s = A === "husk_die" ? 1.4 : A === "husk_attack" ? 0.5 : 0.9, a = g.createOscillator();
        a.type = "sawtooth", a.frequency.setValueAtTime(70 + Q() * 30, C), a.frequency.linearRampToValueAtTime(A === "husk_die" ? 40 : 90, C + s);
        let n = g.createBiquadFilter();
        n.type = "bandpass", n.frequency.value = 500, n.Q.value = 5;
        let r = g.createBiquadFilter();
        r.type = "bandpass", r.frequency.value = 1100, r.Q.value = 7;
        let c = g.createGain();
        this.env(c, C, 0.08, s, 0.6), a.connect(n).connect(c), a.connect(r).connect(c), c.connect(e), this.burst(e, C, { f: 700, q: 2, a: 0.1, d: s, g: 0.25 }), a.start(C), a.stop(C + s + 0.2);
        break;
      }
      case "hurt": {
        let e = o(0.6);
        this.tone(e, C, { f: 130, f2: 70, d: 0.25, g: 0.8 }), this.burst(e, C, { type: "lowpass", f: 900, d: 0.15, g: 0.6 });
        break;
      }
      case "death": {
        let e = o(3);
        this.tone(e, C, { f: 90, f2: 30, a: 0.05, d: 2.5, g: 0.6 }), this.burst(e, C, { type: "lowpass", f: 500, f2: 80, a: 0.2, d: 2.5, g: 0.5, brown: true });
        break;
      }
      case "heartbeat": {
        let e = o(1);
        this.tone(e, C, { f: 60, f2: 40, d: 0.12, g: 0.9 }), this.tone(e, C + 0.22, { f: 55, f2: 38, d: 0.14, g: 0.7 });
        break;
      }
      case "ui_hover": {
        let e = o(0.2);
        this.tone(e, C, { f: 1800, d: 0.03, g: 0.06 });
        break;
      }
      case "ui_click":
      case "ui_open": {
        let e = o(0.3);
        this.tone(e, C, { f: 900, f2: 1300, d: 0.05, g: 0.12 }), this.burst(e, C, { type: "highpass", f: 4e3, d: 0.015, g: 0.2 });
        break;
      }
      case "ui_back": {
        let e = o(0.3);
        this.tone(e, C, { f: 1100, f2: 700, d: 0.06, g: 0.12 });
        break;
      }
      case "notify": {
        let e = o(0.8);
        this.tone(e, C, { type: "triangle", f: 880, d: 0.25, g: 0.12 }), this.tone(e, C + 0.09, { type: "triangle", f: 1320, d: 0.35, g: 0.1 });
        break;
      }
      case "coins": {
        let e = o(0.8);
        for (let s = 0; s < 4; s++) this.modal(e, C + s * 0.07 + Q() * 0.03, 3e3 + Q() * 1500, [1, 1.5, 2.3], 0.15, 0.06);
        break;
      }
      case "mine_beep": {
        let e = o(0.5);
        this.tone(e, C, { type: "square", f: 2400, d: 0.08, g: 0.15 }), this.tone(e, C + 0.14, { type: "square", f: 2400, d: 0.08, g: 0.15 });
        break;
      }
      case "tire_pop": {
        let e = o(1);
        this.burst(e, C, { type: "lowpass", f: 2500, f2: 300, d: 0.4, g: 1.2 }), this.tone(e, C, { f: 120, f2: 40, d: 0.2, g: 0.8 });
        break;
      }
      case "backfire": {
        let e = o(1.2, 0.5);
        this.burst(e, C, { type: "lowpass", f: 1800, f2: 200, d: 0.18, g: 1.2 }), this.tone(e, C, { f: 110, f2: 45, d: 0.15, g: 1 });
        break;
      }
      case "shift": {
        let e = o(0.4);
        this.burst(e, C, { f: 900, q: 3, d: 0.05, g: 0.25 }), this.modal(e, C + 0.05, 600, [1, 2.2], 0.08, 0.06);
        break;
      }
      case "bell": {
        let e = o(2);
        this.modal(e, C, 660, [1, 2, 2.76, 5.4], 1.5, 0.2);
        break;
      }
      case "sleep": {
        let e = o(3);
        this.tone(e, C, { type: "triangle", f: 440, a: 0.8, d: 2, g: 0.06 }), this.tone(e, C + 0.3, { type: "triangle", f: 330, a: 0.8, d: 2, g: 0.05 });
        break;
      }
      default: {
        let e = o(0.3);
        this.burst(e, C, { f: 1e3, d: 0.05, g: 0.3 });
      }
    }
  }
  loopSrc(A, I, g, C, Q, i, E = false) {
    let t = this.ctx, o = t.createBufferSource();
    o.buffer = I, o.loop = true;
    let e = t.createBiquadFilter();
    e.type = g, e.frequency.value = C, e.Q.value = Q;
    let s = t.createGain();
    s.gain.value = 0, o.connect(e).connect(s);
    let a;
    E ? (a = this.makePanner(3), s.connect(a).connect(i)) : s.connect(i), o.start(0, Math.random() * 2);
    let n = { src: o, filt: e, gain: s, panner: a };
    return this.loops[A] = n, n;
  }
  startPour() {
    this.pourT = 0.25;
  }
  stopPour() {
    this.pourT = 0;
  }
  pumpLoop(A) {
    A && (this.pumpT = 0.25);
  }
  startAmbient() {
    let A = this.ctx, I = (g, C, Q, i, E) => {
      let t = A.createBufferSource();
      t.buffer = C, t.loop = true;
      let o = A.createBiquadFilter();
      o.type = Q, o.frequency.value = i, o.Q.value = E;
      let e = A.createGain();
      e.gain.value = 0, t.connect(o).connect(e).connect(this.buses.ambient), t.start(0, Math.random() * 3), this.amb[g] = { src: t, filt: o, gain: e };
    };
    I("wind", this.brown, "bandpass", 380, 0.6), I("gust", this.noise, "bandpass", 900, 2.5), I("rush", this.noise, "lowpass", 900, 0.5), I("storm", this.noise, "bandpass", 1200, 0.4), I("rain", this.noise, "highpass", 2500, 0.5), I("roof", this.brown, "lowpass", 600, 0.7), I("road", this.brown, "lowpass", 220, 0.7), I("gravel", this.noise, "bandpass", 700, 0.9), I("skid", this.noise, "bandpass", 1400, 6), I("pour", this.noise, "bandpass", 700, 8), I("pump", this.brown, "bandpass", 220, 4);
  }
  windPh = 0;
  setAmbient(A, I) {
    if (!this.initialized) return;
    let g = this.ctx.currentTime, C = this.amb;
    this.windPh += I;
    let Q = 0.6 + 0.4 * Math.sin(this.windPh * 0.33) * Math.sin(this.windPh * 0.11 + 1), i = A.insideBuilding ? 0.35 : 1, E = A.insideCar ? 0.3 : 1, t = Math.min(1, A.wind / 14);
    C.wind.gain.gain.setTargetAtTime((0.08 + t * 0.5) * Q * i * E, g, 0.5), C.wind.filt.frequency.setTargetAtTime(260 + t * 500 + Q * 120, g, 0.5), C.gust.gain.gain.setTargetAtTime(Math.max(0, t - 0.3) * 0.12 * Q * i * E, g, 0.4), C.gust.filt.frequency.setTargetAtTime(600 + Q * 900, g, 0.3);
    let o = Math.min(1, A.carSpeed / 38);
    if (C.rush.gain.gain.setTargetAtTime(o * o * (A.insideCar ? 0.35 : 0.9), g, 0.2), C.rush.filt.frequency.setTargetAtTime(A.insideCar ? 500 + o * 500 : 1200 + o * 2500, g, 0.2), C.storm.gain.gain.setTargetAtTime(A.sand * 0.55 * (A.insideCar || A.insideBuilding ? 0.45 : 1), g, 1), C.rain.gain.gain.setTargetAtTime(A.rain * 0.35 * (A.insideCar || A.insideBuilding ? 0.3 : 1), g, 1), C.roof.gain.gain.setTargetAtTime(A.rain * (A.insideCar || A.insideBuilding ? 0.5 : 0), g, 1), this.pourT -= I, this.pumpT -= I, C.pour.gain.gain.setTargetAtTime(this.pourT > 0 ? 0.35 : 0, g, 0.05), C.pour.filt.frequency.setTargetAtTime(500 + Math.sin(this.windPh * 23) * 150 + Math.random() * 200, g, 0.02), C.pump.gain.gain.setTargetAtTime(this.pumpT > 0 ? 0.3 : 0, g, 0.08), A.night > 0.4 && A.sand < 0.2 && A.rain < 0.2 && !A.insideCar) {
      if (this.cricketT -= I, this.cricketT <= 0) {
        this.cricketT = 0.3 + Math.random() * 1.2;
        let e = this.out({ volume: 0.05 * A.night * i }, this.buses.ambient, 1), s = 4200 + Math.random() * 900, a = g + Math.random() * 0.1, n = this.ctx.createStereoPanner();
        n.pan.value = Math.random() * 2 - 1, n.connect(e);
        for (let r = 0; r < 3 + Math.floor(Math.random() * 4); r++) this.tone(n, a + r * 0.045, { f: s, d: 0.025, g: 1, a: 4e-3 });
      }
    } else if (A.night < 0.2 && A.sand < 0.2 && !A.insideCar && (this.birdT -= I, this.birdT <= 0)) {
      this.birdT = 25 + Math.random() * 50;
      let e = this.out({ volume: 0.06 }, this.buses.ambient, 2, 0.6), s = g;
      this.tone(e, s, { type: "sawtooth", f: 2400, f2: 1300, a: 0.05, d: 0.9, g: 0.08 }), this.burst(e, s, { f: 2e3, q: 8, a: 0.05, d: 0.8, g: 0.15 });
    }
  }
  setCar(A) {
    if (!this.initialized) return;
    let I = this.ctx.currentTime, g = this.amb, C = A ? Math.min(1, Math.abs(A.speed) / 35) : 0, Q = A?.inside ? 1 : A ? 0.5 : 0;
    if (g.road.gain.gain.setTargetAtTime(C * (1 - A.sand * 0.6) * 0.5 * Q, I, 0.1), g.road.filt.frequency.setTargetAtTime(140 + C * 260, I, 0.1), g.gravel.gain.gain.setTargetAtTime(C * (A?.sand ?? 0) * 0.35 * Q + (A?.bumps ?? 0) * 0.2 * Q, I, 0.1), g.gravel.filt.frequency.setTargetAtTime(500 + C * 600 + Math.random() * 200, I, 0.05), g.skid.gain.gain.setTargetAtTime((A?.skid ?? 0) * (1 - (A?.sand ?? 0)) * 0.35 * Q, I, 0.05), g.skid.filt.frequency.setTargetAtTime(1100 + Math.random() * 500, I, 0.03), A?.horn && !this.hornNodes) {
      let i = this.ctx.createGain();
      i.gain.value = 0, i.gain.setTargetAtTime(0.18, I, 0.01);
      let E = this.ctx.createBiquadFilter();
      E.type = "bandpass", E.frequency.value = 900, E.Q.value = 1.2;
      let t = [415, 523].map((e) => {
        let s = this.ctx.createOscillator();
        return s.type = "sawtooth", s.frequency.value = e, s.connect(E), s.start(), s;
      }), o = this.makePanner(4);
      this.placePanner(o, A.pos), E.connect(i).connect(o).connect(this.buses.sfx), this.hornNodes = { osc: t, gain: i };
    } else if (!A?.horn && this.hornNodes) {
      let i = this.hornNodes;
      i.gain.gain.setTargetAtTime(0, I, 0.02), setTimeout(() => i.osc.forEach((E) => E.stop()), 200), this.hornNodes = null;
    }
  }
  createEngine() {
    return this.initialized ? new ql(this, this.ctx, this.buses.engine) : null;
  }
  playMenuMusic() {
    this.initialized && (this.menu || (this.menu = new Gh(this.ctx, this.buses.music, this.noise)), this.menu.start());
  }
  stopMenuMusic() {
    this.menu?.stop();
  }
  update(A) {
    this.initialized && (this.radio?.update(A), this.menu?.update());
  }
};
var DM = 5e3, SM = "tlr_save_v1", Jh = "tlr_boot", Hl = 2310, cM = new y(0, 1, 0);
function Tl() {
  try {
    let B = JSON.parse(localStorage.getItem(SM) || "null");
    return B && B.v === 1 ? B : null;
  } catch {
    return null;
  }
}
function wM() {
  try {
    let B = JSON.parse(sessionStorage.getItem(Jh) || "null");
    return sessionStorage.removeItem(Jh), B;
  } catch {
    return null;
  }
}
function ph(B) {
  try {
    B ? sessionStorage.setItem(Jh, JSON.stringify(B)) : sessionStorage.removeItem(Jh);
  } catch {
  }
  location.reload();
}
var Mu = { clear: ["Ясно", "Clear"], cloudy: ["Облачно", "Cloudy"], overcast: ["Пасмурно", "Overcast"], sandstorm: ["Песчаная буря", "Sandstorm"], rain: ["Дождь", "Rain"] }, Nh = class {
  constructor(A, I, g) {
    this.opts = g;
    this.renderer = A, this.ui = I, this.audio = new Fh(), this.quality = g.quality, this.seed = g.seed, this.test = g.test || {}, this.input = new th(A.domElement);
  }
  opts;
  renderer;
  scene = new mC();
  tex;
  mats;
  sky;
  env;
  world;
  physics;
  player;
  input;
  post;
  ui;
  audio;
  items;
  worldgen;
  fx;
  ambient;
  enemies;
  combat;
  interaction;
  hints;
  icons;
  cars = [];
  playerCar = null;
  props;
  poiGroup = new WA();
  fixedDt = 1 / 60;
  acc = 0;
  last = 0;
  time = 0;
  frames = 0;
  quality;
  seed;
  mode = "menu";
  shadowRadius = 60;
  shadowSize = 2048;
  timeScale = 1;
  baseFov = 75;
  baseExposure = 1;
  difficulty = 1;
  onFrame = null;
  test;
  stats = { fps: 60, frameMs: 16, calls: 0, tris: 0, kills: 0 };
  journey = { homeZ: 0, maxKm: 0, playTime: 0, won: false };
  hurt = 0;
  insideBuilding = false;
  fpsAcc = 0;
  fpsFrames = 0;
  engine = null;
  deathT = -1;
  deathCause = "";
  sleepSeq = null;
  menuT = 0;
  menuCar = null;
  preVel = /* @__PURE__ */ new Map();
  crashCool = 0;
  heartT = 0;
  tuneT = 0;
  autosaveT = 300;
  shelterT = 0;
  lockLostT = 0;
  disarmed = /* @__PURE__ */ new Set();
  menuMusic = false;
  async init(A, I) {
    Qw(), A(0.04, "physics"), await Ny(), A(0.1, "textures"), await Wt(), this.tex = rw(this.renderer, this.test.tq ? Number(this.test.tq) : this.quality >= 2 ? 2 : 1), this.mats = new Jn(this.tex), A(0.3, "sky"), await Wt(), this.sky = new Nn(this.renderer), this.scene.add(this.sky.mesh), this.env = new vn(this.scene, this.sky, this.seed), A(0.38, "world"), await Wt(), this.world = new zn(this.seed, this.mats, this.quality), this.scene.add(this.world.group), this.physics = new qr(this.world.fn), this.props = new oh(this.physics, this.world), this.items = new eh(this.physics, this.mats), this.scene.add(this.items.group, this.poiGroup), this.worldgen = new ih({ fn: this.world.fn, mats: this.mats, physics: this.physics, items: this.items, scene: this.poiGroup, cars: this.cars, seed: this.seed, addCar: (e) => this.addCar(e), removeCar: (e) => this.removeCar(e) }), this.worldgen.initLightPool(this.scene, this.quality >= 2 ? 4 : 2), this.physics.onContact = (e, s, a) => {
      for (let n of [this.physics.ownerOf(e), this.physics.ownerOf(s)]) n?.kind === "item" && this.items.impact(n.item, a / Math.max(1, n.item.mass * 9.81), this.time);
    }, this.items.onImpact = (e, s) => this.itemImpact(e, s);
    let g = this.world.fn, C = this.worldgen.homestead();
    this.journey.homeZ = C.z;
    let Q, i = 0;
    if (I.kind === "load") {
      let e = I.save.player.p;
      Q = new y(e[0], e[1], e[2]), i = I.save.player.yaw;
    } else if (I.kind === "new") {
      let e = this.homeSpawn(C);
      Q = e.pos, i = e.yaw;
    } else Q = new y(g.roadX(Hl) + 6, 0, Hl), Q.y = g.height(Q.x, Q.z);
    if (this.test.z) {
      let e = Number(this.test.z);
      Q.set(g.roadX(e) + 3.2, 0, e), Q.y = g.height(Q.x, Q.z);
    }
    let E = Math.round(Q.x / 64) * 64, t = Math.round(Q.z / 64) * 64;
    (E || t) && (this.physics.shiftOrigin(E, t), this.world.setOrigin(E, t), this.worldgen.setOrigin(E, t), this.items.setOrigin(E, t)), this.player = new Eh(this.physics, new y(Q.x - E, Q.y, Q.z - t), this.baseFov), this.player.yaw = i, this.scene.add(this.player.camera), this.post = new qn(this.renderer, this.scene, this.player.camera, innerWidth, innerHeight, this.quality >= 1 ? 4 : 0), this.fx = new rh(this), this.scene.add(this.fx.group), this.ambient = new hh(this), this.scene.add(this.ambient.group), this.enemies = new Dh(this), this.scene.add(this.enemies.group), this.combat = new ch(this), this.interaction = new yh(this), this.hints = new kh(this), this.icons = new Mh(this.renderer), this.player.onStep = () => this.footstep(), this.player.onLand = (e) => this.audio.play("land", { volume: yI(e / 9, 0.2, 1) }), this.player.onDamage = (e, s) => this.damagePlayer(e, s === "fall" ? J("Разбился, упав с высоты", "Fell to death") : s), this.env.onThunder = (e, s) => this.audio.play("thunder", { delay: e, volume: s }), A(0.56, "creatures"), await Wt(), oM(), A(0.6, "car"), await Wt(), this.mode = I.kind === "menu" ? "menu" : "play", I.kind === "new" ? this.setupNew(C, I.difficulty, I.auto) : I.kind === "load" ? this.applySave(I.save) : this.setupMenu(), this.test.t && (this.env.time = Number(this.test.t)), this.test.w && this.env.setWeather(this.test.w, 0.01), A(0.7, "terrain"), await Wt(), this.env.update(0, 0), this.streamWorld(true);
    let o = this.playerWorld();
    for (let e = 0; e < 40; e++) this.worldgen.update(0, o.x, o.z);
    this.items.update(o.x, o.z, (e, s) => this.physics.hasTerrainAt(e, s)), A(0.95, "env"), this.env.maybeUpdateEnv(0, true), this.renderer.info.autoReset = false, this.applyQuality(), this.applySettings(this.ui.settings), this.renderer.compile(this.scene, this.player.camera), A(1, "done");
  }
  homeSpawn(A) {
    let I = (Q, i) => new y(Q, 0, i).applyAxisAngle(cM, A.ry).add(new y(A.x, 0, A.z)), g = I(7.6, 2.7);
    g.y = A.y + 0.42;
    let C = I(1.5, 12).sub(g);
    return { pos: g, yaw: Math.atan2(-C.x, -C.z) };
  }
  setupNew(A, I, g) {
    this.difficulty = I, this.env.time = 7.4, this.env.day = 1, this.env.setWeather("clear", 0.01);
    let C = (t, o, e) => new y(t, o, e).applyAxisAngle(cM, A.ry).add(new y(A.x - this.physics.originX, A.y, A.z - this.physics.originZ)), Q = new vI(this.seed * 7 + 3), i = xt(0.8, () => Q.next());
    if (delete i.battery, i.engine.oil = ai * 0.8, i.radiator.coolant = NQ * 0.7, this.test.z) {
      let t = this.world.fn, o = Number(this.test.z) + 6, e = this.makePlayerCar(Tt(this.seed), xt(0.85, () => Q.next()), new y(t.roadX(o) - 1.9 - this.physics.originX, t.roadY(o) + 0.35, o - this.physics.originZ), t.roadHeading(o));
      e.fuel = { petrol: 30, diesel: 0, water: 0 }, e.auto = g;
      return;
    }
    let E = this.makePlayerCar(Tt(this.seed), i, C(-8, 0.55, 1.4), A.ry);
    E.fuel = { petrol: 1.2, diesel: 0, water: 0 }, E.auto = g, this.hints.trigger("intro");
  }
  setupMenu() {
    let A = this.world.fn, I = Hl, g = new y(A.roadX(I) - 2.1 - this.physics.originX, A.roadY(I) + 0.45, I - this.physics.originZ), C = this.makePlayerCar(Tt(this.seed + 11), xt(0.75, Math.random), g, A.roadHeading(I));
    C.lights = 1, this.menuCar = C, this.env.time = 18.25, this.env.setWeather("clear", 0.01), this.env.frozenWeather = true, this.timeScale = 0, this.enemies.enabled = false;
  }
  makePlayerCar(A, I, g, C) {
    let Q = new bt(this.physics, this.mats, this.world.fn, A, I, g, C);
    return Q.isPlayerCar = true, Q.enableHeadlightLights(true), this.addCar(Q), this.playerCar = Q, Q;
  }
  addCar(A) {
    this.scene.add(A.visual.root), this.cars.includes(A) || this.cars.push(A);
  }
  removeCar(A) {
    if (A === this.playerCar) return;
    this.player?.car === A && this.exitCar(), A.dispose();
    let I = this.cars.indexOf(A);
    I >= 0 && this.cars.splice(I, 1), this.preVel.delete(A);
  }
  applyQuality() {
    let A = this.quality;
    this.shadowSize = A >= 3 ? 4096 : A >= 1 ? 2048 : 1024, this.shadowRadius = A >= 2 ? 70 : 50, this.renderer.shadowMap.enabled = true, this.post.setAO(A >= 3), this.post.bloom.enabled = A >= 1;
  }
  applySettings(A) {
    es(A.lang), this.input.sensitivity = A.sensitivity, this.input.invertY = A.invertY;
    let I = JSON.parse(JSON.stringify(ts));
    for (let [C, Q] of Object.entries(A.bindings || {})) Array.isArray(Q) && Q.length && (I[C] = Q);
    if (this.input.bindings = I, this.baseFov = A.fov, this.baseExposure = (this.test.exp ? Number(this.test.exp) : 1) * (A.brightness ?? 1), this.audio.setVolumes({ master: A.master, sfx: A.sfx, ambient: A.ambient, radio: A.radio, music: A.music, engine: A.engine }), !this.env) return;
    this.env.secondsPerHour = A.dayLength * 60 / 24, this.player && (this.player.camera.fov = A.fov, this.player.headBob = A.headBob), this.playerCar && this.mode === "play" && (this.playerCar.auto = A.auto), this.difficulty = A.difficulty, this.enemies && (this.enemies.difficulty = A.difficulty), A.quality !== this.quality && (this.quality = A.quality, this.applyQuality());
    let g = Math.min(devicePixelRatio, 1.5) * A.renderScale;
    Math.abs(g - this.renderer.getPixelRatio()) > 1e-3 && !this.test.pr && (this.renderer.setPixelRatio(g), this.resize(innerWidth, innerHeight));
  }
  uiHooks() {
    return { newGame: (A) => ph({ mode: "new", seed: A, difficulty: this.ui.settings.difficulty, auto: this.ui.settings.auto }), continueGame: () => ph({ mode: "load" }), resume: () => this.resume(), save: () => this.save(), load: () => ph({ mode: "load" }), quitToMenu: () => {
      this.mode === "play" && !this.player.dead && !this.journey.won && this.save(), ph(null);
    }, applySettings: (A) => this.applySettings(A), hasSave: () => !!Tl(), journal: () => this.journal(), click: () => this.audio.play("ui_click", { volume: 0.7 }), hover: () => this.audio.play("ui_hover", { volume: 0.4 }), captureKey: (A) => {
      this.input.onKeyCapture = A;
    } };
  }
  start() {
    this.mode === "menu" ? this.ui.showMenu() : (this.ui.showHud(true), this.input.requestLock()), this.audio.init().then(() => {
      this.applySettings(this.ui.settings), this.mode === "menu" ? (this.audio.playMenuMusic(), this.menuMusic = true) : this.audio.play("ui_open", { volume: 0.5 });
    });
  }
  resume() {
    this.ui.hideOverlays(), this.ui.hideDeath(), this.ui.showHud(true), this.audio.setPaused(false), this.input.requestLock(), this.lockLostT = 0;
  }
  openPause() {
    this.mode !== "play" || this.ui.state !== "game" || (this.ui.showPause(), this.input.exitLock(), this.audio.setPaused(true), this.audio.play("ui_open", { volume: 0.5 }));
  }
  uiKeys(A) {
    if (this.mode !== "play") return;
    let I = this.input, g = this.ui.state;
    if (!I.onKeyCapture) {
      if (I.rawPressed("Escape")) {
        g === "game" ? this.openPause() : g === "pause" || g === "journal" || g === "note" ? this.resume() : g === "settings" && this.ui.showPause();
        return;
      }
      g === "game" && !this.player.dead && I.pressedA("journal") ? (this.ui.showJournal(false), this.input.exitLock(), this.audio.play("paper", { volume: 0.6 })) : g === "journal" && (I.rawPressed("Tab") || I.rawPressed("KeyJ")) ? this.resume() : g === "note" && (I.rawPressed("KeyE") || I.rawPressed("Space")) && this.resume(), g === "game" && !I.locked && !I.noLock && !this.player.dead ? (this.lockLostT += A, this.lockLostT > 0.4 && this.openPause()) : this.lockLostT = 0;
    }
  }
  enterCar(A, I, g = false) {
    let C = this.player;
    if (C.car || C.dead) return;
    let Q = this.interaction.hand;
    Q && !Q.def.storable && this.interaction.drop(false), C.enterCar(A, I), C.thirdPerson = false, A.driverSeated = I === "driver", g || (this.audio.play("impact_soft", { volume: 0.35 }), this.hints.trigger("firstCar"));
  }
  exitCar() {
    let A = this.player, I = A.car;
    if (!I) return;
    let g = A.seat === "driver" ? 1 : -1, C = I.visual.root;
    C.updateMatrixWorld();
    let Q = new y(0, 0, 1).applyQuaternion(C.quaternion), i = Math.atan2(-Q.x, -Q.z) + Math.PI, E = I.localToWorld(I.anchor(A.seat)), t = [new y(1.55 * g, 0.6, -0.2), new y(-1.55 * g, 0.6, -0.2), new y(0.4 * g, 0.6, -3.1), new y(0.4 * g, 0.6, 3.1)], o = AC(65535, QI.STATIC | QI.HEAVY | QI.CAR), e = null;
    for (let s of t) {
      let a = I.localToWorld(s), n = a.clone().sub(E), r = n.length();
      if (n.normalize(), this.physics.castRay(E, n, r + 0.35, o, I.body)) continue;
      let h = this.physics.groundY(a.x, a.z, a.y + 1.2);
      if (!(h < a.y - 3)) {
        e = new y(a.x, h + 0.03, a.z);
        break;
      }
    }
    e || (e = I.localToWorld(new y(0, 1.75, -0.3))), A.exitCar(e, i), I.driverSeated = false, I.horn = false, I.setCrank(false), I.handbrake = true, A.leaning = 0, this.audio.play("impact_soft", { volume: 0.3 });
  }
  detachAndThrow(A, I) {
    let g = A.detach(I);
    if (!g) return;
    let C = A.localToWorld(QC[I]), Q = C.clone().sub(A.visual.root.position).setY(0);
    Q.lengthSq() > 1e-4 && Q.normalize(), C.addScaledVector(Q, 0.45);
    let i = A.visual.root.quaternion.clone(), E = this.items.spawn("part", C.x + this.physics.originX, C.y + 0.1, C.z + this.physics.originZ, i, { part: g.state }, { partVisual: g.visual });
    if (E.touched = true, E.body) {
      let t = A.body.linvel();
      E.body.setLinvel({ x: t.x * 0.7 + Q.x * 3.5, y: 2.5 + Math.random() * 2, z: t.z * 0.7 + Q.z * 3.5 }, true), E.body.setAngvel({ x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 8 }, true);
    }
    this.audio.play("impact_metal", { pos: C, volume: 0.9 });
  }
  damagePlayer(A, I) {
    let g = this.player;
    g.dead || this.mode !== "play" || A <= 0 || (g.stats.health -= A, this.hurt = Math.min(1.2, this.hurt + A / 30), g.shake = Math.max(g.shake, Math.min(1.6, A / 22)), this.audio.play("hurt", { volume: yI(A / 25, 0.35, 1) }), g.stats.health <= 0 && this.die(I));
  }
  die(A) {
    let I = this.player;
    I.dead || (I.stats.health = 0, I.dead = true, this.deathT = 0, this.deathCause = A, this.audio.play("death"), this.audio.duck(0.5, 3), I.car && (I.car.setCrank(false), I.car.horn = false));
  }
  deathCamera(A) {
    if (this.deathT < 0) return;
    this.deathT += A;
    let I = this.deathT, g = this.player.camera;
    if (!this.player.car) {
      let C = 1 - Math.pow(1 - ZI(I / 1.1), 3);
      g.position.y -= 1.35 * C, g.rotation.z = 1.25 * C, g.rotation.x += 0.3 * C;
    }
    this.ui.setBlackout(ZI((I - 0.8) / 2.2) * 0.8), I > 3.2 && this.ui.state === "game" && (this.input.exitLock(), this.ui.showDeath(this.deathCause, this.summary()));
  }
  sleep() {
    let A = this.player;
    if (this.sleepSeq || A.dead) return;
    let I = A.camera.position;
    if (this.enemies.list.some((C) => C.alive && C.obj.position.distanceTo(I) < 30)) {
      this.ui.toast(J("Нельзя спать — рядом враги", "You cannot sleep with enemies nearby"), true);
      return;
    }
    if (A.stats.energy > 80) {
      this.ui.toast(J("Вы не хотите спать", "You are not tired"));
      return;
    }
    let g = yI(Math.round((100 - A.stats.energy) / 12.5), 1, 9);
    this.sleepSeq = { t: 0, hours: g, applied: false }, A.car && A.car.setIgnition(false), this.audio.play("sleep");
  }
  updateSleep(A) {
    let I = this.sleepSeq;
    I && (I.t += A, I.t < 1.4 ? this.ui.setBlackout(I.t / 1.4) : I.applied ? I.t > 2.4 && I.t < 4 ? this.ui.setBlackout(1 - (I.t - 2.4) / 1.6) : I.t >= 4 && (this.ui.setBlackout(0), this.sleepSeq = null, this.save()) : (I.applied = true, this.advanceHours(I.hours), this.ui.setBlackout(1), this.ui.toast(J(`Вы проспали ${I.hours} ч. День ${this.env.day}, ${this.env.timeString()}`, `You slept ${I.hours} h. Day ${this.env.day}, ${this.env.timeString()}`))));
  }
  advanceHours(A) {
    let I = this.env;
    for (I.time += A; I.time >= 24; ) I.time -= 24, I.day++;
    let g = this.player.stats;
    g.energy = Math.min(100, g.energy + A * 12.5), g.hunger = Math.max(3, g.hunger - A * 1.3), g.thirst = Math.max(3, g.thirst - A * 2), g.health = Math.min(100, g.health + A * 3), g.stamina = 100;
    for (let C of this.cars) C.temp = Math.min(C.temp, I.temperature + 5);
    I.update(0.01, 0.01), I.maybeUpdateEnv(0, true);
  }
  survival(A) {
    let I = this.player, g = I.stats;
    if (I.dead || this.sleepSeq) return;
    let C = A / this.env.secondsPerHour, Q = ZI((this.env.temperature - 24) / 16), i = Ag(0.75, 1.35, ZI((this.difficulty - 0.6) / 0.9)), E = I.sprinting ? 1.6 : 1;
    g.hunger = Math.max(0, g.hunger - C * 2.1 * i * (I.sprinting ? 1.25 : 1)), g.thirst = Math.max(0, g.thirst - C * 3.4 * i * (1 + Q * 0.8) * E), g.energy = Math.max(0, g.energy - C * 3.1 * i * (I.sprinting ? 1.3 : 1)), g.hunger <= 0 || g.thirst <= 0 ? (g.health -= A * 0.28, g.health <= 0 && this.die(g.thirst <= 0 ? J("Умер от жажды", "Died of thirst") : J("Умер от голода", "Starved to death"))) : g.hunger > 35 && g.thirst > 35 && g.health < 100 && (g.health = Math.min(100, g.health + A * 0.05)), g.energy <= 0 && (g.stamina = Math.min(g.stamina, 30)), g.health < 25 && !I.dead && (this.heartT -= A, this.heartT <= 0 && (this.heartT = Ag(0.6, 1.1, g.health / 25), this.audio.play("heartbeat", { volume: 0.55 }))), this.hurt = Math.max(g.health < 25 ? 0.25 + Math.sin(this.time * 6) * 0.05 : 0, this.hurt - A * 0.7);
  }
  playerWorld() {
    let A = this.player, I = A.car ? A.car.position : A.feet;
    return { x: I.x + this.physics.originX, y: I.y, z: I.z + this.physics.originZ };
  }
  currentKm() {
    return Math.max(0, (this.playerWorld().z - this.journey.homeZ) / 1e3);
  }
  summary() {
    let A = this.journey.playTime, I = Math.floor(A / 3600), g = Math.floor(A % 3600 / 60);
    return { km: Math.max(this.journey.maxKm, this.currentKm()), days: this.env.day, kills: this.stats.kills, time: I ? `${I} ${J("ч", "h")} ${g} ${J("мин", "min")}` : `${g} ${J("мин", "min")}` };
  }
  checkJourney() {
    let A = this.currentKm();
    this.journey.maxKm = Math.max(this.journey.maxKm, A), !this.journey.won && A >= DM && (this.journey.won = true, this.input.exitLock(), this.save(), this.ui.showWin(this.summary()), this.audio.play("bell"));
  }
  journal() {
    let A = this.playerCar, I = A ? [...new Set(tB.filter((g) => !A.parts[g]).map((g) => hi(pQ[g], g)))].join(", ") : "";
    return { km: this.currentKm(), goal: DM, day: this.env.day, time: this.env.timeString(), weather: J(...Mu[this.env.weather]), temp: this.env.temperature, money: this.interaction.totalMoney(), kills: this.stats.kills, car: A ? { fuel: A.fuelTotal, oil: A.parts.engine?.oil ?? 0, hasEngine: !!A.parts.engine, coolant: A.parts.radiator?.coolant ?? 0, hasRad: !!A.parts.radiator, batt: A.charge, hasBatt: !!A.parts.battery, engine: A.parts.engine?.cond ?? 0, odo: A.odometer, missing: I } : null };
  }
  save() {
    if (this.mode !== "play" || this.player.dead) return false;
    let A = this.worldgen;
    for (let E of A.built.values()) for (let t of E.wrecks) t.modified && t.spawnKey && A.wreckState.set(t.spawnKey, t.serialize());
    let I = this.player, g = I.car ? I.car.localToWorld(new y(1.6, 0.3, -0.2)) : I.feet.clone(), C = this.interaction, Q = (E) => E ? { id: E.def.id, s: JSON.parse(JSON.stringify(E.state)) } : null, i = { v: 1, seed: this.seed, difficulty: this.difficulty, time: this.env.time, day: this.env.day, weather: this.env.weather, player: { p: [g.x + this.physics.originX, g.y, g.z + this.physics.originZ], yaw: (I.car, I.yaw), pitch: I.pitch, stats: { ...I.stats }, seat: I.car === this.playerCar && I.car ? I.seat : null }, inv: { hand: Q(C.hand), slots: C.slots.map(Q) }, car: this.playerCar ? this.playerCar.serialize() : null, items: this.items.serialize(), collected: [...A.collected], wrecks: [...A.wreckState], pumps: [...A.pumpFuel], doors: [...A.doorState], mines: [...this.disarmed], stats: { kills: this.stats.kills, playTime: this.journey.playTime, maxKm: this.journey.maxKm, won: this.journey.won, homeZ: this.journey.homeZ }, hints: [...this.hints.shown], savedAt: Date.now() };
    try {
      return localStorage.setItem(SM, JSON.stringify(i)), true;
    } catch (E) {
      return console.warn("save failed", E), this.ui.toast(J("Не удалось сохранить игру", "Could not save the game"), true), false;
    }
  }
  applySave(A) {
    this.difficulty = A.difficulty, this.env.time = A.time, this.env.day = A.day, this.env.setWeather(A.weather, 0.01), Object.assign(this.player.stats, A.player.stats), this.player.pitch = A.player.pitch, this.journey = { ...this.journey, ...A.stats }, this.stats.kills = A.stats.kills;
    let I = this.worldgen;
    for (let e of A.collected) I.collected.add(e);
    for (let [e, s] of A.wrecks) I.wreckState.set(e, s);
    for (let [e, s] of A.pumps) I.pumpFuel.set(e, s);
    for (let [e, s] of A.doors) I.doorState.set(e, s);
    for (let e of A.hints) this.hints.shown.add(e);
    this.disarmed = new Set(A.mines);
    let g = 0, C = (e) => {
      for (let s of Object.values(e || {})) g = Math.max(g, s?.id ?? 0);
    };
    if (A.car) {
      let e = this.restoreCar(A.car);
      C(e.parts), A.player.seat && this.enterCar(e, A.player.seat, true);
    }
    let Q = this.physics.originX, i = this.physics.originZ;
    for (let e of A.items) {
      let s = this.items.spawn(e.id, e.p[0], e.p[1] + 0.02, e.p[2], new nI(e.q[0], e.q[1], e.q[2], e.q[3]), e.s, { frozen: true });
      s.touched = true, e.s?.part && (g = Math.max(g, e.s.part.id ?? 0));
    }
    let E = this.player.feet, t = (e) => {
      if (!e) return null;
      e.s?.part && (g = Math.max(g, e.s.part.id ?? 0));
      let s = this.items.spawn(e.id, E.x + Q, E.y + 1, E.z + i, void 0, e.s, { frozen: true });
      return s.touched = true, s;
    };
    A.inv.slots.forEach((e) => {
      let s = t(e);
      s && this.interaction.storeToSlot(s);
    });
    let o = t(A.inv.hand);
    o && (o.def.storable && !this.player.car ? this.interaction.take(o) : this.interaction.storeToSlot(o) || (o.obj.position.y = E.y + 0.3)), Ok(g + 1);
  }
  restoreCar(A) {
    let I = new y(A.pos[0] - this.physics.originX, A.pos[1] + 0.08, A.pos[2] - this.physics.originZ), g = this.makePlayerCar(A.look, Bh(A.parts), I, 0);
    g.body.setRotation({ x: A.rot[0], y: A.rot[1], z: A.rot[2], w: A.rot[3] }, true), g.body.setLinvel({ x: 0, y: 0, z: 0 }, true), g.fuel = { ...A.fuel }, g.odometer = A.odo, g.temp = A.temp, g.lights = A.lights, g.radioOn = !!A.radio[0], g.radioFreq = Number(A.radio[1]) || 94.2, g.dead = A.dead, g.auto = A.auto;
    for (let [C, Q] of Object.entries(A.hinge || {})) g.hinge[C] && (g.hinge[C] = { t: Q, target: Q });
    return g.postStep(), g;
  }
  streamWorld(A = false) {
    let I = this.player.car ? this.player.car.position : this.player.feet, g = I.x + this.physics.originX, C = I.z + this.physics.originZ, Q = this.player.camera.position;
    this.world.update(Q.x + this.physics.originX, Q.y, Q.z + this.physics.originZ, A ? 1e9 : 5, A);
    let i = [{ x: g, z: C, r: 90 }];
    for (let E of this.cars) {
      let t = Math.hypot(E.worldX - g, E.worldZ - C);
      E.enabled = t < 200, E.body.setEnabled(E.enabled && this.physics.hasTerrainAt(E.worldX, E.worldZ)), E !== this.player.car && t < 200 && i.push({ x: E.worldX, z: E.worldZ, r: 40 });
    }
    this.physics.ensureTerrain(i, A ? 100 : 2), this.props.update(A ? 1 : 0.016, i, A);
  }
  checkOrigin() {
    let A = this.player.car ? this.player.car.position : this.player.feet;
    if (Math.abs(A.x) < 1200 && Math.abs(A.z) < 1200) return;
    let I = Math.round(A.x / 64) * 64, g = Math.round(A.z / 64) * 64;
    this.physics.shiftOrigin(I, g), this.world.setOrigin(this.physics.originX, this.physics.originZ), this.worldgen.setOrigin(this.physics.originX, this.physics.originZ), this.items.setOrigin(this.physics.originX, this.physics.originZ), this.player.shiftOrigin(I, g);
    for (let C of this.cars) C.shiftOrigin(I, g);
    this.enemies.shiftOrigin(I, g), this.fx.shift(I, g), this.ambient.shift(I, g), this.player.camera.position.x -= I, this.player.camera.position.z -= g;
  }
  controls() {
    let A = this.input;
    return { throttle: A.down("forward") ? 1 : 0, brake: A.down("back") ? 1 : 0, steer: (A.down("left") ? 1 : 0) - (A.down("right") ? 1 : 0), handbrake: A.down("handbrake") };
  }
  fixedStep(A) {
    let I = this.mode === "play";
    this.player.fixedUpdate(A, this.input, !I || this.player.dead || !!this.sleepSeq);
    let g = this.controls(), C = { throttle: 0, brake: 0, steer: 0, handbrake: true }, Q = this.env.cur.rain;
    for (let i of this.cars) if (i.driverSeated = this.player.car === i && this.player.seat === "driver" && !this.player.dead, i.wet += (Q - i.wet) * A * (Q > i.wet ? 0.2 : 0.02), i.fixedUpdate(A, i.driverSeated ? g : { ...C, handbrake: i.handbrake }, this.env.temperature), i.enabled && (i.driverSeated || Math.abs(i.speed) > 2.5)) {
      let E = i.body.linvel(), t = this.preVel.get(i);
      t || this.preVel.set(i, t = new y()), t.set(E.x, E.y, E.z);
    } else this.preVel.delete(i);
    this.physics.step(A), this.crashCool -= A;
    for (let i of this.cars) {
      i.postStep();
      let E = this.preVel.get(i);
      E && I && this.crashCheck(i, E, A);
    }
  }
  crashCheck(A, I, g) {
    let C = A.body.linvel(), Q = C.x - I.x, i = C.y - I.y + 9.81 * g, E = C.z - I.z, t = Math.sqrt(Q * Q + E * E + 0.3 * i * i);
    if (t < 3.4 || this.crashCool > 0) return;
    this.crashCool = 0.3;
    let o = A.position.clone(), e = new y(-Q, 0, -E);
    e.lengthSq() < 1e-6 && e.set(0, -1, 0), e.normalize();
    let s = o.clone().addScaledVector(e, 2).add(new y(0, 0.55, 0)), a = A.applyImpact(A.worldToLocal(s.clone()), t * 1500);
    for (let n of a) this.detachAndThrow(A, n);
    this.audio.play(t > 8 ? "crash_heavy" : "crash_light", { pos: s, volume: yI(t / 11, 0.35, 1) }), t > 6 && this.fx.sparks(s, Math.round(t * 1.5)), t > 5 && this.fx.crash(s, t, A.look.paint), A === this.player.car && (this.player.shake = Math.max(this.player.shake, Math.min(2, t / 6)), t > 11 && this.damagePlayer((t - 11) * 6, J("Погиб в аварии", "Died in a car crash")));
  }
  handleCarInput(A) {
    let I = this.input, g = this.player, C = g.car;
    if (!C || g.dead || this.sleepSeq) return;
    g.seat === "driver" && (I.pressedA("ignition") && (this.audio.play("key_turn", { volume: 0.5 }), C.running ? C.setIgnition(false) : C.setCrank(true)), C.cranking && !I.down("ignition") && !this.interaction.holdMax && C.setCrank(false), I.pressedA("headlights") && (C.lights = (C.lights + 1) % 3, this.audio.play("switch", { volume: 0.5 })), C.horn = I.down("horn") && !!C.parts.battery && C.charge > 0.05, C.auto || (I.pressedA("shiftUp") && C.shift(1), I.pressedA("shiftDown") && C.shift(-1))), I.pressedA("radio") && (C.radioOn = !C.radioOn, this.audio.play("click", { volume: 0.5 }), C.radioOn && this.showRadio(C));
    let Q = I.down("tuneUp"), i = I.down("tuneDown");
    Q || i ? (this.tuneT -= A, this.tuneT <= 0 && (C.radioFreq = yI(Math.round((C.radioFreq + (Q ? 0.1 : -0.1)) * 10) / 10, 87.5, 108), this.tuneT = 0.07, this.showRadio(C))) : this.tuneT = 0, g.leaning = KI(g.leaning, I.down("lean") ? 1 : 0, 8, A), I.pressedA("camera") && (g.thirdPerson = !g.thirdPerson), I.pressedA("sleep") && this.sleep();
  }
  showRadio(A) {
    let I = this.audio.radio?.stationName;
    this.ui.radioName(`${A.radioFreq.toFixed(1)} MHz · ${I || J("помехи", "static")}`);
  }
  update(A) {
    let I = this.input, g = this.mode === "play", C = this.player;
    g && (this.journey.playTime += A, !C.dead && !this.sleepSeq && C.look(I, A), this.handleCarInput(A), this.interaction.update(A), C.car && !C.dead && I.pressedA("interact") && !this.interaction.hasAction("E") && this.exitCar()), this.acc += A;
    let Q = 0;
    for (; this.acc >= this.fixedDt && Q < 5; ) this.fixedStep(this.fixedDt), this.acc -= this.fixedDt, Q++;
    Q >= 5 && (this.acc = 0);
    let i = this.acc / this.fixedDt;
    for (let t of this.cars) t.render(A, i, this.env.night);
    this.carEvents(), g ? (C.updateCamera(i, A), this.deathCamera(A)) : this.menuCamera(A), this.streamWorld();
    let E = this.playerWorld();
    if (this.worldgen.night = this.env.night, this.worldgen.update(A, E.x, E.z), this.items.update(E.x, E.z, (t, o) => this.physics.hasTerrainAt(t, o)), this.shelterT -= A, this.shelterT <= 0 && (this.shelterT = 0.25, this.insideBuilding = !C.car && this.worldgen.insideBuilding(C.feet.clone().add(new y(0, 1, 0))), C.inShelter = this.insideBuilding || !!C.car), g) {
      if (this.enemies.update(A), this.combat.update(A), this.disarmed.size) for (let t of this.combat.mines) t.armed && this.disarmed.has(lM(t)) && (t.armed = false);
      for (let t of this.combat.mines) t.armed || this.disarmed.add(lM(t));
      this.survival(A), this.hints.update(A), this.checkJourney(), this.updateSleep(A), this.autosaveT -= A, this.autosaveT <= 0 && (this.autosaveT = 300, !C.dead && this.save() && this.ui.toast(J("Автосохранение", "Autosaved")));
    }
    this.fx.update(A), this.ambient.update(A), this.env.indoor = KI(this.env.indoor, this.insideBuilding ? 1 : 0, 0.08, A), this.renderer.toneMappingExposure = this.baseExposure * (1 + this.env.indoor * 0.45), this.env.update(A * this.timeScale, A), kB.uTime.value += A, pn.uWind.value.copy(this.env.wind), Ti.uSandCover.value = KI(Ti.uSandCover.value, this.env.cur.sand, 0.02, A), Ti.uWet.value = KI(Ti.uWet.value, this.env.cur.rain, 0.05, A), this.checkOrigin(), this.updateAudio(A), g && this.ui.state === "game" && this.ui.updateHud(this.hudState(), A);
  }
  menuCamera(A) {
    let I = this.menuCar;
    if (!I) return;
    this.menuT += A;
    let g = this.menuT, C = this.player.camera, i = I.visual.root.position.clone().add(new y(0, 0.7, 0)), E = g * 0.035 + 2.45, t = 7.4 + Math.sin(g * 0.05) * 1.1;
    C.position.set(i.x + Math.sin(E) * t, i.y + 0.35 + Math.sin(g * 0.09) * 0.22, i.z + Math.cos(E) * t);
    let o = this.world.fn.height(C.position.x + this.physics.originX, C.position.z + this.physics.originZ);
    C.position.y = Math.max(C.position.y, o + 0.6), C.lookAt(i), C.rotateY(0.3), C.fov = 52;
  }
  carEvents() {
    for (let A of this.cars) {
      if (!A.events.length) continue;
      let I = A === this.playerCar && this.mode === "play", g = A.visual.root.position;
      for (let C of A.events) switch (C.type) {
        case "crank_fail":
          this.audio.play(A.parts.battery ? "starter_fail" : "battery_click", { pos: g }), I && (this.ui.toast(A.parts.battery ? J("Аккумулятор разряжен", "The battery is flat") : J("Нет аккумулятора", "No battery"), true), this.hints.trigger("noBattery"));
          break;
        case "no_fuel":
          I && (this.ui.toast(J("Кончился бензин", "Out of fuel"), true), this.hints.trigger("lowFuel"));
          break;
        case "overheat":
          I && (this.ui.toast(J("Двигатель перегревается!", "The engine is overheating!"), true), this.hints.trigger("overheat"));
          break;
        case "seized":
          this.audio.play("crash_light", { pos: g, volume: 0.7 }), I && this.ui.toast(J("Двигатель заклинило — нет масла", "The engine seized — no oil"), true);
          break;
        case "shift":
          A === this.player.car && this.audio.play("shift", { pos: g, volume: 0.35 });
          break;
        case "backfire": {
          let Q = A.localToWorld(A.anchor("exhaust")), i = new y(0, 0, -1).applyQuaternion(A.visual.root.quaternion);
          this.audio.play("backfire", { pos: Q }), this.fx.backfire(Q, i);
          break;
        }
      }
      A.events.length = 0;
    }
  }
  footstep() {
    let A = this.player, I = A.feet.x + this.physics.originX, g = A.feet.z + this.physics.originZ, C = "sand", Q = this.world.fn.height(I, g);
    this.insideBuilding ? C = "wood" : A.feet.y > Q + 0.1 ? C = A.feet.y > Q + 0.6 ? "metal" : "concrete" : this.world.fn.onRoad(I, g, -0.3) && (C = "asphalt"), this.audio.play("footstep_" + C, { volume: (A.sprinting ? 0.75 : 0.45) * (1 - A.crouch * 0.6) }), C === "sand" && this.fx.stepDust(A.feet, A.sprinting);
  }
  itemImpact(A, I) {
    if (I < 2.5) return;
    let g = A.def.material ?? "metal", C = g === "wood" ? "impact_wood" : g === "soft" ? "impact_soft" : g === "glass" ? "impact_glass" : g === "plastic" ? "impact_plastic" : "impact_metal";
    this.audio.play(C, { pos: A.obj.position, volume: yI((I - 2) / 25, 0.08, 1), pitch: yI(1.4 - A.mass * 0.03, 0.6, 1.4) });
  }
  updateAudio(A) {
    let I = this.audio;
    if (!I.ready) return;
    let g = this.player, C = g.camera, Q = new y(0, 0, -1).applyQuaternion(C.quaternion), i = new y(0, 1, 0).applyQuaternion(C.quaternion);
    I.setListener(C.position, Q, i);
    let E = !!g.car && !g.thirdPerson;
    I.insideCar = E;
    let t = this.playerCar;
    this.engine || (this.engine = I.createEngine()), this.engine && t && this.engine.set({ rpm: t.rpm, throttle: t.throttle, load: t.gear !== 0 ? t.throttle : t.throttle * 0.25, running: t.running, cranking: t.cranking, crankStrength: ZI(t.charge * 1.25), misfire: t.misfire, damage: 1 - (t.parts.engine?.cond ?? 1), pos: t.localToWorld(QC.engine), inside: g.car === t && !g.thirdPerson });
    let o = t && t.enabled && t.visual.root.position.distanceTo(C.position) < 150;
    I.setCar(o ? { speed: t.speed, skid: t.skid, sand: t.onSand, inside: g.car === t && !g.thirdPerson, pos: t.visual.root.position, horn: t.horn, bumps: 0 } : null), I.setAmbient({ wind: this.env.windSpeed, carSpeed: g.car ? Math.abs(g.car.speed) : 0, insideCar: E, insideBuilding: this.insideBuilding, night: this.env.night, rain: this.env.cur.rain, sand: this.env.cur.sand }, A), I.radio && t && (I.radio.on = this.mode === "play" && t.radioOn && (t.ignition || t.running) && !!t.parts.battery && t.charge > 0.04, I.radio.freq = t.radioFreq, I.radio.setPos(t.localToWorld(new y(0, 0.95, 0.75)), g.car === t)), this.mode === "play" && this.menuMusic && (I.stopMenuMusic(), this.menuMusic = false), I.update(A);
  }
  qty(A) {
    let I = A.state, g = A.def;
    return g.liquid ? `${(I.amount ?? 0).toFixed(1)}${J("л", "L")}` : g.tool === "gun" ? `${I.loaded ?? 0}/6` : g.ammo ? String(I.ammo ?? g.ammo) : g.money ? `$${Math.round(I.money ?? 0)}` : g.food && I.used ? `${Math.round((1 - I.used) * 100)}%` : "";
  }
  gearLabel(A) {
    return A.gear < 0 ? "R" : A.gear === 0 ? "N" : (A.auto ? "D" : "") + A.gear;
  }
  carWarn(A) {
    return A.parts.engine ? A.temp > 112 ? J("ПЕРЕГРЕВ", "OVERHEAT") : (A.parts.engine.oil ?? 0) < 0.6 ? J("МАСЛО", "OIL") : A.parts.battery ? A.fuelTotal < 4 ? J("ТОПЛИВО", "FUEL") : A.charge < 0.2 ? J("АКБ", "BATTERY") : "" : J("НЕТ АКБ", "NO BATTERY") : J("НЕТ ДВИГАТЕЛЯ", "NO ENGINE");
  }
  hudState() {
    let A = this.interaction, I = this.player, g = I.car, C = this.scene.environment, Q = (t) => t ? { name: A.itemName(t), icon: this.icons.get(t, C), qty: this.qty(t) } : null, i = A.holdMax > 0 && A.holdMax < 900 ? ZI(A.holdT / A.holdMax) : 0, E = new y(0, 0, -1).applyQuaternion(I.camera.quaternion);
    return { target: this.sleepSeq ? null : A.target, hold: i, stats: I.stats, hand: Q(A.hand), slots: A.slots.map(Q), compass: A.hasCompass() ? Math.atan2(-E.x, -E.z) : null, car: g ? { speed: g.speed * 3.6, gear: this.gearLabel(g), fuel: g.fuelTotal / ni, temp: g.temp, batt: g.charge, running: g.running, warn: this.carWarn(g) } : null, fps: this.stats.fps, hurt: this.hurt, inCar: !!g };
  }
  render(A) {
    let I = this.player.camera;
    I.aspect = innerWidth / innerHeight, I.updateProjectionMatrix(), this.env.updateShadow(this.player.car ? this.player.car.visual.root.position : I.position, this.shadowRadius, this.shadowSize), this.env.maybeUpdateEnv(A), this.sky.follow(I), this.renderer.info.reset(), this.post.render(A), this.stats.calls = this.renderer.info.render.calls, this.stats.tris = this.renderer.info.render.triangles;
  }
  frame = (A) => {
    let I = this.last ? Math.min(0.1, (A - this.last) / 1e3) : 0.016666666666666666;
    this.last = A, this.time += I, this.fpsAcc += I, this.fpsFrames++, this.fpsAcc > 0.5 && (this.stats.fps = this.fpsFrames / this.fpsAcc, this.stats.frameMs = this.fpsAcc / this.fpsFrames * 1e3, this.fpsAcc = 0, this.fpsFrames = 0), this.uiKeys(I);
    let g = this.ui.state, C = this.mode === "play" && (g === "pause" || g === "settings" || g === "journal" || g === "note" || g === "win" || g === "loading");
    this.input.enabled = this.mode === "play" && g === "game" && !this.player.dead && !this.sleepSeq, C || this.update(I), this.onFrame?.(I), this.render(I), this.input.endFrame(), this.frames++;
  };
  simulate(A, I, g = 1) {
    let C = [], Q = { throttle: 0, brake: 0, steer: 0, handbrake: false, ...I }, i = Math.round(A / this.fixedDt), E = 0;
    for (let t = 0; t < i; t++) {
      this.player.fixedUpdate(this.fixedDt, this.input, false);
      for (let o of this.cars) o.driverSeated = this.player.car === o, o.fixedUpdate(this.fixedDt, o.driverSeated ? Q : { throttle: 0, brake: 0, steer: 0, handbrake: true }, this.env.temperature);
      this.physics.step(this.fixedDt);
      for (let o of this.cars) o.postStep();
      if (E += this.fixedDt, t % 30 === 0 && (this.streamWorld(), this.checkOrigin()), E >= g - 1e-6) {
        E = 0;
        let o = this.player.car || this.playerCar;
        C.push({ kmh: +(o.speed * 3.6).toFixed(1), rpm: Math.round(o.rpm), gear: o.gear, run: o.running, fuel: +o.fuelTotal.toFixed(2), temp: +o.temp.toFixed(1), x: +o.worldX.toFixed(1), z: +o.worldZ.toFixed(1), y: +o.position.y.toFixed(2), sand: +o.onSand.toFixed(2), skid: +o.skid.toFixed(2) });
      }
    }
    return C;
  }
  resize(A, I) {
    this.renderer.setSize(A, I);
    let g = this.renderer.getPixelRatio();
    this.post.setSize(A * g, I * g);
  }
};
function lM(B) {
  return `${Math.round(B.x)},${Math.round(B.z)}`;
}
function Wt() {
  return new Promise((B) => setTimeout(B, 0));
}
var yM = `
:root{--acc:#e8a74a;--acc2:#f3c77a;--ink:#f1ece2;--mut:#b8ad9c;--bg:rgba(14,12,10,.8);--line:rgba(241,236,226,.14);--red:#e0523e;--blu:#6fb3e8;--grn:#8fcf7a}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;color:var(--ink);user-select:none;-webkit-user-select:none}
canvas{display:block}
#ui{position:fixed;inset:0;pointer-events:none;z-index:5}
#ui .layer{position:absolute;inset:0}
.hidden{display:none!important}
#loading{background:radial-gradient(ellipse at 30% 60%,#3a2716 0%,#140e09 60%,#070504 100%);display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:7vh 8vw;pointer-events:auto;z-index:20}
#loading .logo{margin-bottom:auto;margin-top:18vh}
.logo .t1{font-size:clamp(34px,5.2vw,90px);font-weight:200;letter-spacing:.24em;line-height:1;color:#f4ead8;text-shadow:0 2px 30px rgba(232,167,74,.25);white-space:nowrap}
.logo .t1 b{font-weight:700;color:var(--acc)}
.logo .t2{margin-top:14px;font-size:clamp(12px,1.2vw,16px);letter-spacing:.6em;color:var(--mut);text-transform:uppercase}
#loading .bar{width:min(520px,70vw);height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;margin-top:16px}
#loading .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--acc),var(--acc2));transition:width .25s}
#loading .lbl{font-size:13px;letter-spacing:.2em;color:var(--mut);text-transform:uppercase}
#loading .go{margin-top:22px;font-size:14px;letter-spacing:.32em;text-transform:uppercase;color:var(--acc2);animation:pulse 1.8s ease-in-out infinite}
#loading.fade{transition:opacity .8s;opacity:0}
#loading .tip{margin-top:26px;max-width:620px;font-size:15px;color:#d8cdbb;line-height:1.5;opacity:.85}
.menu{pointer-events:auto;background:linear-gradient(90deg,rgba(10,8,6,.86) 0%,rgba(10,8,6,.55) 38%,rgba(10,8,6,0) 70%);display:flex;flex-direction:column;justify-content:center;padding:0 8vw}
.menu .logo{margin-bottom:6vh}
.menu .items{display:flex;flex-direction:column;gap:4px;align-items:flex-start}
.mbtn{position:relative;background:none;border:0;color:var(--ink);font:inherit;font-size:clamp(17px,1.6vw,22px);letter-spacing:.18em;text-transform:uppercase;padding:10px 0;cursor:pointer;transition:color .2s,padding .25s,opacity .2s;text-align:left;opacity:.86}
.mbtn::before{content:"";position:absolute;left:-22px;top:50%;width:0;height:2px;background:var(--acc);transition:width .25s;transform:translateY(-50%)}
.mbtn:hover{color:#fff;padding-left:14px;opacity:1}
.mbtn:hover::before{width:24px}
.mbtn[disabled]{opacity:.3;pointer-events:none}
.mbtn small{display:block;font-size:11px;letter-spacing:.14em;color:var(--mut);text-transform:none;margin-top:2px}
.menu .foot{position:absolute;bottom:4vh;left:8vw;font-size:12px;color:var(--mut);letter-spacing:.12em}
.menu .foot b{color:var(--acc)}
.overlay{pointer-events:auto;background:rgba(6,5,4,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center}
.panel{background:var(--bg);border:1px solid var(--line);border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.5);padding:28px 32px;min-width:360px;max-width:min(940px,94vw);max-height:88vh;overflow:auto}
.panel h2{margin:0 0 18px;font-weight:300;letter-spacing:.3em;text-transform:uppercase;font-size:22px}
.panel h2 b{color:var(--acc);font-weight:600}
.panel .col{display:flex;flex-direction:column;gap:2px}
.panel .mbtn{font-size:18px}
.tabs{display:flex;gap:4px;margin-bottom:18px;border-bottom:1px solid var(--line)}
.tab{background:none;border:0;color:var(--mut);font:inherit;padding:10px 16px;cursor:pointer;letter-spacing:.14em;text-transform:uppercase;font-size:13px;border-bottom:2px solid transparent;margin-bottom:-1px}
.tab.on{color:var(--ink);border-color:var(--acc)}
.row{display:grid;grid-template-columns:1fr 260px;align-items:center;gap:18px;padding:9px 2px;border-bottom:1px solid rgba(255,255,255,.04);font-size:14px}
.row label{color:#ddd3c3}
.row .v{display:flex;align-items:center;gap:10px;justify-content:flex-end}
.row .v span{min-width:38px;text-align:right;color:var(--mut);font-size:12px}
input[type=range]{-webkit-appearance:none;appearance:none;width:170px;height:3px;background:rgba(255,255,255,.18);border-radius:2px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--acc);cursor:pointer;box-shadow:0 0 0 4px rgba(232,167,74,.18)}
.seg{display:flex;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.seg button{background:none;border:0;color:var(--mut);font:inherit;font-size:12px;padding:6px 10px;cursor:pointer;letter-spacing:.06em}
.seg button.on{background:rgba(232,167,74,.2);color:var(--ink)}
.key{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:24px;padding:0 7px;border:1px solid rgba(255,255,255,.4);border-bottom-width:2px;border-radius:5px;font-size:12px;font-weight:600;color:#fff;background:rgba(255,255,255,.07);letter-spacing:.02em;white-space:nowrap}
.bind{cursor:pointer;min-width:90px;pointer-events:auto}
.bind.wait{border-color:var(--acc);color:var(--acc)}
.btnrow{display:flex;gap:12px;margin-top:22px;justify-content:flex-end}
.btn{pointer-events:auto;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--ink);font:inherit;font-size:13px;letter-spacing:.14em;text-transform:uppercase;padding:10px 18px;border-radius:6px;cursor:pointer}
.btn:hover{border-color:var(--acc);background:rgba(232,167,74,.12)}
.btn.pri{background:rgba(232,167,74,.2);border-color:rgba(232,167,74,.55)}
input[type=text]{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--ink);font:inherit;padding:8px 10px;border-radius:6px;width:180px;outline:none;pointer-events:auto}
#cross{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 0 3px rgba(0,0,0,.8);transition:transform .15s}
#cross.act{transform:scale(1.7);background:#fff}
#ring{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;transform:rotate(-90deg)}
#ring circle{fill:none;stroke-width:3}
#target{position:absolute;left:50%;top:calc(50% + 36px);transform:translateX(-50%);text-align:center;text-shadow:0 1px 3px rgba(0,0,0,.95),0 0 14px rgba(0,0,0,.55);min-width:300px}
#target .nm{font-size:17px;font-weight:600;letter-spacing:.03em}
#target .inf{font-size:13px;color:#e6dccb;margin-top:3px}
#target .inf.hl{color:var(--acc2);font-size:19px;font-weight:600}
#target .acts{margin-top:9px;display:flex;flex-direction:column;gap:5px;align-items:center}
#target .act{display:flex;align-items:center;gap:8px;font-size:14px}
#stats{position:absolute;left:22px;bottom:22px;display:flex;flex-direction:column;gap:7px}
.st{display:flex;align-items:center;gap:9px;opacity:.95;transition:opacity .4s}
.st svg{width:17px;height:17px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}
.st .b{width:150px;height:6px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.12);border-radius:3px;overflow:hidden}
.st .b i{display:block;height:100%;border-radius:2px;transition:width .3s}
.st.low{animation:pulse 1s infinite}
@keyframes pulse{50%{opacity:.35}}
#hotbar{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:8px;align-items:flex-end}
.slot{width:62px;height:62px;border:1px solid rgba(255,255,255,.16);background:rgba(10,9,8,.5);border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}
.slot img{width:58px;height:58px;object-fit:contain}
.slot .n{position:absolute;left:5px;top:3px;font-size:11px;color:var(--mut);font-weight:600}
.slot .q{position:absolute;right:5px;bottom:3px;font-size:10px;color:#fff;text-shadow:0 1px 2px #000}
.slot.hand{width:76px;height:76px;border-color:rgba(232,167,74,.55);margin-left:10px}
.slot.hand .n{color:var(--acc)}
#handname{position:absolute;left:50%;bottom:106px;transform:translateX(-50%);font-size:13px;color:#e8dcc8;text-shadow:0 1px 3px #000;letter-spacing:.04em;white-space:nowrap}
#toasts{position:absolute;right:24px;top:22px;display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.toast{background:rgba(12,10,8,.74);border-left:3px solid var(--acc);padding:9px 14px;font-size:14px;border-radius:4px;animation:tin .35s ease;max-width:400px;transition:opacity .6s}
.toast.bad{border-color:var(--red)}
@keyframes tin{from{opacity:0;transform:translateX(20px)}}
#hint{position:absolute;left:50%;top:12%;transform:translateX(-50%);background:rgba(12,10,8,.72);border:1px solid rgba(232,167,74,.35);padding:12px 18px;border-radius:8px;font-size:15px;max-width:680px;text-align:center;line-height:1.55;text-shadow:0 1px 2px #000;transition:opacity .6s}
#hint small{display:block;color:var(--acc2);letter-spacing:.24em;font-size:11px;text-transform:uppercase;margin-bottom:4px}
#compass{position:absolute;left:50%;top:14px;transform:translateX(-50%);width:420px;height:32px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent);mask-image:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent)}
#compass canvas{position:absolute;left:0;top:0}
#carhud{position:absolute;right:26px;bottom:24px;text-align:right;text-shadow:0 1px 4px rgba(0,0,0,.9)}
#carhud .spd{font-size:44px;font-weight:300;line-height:1}
#carhud .spd small{font-size:13px;color:var(--mut);margin-left:4px;letter-spacing:.1em}
#carhud .gear{display:inline-block;margin-left:10px;font-size:22px;font-weight:700;color:var(--acc);min-width:18px}
#carhud .row2{margin-top:6px;display:flex;gap:10px;justify-content:flex-end;align-items:center;font-size:12px;color:#ddd}
#carhud .fuel{width:110px;height:5px;background:rgba(0,0,0,.5);border-radius:3px;overflow:hidden;display:inline-block}
#carhud .fuel i{display:block;height:100%;background:var(--acc)}
#carhud .warn{color:var(--red);font-weight:700;letter-spacing:.08em}
#carhud .ficon{width:14px;height:14px;fill:#e8dcc8;opacity:.85}
#fps{position:absolute;right:10px;bottom:6px;font-size:11px;color:rgba(255,255,255,.55);font-family:monospace}
#radioname{position:absolute;left:50%;top:22%;transform:translateX(-50%);font-size:15px;letter-spacing:.2em;color:#f4d49a;text-shadow:0 1px 6px #000;text-transform:uppercase;transition:opacity .8s}
#blood{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(120,0,0,0) 40%,rgba(150,10,5,.6) 100%);opacity:0}
#blackout{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .9s}
#note .paper{pointer-events:auto;width:min(640px,90vw);max-height:84vh;overflow:auto;background:linear-gradient(180deg,#efe4c8,#e2d3b0);color:#2a2014;padding:40px 48px;border-radius:3px;box-shadow:0 30px 90px rgba(0,0,0,.6),inset 0 0 60px rgba(120,90,40,.25);font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:18px;line-height:1.65;white-space:pre-wrap;transform:rotate(-.6deg)}
#note .close{margin-top:18px;text-align:center;font-family:"Segoe UI",Arial,sans-serif;font-style:normal;font-size:12px;color:#5a4a34;letter-spacing:.2em;text-transform:uppercase}
#death{background:radial-gradient(ellipse at center,rgba(40,4,2,.72),rgba(0,0,0,.94));pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
#death h1,#win h1{font-weight:200;letter-spacing:.5em;font-size:clamp(36px,5vw,64px);margin:0;color:#e8d8c8}
#death .cause{margin-top:10px;color:#d88a70;letter-spacing:.1em}
#win{background:radial-gradient(ellipse at center,rgba(60,40,10,.6),rgba(0,0,0,.9));pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.statsg{display:grid;grid-template-columns:repeat(4,auto);gap:10px 40px;margin:36px 0;text-align:left}
.statsg div{font-size:12px;color:var(--mut);letter-spacing:.14em;text-transform:uppercase}
.statsg b{display:block;font-size:24px;color:var(--ink);font-weight:300;letter-spacing:.02em;margin-top:4px}
.jgrid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.jbox{border:1px solid var(--line);border-radius:8px;padding:14px 16px}
.jbox h3{margin:0 0 10px;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--acc2);font-weight:600}
.jl{display:flex;justify-content:space-between;font-size:14px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.jl span:last-child{color:#fff}
.meter{height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin:2px 0 6px}
.meter i{display:block;height:100%;background:var(--acc)}
.ctl{display:grid;grid-template-columns:auto 1fr;gap:7px 14px;font-size:13px;align-items:center}
.clickme{pointer-events:auto;position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:22vh;font-size:14px;letter-spacing:.3em;color:#e8dcc8;text-transform:uppercase;text-shadow:0 1px 4px #000;cursor:pointer;animation:pulse 2.4s infinite}
`;
var kM = { lang: "ru", quality: 2, renderScale: 1, brightness: 1, fov: 75, sensitivity: 1, invertY: false, headBob: true, showFps: false, master: 0.8, sfx: 0.9, ambient: 0.8, radio: 0.7, music: 0.6, engine: 0.9, auto: true, hints: true, dayLength: 24, carHud: true, difficulty: 1, mirrors: true, bindings: {} }, Uu = { health: '<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"/>', hunger: '<path d="M7 2v7a2 2 0 0 0 1.5 1.9V22h2V10.9A2 2 0 0 0 12 9V2h-1.3v6H9.6V2H8.4v6H7.3V2zM16 2c-1.7 0-3 2.4-3 5.5 0 2.2.9 3.9 2 4.5V22h2V2z"/>', thirst: '<path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5z"/>', energy: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>', stamina: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>' }, MM = { health: "#e0523e", hunger: "#e0a03e", thirst: "#5fa8e8", energy: "#a88be0", stamina: "#e8e0c8" };
function dh(B, A = "", I = "") {
  let g = document.createElement(B);
  return A && (g.className = A), I && (g.innerHTML = I), g;
}
var Rh = class {
  root;
  settings;
  layers = {};
  hudEls = {};
  lastHud = "";
  hintTimer = 0;
  radioTimer = 0;
  state = "loading";
  settingsReturn = "menu";
  compassCanvas;
  hooks;
  get lang() {
    return this.settings.lang;
  }
  constructor() {
    let A = document.createElement("style");
    A.textContent = yM, document.head.appendChild(A), this.root = dh("div"), this.root.id = "ui", document.body.appendChild(this.root), this.settings = this.loadSettings(), es(this.settings.lang);
    for (let I of ["hud", "menu", "overlay", "note", "death", "win", "loading"]) {
      let g = dh("div", "layer hidden");
      g.id = I, this.root.appendChild(g), this.layers[I] = g;
    }
    this.buildHud();
  }
  loadSettings() {
    try {
      let A = JSON.parse(localStorage.getItem("tlr_settings") || "{}");
      return { ...kM, ...A, bindings: A.bindings || {} };
    } catch {
      return { ...kM };
    }
  }
  saveSettings() {
    try {
      localStorage.setItem("tlr_settings", JSON.stringify(this.settings));
    } catch {
    }
  }
  show(A, I = true) {
    this.layers[A].classList.toggle("hidden", !I);
  }
  logo() {
    return `<div class="logo"><div class="t1">THE <b>LONG</b> ROAD</div><div class="t2">${J("Пустыня · 1979", "Desert · 1979")}</div></div>`;
  }
  showLoading() {
    this.state = "loading";
    let A = [J("Держитесь дороги: заправки и дома стоят только вдоль неё.", "Stay on the road: gas stations and houses only line the highway."), J("Без воды в радиаторе двигатель перегреется за пару минут.", "Without water in the radiator the engine overheats in minutes."), J("Дизель в бензиновом моторе — верный способ заглохнуть посреди пустыни.", "Diesel in a petrol engine is a sure way to stall in the middle of nowhere."), J("Гаечным ключом можно снять почти любую деталь с брошенной машины.", "A wrench lets you strip almost any part off an abandoned car."), J("Ночью в пустыне выходят кролики. Не спорьте с ними пешком.", "Rabbits come out at night. Do not argue with them on foot.")];
    this.layers.loading.innerHTML = `${this.logo()}<div class="lbl" id="ldl">${J("Загрузка", "Loading")}</div><div class="bar"><i id="ldb"></i></div><div class="tip">${A[Math.floor(Math.random() * A.length)]}</div>`, this.show("loading");
  }
  setLoading(A, I) {
    let g = document.getElementById("ldb");
    g && (g.style.width = `${Math.round(A * 100)}%`);
    let C = { physics: ["Физика", "Physics"], textures: ["Текстуры", "Textures"], sky: ["Небо", "Sky"], world: ["Пустыня", "Desert"], creatures: ["Обитатели", "Creatures"], car: ["Машина", "Car"], terrain: ["Рельеф", "Terrain"], env: ["Атмосфера", "Atmosphere"], done: ["Готово", "Ready"], audio: ["Звук", "Audio"] }, Q = document.getElementById("ldl");
    Q && (Q.textContent = (C[I] ? J(...C[I]) : I) + " · " + Math.round(A * 100) + "%");
  }
  hideLoading() {
    this.show("loading", false);
  }
  loadingDone(A, I = false) {
    let g = document.getElementById("ldb");
    g && (g.style.width = "100%");
    let C = document.getElementById("ldl");
    C && (C.textContent = J("Готово", "Ready"));
    let Q = this.layers.loading, i = dh("div", "go", J("Нажмите любую клавишу, чтобы начать", "Press any key to start"));
    Q.appendChild(i);
    let E = false, t = (o) => {
      E || o instanceof KeyboardEvent && ["Tab", "Alt", "Meta", "ControlLeft"].includes(o.code) || (E = true, window.removeEventListener("keydown", t, true), window.removeEventListener("mousedown", t, true), Q.classList.add("fade"), setTimeout(() => {
        this.show("loading", false), Q.classList.remove("fade");
      }, 800), A());
    };
    I ? t() : (window.addEventListener("keydown", t, true), window.addEventListener("mousedown", t, true));
  }
  showMenu() {
    this.state = "menu", this.hideOverlays(), this.show("hud", false);
    let A = this.layers.menu;
    A.className = "layer menu";
    let I = this.hooks.hasSave();
    A.innerHTML = `${this.logo()}
      <div class="items">
        <button class="mbtn" data-a="continue" ${I ? "" : "disabled"}>${J("Продолжить", "Continue")}<small>${I ? J("Последнее сохранение", "Last save") : J("Нет сохранений", "No saves")}</small></button>
        <button class="mbtn" data-a="new">${J("Новая игра", "New game")}</button>
        <button class="mbtn" data-a="settings">${J("Настройки", "Settings")}</button>
        <button class="mbtn" data-a="controls">${J("Управление", "Controls")}</button>
        <button class="mbtn" data-a="about">${J("Об игре", "About")}</button>
      </div>
      <div class="foot">v1.0 · <b>THE LONG ROAD</b> · ${J("процедурная пустыня, созданная кодом", "a procedural desert made entirely of code")}</div>`, this.bindButtons(A, { continue: () => this.hooks.continueGame(), new: () => this.showNewGame(), settings: () => this.showSettings("menu"), controls: () => this.showSettings("menu", "controls"), about: () => this.showAbout() }), this.show("menu");
  }
  bindButtons(A, I) {
    A.querySelectorAll("[data-a]").forEach((g) => {
      g.addEventListener("mouseenter", () => this.hooks.hover()), g.addEventListener("click", (C) => {
        C.stopPropagation(), this.hooks.click(), I[g.dataset.a]?.();
      });
    });
  }
  showNewGame() {
    let A = Math.floor(Math.random() * 99999);
    this.overlay(`<h2>${J("Новая <b>игра</b>", "New <b>game</b>")}</h2>
      <div class="row"><label>${J("Сид мира", "World seed")}</label><div class="v"><input type="text" id="seed" value="${A}"></div></div>
      <div class="row"><label>${J("Сложность", "Difficulty")}</label><div class="v">${this.seg("difficulty", [[0.6, J("Легко", "Easy")], [1, J("Норма", "Normal")], [1.5, J("Сурово", "Harsh")]])}</div></div>
      <div class="row"><label>${J("Коробка передач", "Transmission")}</label><div class="v">${this.seg("auto", [[true, J("Автомат", "Automatic")], [false, J("Механика", "Manual")]])}</div></div>
      <p style="color:var(--mut);font-size:13px;max-width:560px;line-height:1.55">${J("Мать ждёт вас на побережье — в пяти тысячах километров по старому шоссе. Машина в гараже, аккумулятор на верстаке. Удачи.", "Your mother is waiting on the coast — five thousand kilometres down the old highway. The car is in the garage, the battery on the workbench. Good luck.")}</p>
      <div class="btnrow"><button class="btn" data-a="back">${J("Назад", "Back")}</button><button class="btn pri" data-a="go">${J("В путь", "Start")}</button></div>`), this.wireSegs(this.layers.overlay), this.bindButtons(this.layers.overlay, { back: () => this.hideOverlays(), go: () => {
      let I = Number(document.getElementById("seed").value.replace(/\D/g, "")) || 1;
      this.saveSettings(), this.hooks.applySettings(this.settings), this.hooks.newGame(I);
    } });
  }
  showAbout() {
    this.overlay(`<h2>${J("Об <b>игре</b>", "<b>About</b>")}</h2>
      <p style="max-width:620px;line-height:1.7;color:#ddd3c3">${J("THE LONG ROAD — бесконечная процедурная пустыня, старый седан и дорога длиной в пять тысяч километров. Ищите топливо и воду, чините и дорабатывайте машину, исследуйте брошенные заправки и дома, прячьтесь от песчаных бурь и тех, кто выходит ночью.", "THE LONG ROAD is an endless procedural desert, an old sedan and a five-thousand-kilometre highway. Scavenge fuel and water, repair and rebuild your car, explore abandoned stations and homes, hide from sandstorms and from whatever comes out at night.")}</p>
      <p style="max-width:620px;line-height:1.7;color:var(--mut);font-size:13px">${J("Все модели, текстуры, звуки и музыка сгенерированы кодом в реальном времени. Вдохновлено The Long Drive.", "Every model, texture, sound and piece of music is generated by code at runtime. Inspired by The Long Drive.")}</p>
      <div class="btnrow"><button class="btn" data-a="back">${J("Закрыть", "Close")}</button></div>`), this.bindButtons(this.layers.overlay, { back: () => this.hideOverlays() });
  }
  overlay(A) {
    let I = this.layers.overlay;
    I.className = "layer overlay", I.innerHTML = `<div class="panel">${A}</div>`, this.show("overlay");
  }
  hideOverlays() {
    this.show("overlay", false), this.show("note", false);
  }
  seg(A, I) {
    let g = this.settings[A];
    return `<div class="seg" data-seg="${A}">${I.map(([C, Q]) => `<button data-v='${JSON.stringify(C)}' class="${JSON.stringify(C) === JSON.stringify(g) ? "on" : ""}">${Q}</button>`).join("")}</div>`;
  }
  range(A, I, g, C, Q) {
    let i = this.settings[A];
    return `<input type="range" data-range="${A}" min="${I}" max="${g}" step="${C}" value="${i}"><span data-rv="${A}">${Q(i)}</span>`;
  }
  wireSegs(A, I = {}) {
    A.querySelectorAll("[data-seg]").forEach((g) => {
      g.querySelectorAll("button").forEach((C) => C.addEventListener("click", (Q) => {
        Q.stopPropagation(), this.hooks.click(), this.settings[g.dataset.seg] = JSON.parse(C.dataset.v), g.querySelectorAll("button").forEach((i) => i.classList.toggle("on", i === C)), g.dataset.seg === "lang" ? (es(this.settings.lang), this.saveSettings(), this.hooks.applySettings(this.settings), this.showSettings(this.settingsReturn, "game")) : this.hooks.applySettings(this.settings);
      }));
    }), A.querySelectorAll("[data-range]").forEach((g) => g.addEventListener("input", () => {
      let C = g.dataset.range;
      this.settings[C] = Number(g.value);
      let Q = A.querySelector(`[data-rv="${C}"]`);
      Q && (Q.textContent = (I[C] ?? ((i) => String(i)))(Number(g.value))), this.hooks.applySettings(this.settings);
    }));
  }
  showSettings(A, I = "graphics") {
    this.settingsReturn = A, this.state = "settings";
    let g = (t) => Math.round(t * 100) + "%", C = { renderScale: g, brightness: g, master: g, sfx: g, ambient: g, radio: g, music: g, engine: g, fov: (t) => t + "°", sensitivity: (t) => t.toFixed(2), dayLength: (t) => t + " " + J("мин", "min") }, Q = { graphics: `
        <div class="row"><label>${J("Качество графики", "Graphics quality")}</label><div class="v">${this.seg("quality", [[0, J("Низкое", "Low")], [1, J("Среднее", "Medium")], [2, J("Высокое", "High")], [3, J("Ультра", "Ultra")]])}</div></div>
        <div class="row"><label>${J("Масштаб рендера", "Render scale")}</label><div class="v">${this.range("renderScale", 0.5, 1, 0.05, C.renderScale)}</div></div>
        <div class="row"><label>${J("Яркость", "Brightness")}</label><div class="v">${this.range("brightness", 0.6, 1.5, 0.05, C.brightness)}</div></div>
        <div class="row"><label>${J("Поле зрения", "Field of view")}</label><div class="v">${this.range("fov", 60, 100, 1, C.fov)}</div></div>
        <div class="row"><label>${J("Зеркала заднего вида", "Rear-view mirrors")}</label><div class="v">${this.seg("mirrors", [[true, J("Вкл", "On")], [false, J("Выкл", "Off")]])}</div></div>
        <div class="row"><label>${J("Покачивание камеры", "Head bob")}</label><div class="v">${this.seg("headBob", [[true, J("Вкл", "On")], [false, J("Выкл", "Off")]])}</div></div>
        <div class="row"><label>${J("Счётчик FPS", "FPS counter")}</label><div class="v">${this.seg("showFps", [[true, J("Вкл", "On")], [false, J("Выкл", "Off")]])}</div></div>`, audio: ["master", "sfx", "engine", "ambient", "radio", "music"].map((t) => `<div class="row"><label>${{ master: J("Общая громкость", "Master volume"), sfx: J("Эффекты", "Effects"), engine: J("Двигатель", "Engine"), ambient: J("Окружение", "Ambience"), radio: J("Радио", "Radio"), music: J("Музыка меню", "Menu music") }[t]}</label><div class="v">${this.range(t, 0, 1, 0.01, g)}</div></div>`).join(""), controls: `
        <div class="row"><label>${J("Чувствительность мыши", "Mouse sensitivity")}</label><div class="v">${this.range("sensitivity", 0.2, 3, 0.05, C.sensitivity)}</div></div>
        <div class="row"><label>${J("Инверсия по вертикали", "Invert Y")}</label><div class="v">${this.seg("invertY", [[false, J("Нет", "No")], [true, J("Да", "Yes")]])}</div></div>
        <div class="row"><label>${J("Коробка передач", "Transmission")}</label><div class="v">${this.seg("auto", [[true, J("Автомат", "Automatic")], [false, J("Механика", "Manual")]])}</div></div>
        ${this.bindRows()}
        <div class="btnrow" style="justify-content:flex-start"><button class="btn" data-a="resetkeys">${J("Сбросить клавиши", "Reset keys")}</button></div>`, game: `
        <div class="row"><label>${J("Язык", "Language")}</label><div class="v">${this.seg("lang", [["ru", "Русский"], ["en", "English"]])}</div></div>
        <div class="row"><label>${J("Подсказки", "Hints")}</label><div class="v">${this.seg("hints", [[true, J("Вкл", "On")], [false, J("Выкл", "Off")]])}</div></div>
        <div class="row"><label>${J("Панель машины на экране", "On-screen car panel")}</label><div class="v">${this.seg("carHud", [[true, J("Вкл", "On")], [false, J("Выкл", "Off")]])}</div></div>
        <div class="row"><label>${J("Длина суток", "Day length")}</label><div class="v">${this.range("dayLength", 12, 60, 6, C.dayLength)}</div></div>
        <div class="row"><label>${J("Сложность", "Difficulty")}</label><div class="v">${this.seg("difficulty", [[0.6, J("Легко", "Easy")], [1, J("Норма", "Normal")], [1.5, J("Сурово", "Harsh")]])}</div></div>` }, i = { graphics: J("Графика", "Graphics"), audio: J("Звук", "Audio"), controls: J("Управление", "Controls"), game: J("Игра", "Game") };
    this.overlay(`<h2>${J("<b>Настройки</b>", "<b>Settings</b>")}</h2>
      <div class="tabs">${Object.keys(Q).map((t) => `<button class="tab ${t === I ? "on" : ""}" data-tab="${t}">${i[t]}</button>`).join("")}</div>
      <div style="min-width:min(640px,86vw)">${Q[I]}</div>
      <div class="btnrow"><button class="btn pri" data-a="done">${J("Готово", "Done")}</button></div>`);
    let E = this.layers.overlay;
    E.querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", (o) => {
      o.stopPropagation(), this.hooks.click(), this.showSettings(A, t.dataset.tab);
    })), this.wireSegs(E, C), E.querySelectorAll("[data-bind]").forEach((t) => t.addEventListener("click", (o) => {
      o.stopPropagation(), t.classList.add("wait"), t.textContent = "…", this.hooks.captureKey((e) => {
        e !== "Escape" && (this.settings.bindings[t.dataset.bind] = [e]), this.saveSettings(), this.hooks.applySettings(this.settings), this.showSettings(A, "controls");
      });
    })), this.bindButtons(E, { done: () => {
      this.saveSettings(), this.hooks.applySettings(this.settings), A === "pause" ? this.showPause() : (this.hideOverlays(), this.state = "menu");
    }, resetkeys: () => {
      this.settings.bindings = {}, this.saveSettings(), this.hooks.applySettings(this.settings), this.showSettings(A, "controls");
    } });
  }
  bindRows() {
    return [["forward", J("Вперёд / газ", "Forward / throttle")], ["back", J("Назад / тормоз", "Back / brake")], ["left", J("Влево", "Left")], ["right", J("Вправо", "Right")], ["jump", J("Прыжок / ручник", "Jump / handbrake")], ["sprint", J("Бег", "Sprint")], ["crouch", J("Присесть", "Crouch")], ["interact", J("Взаимодействие", "Interact")], ["drop", J("Выбросить", "Drop")], ["reload", J("Перезарядка / передача +", "Reload / gear up")], ["flashlight", J("Фонарик / передача −", "Flashlight / gear down")], ["ignition", J("Зажигание (держать)", "Ignition (hold)")], ["headlights", J("Фары", "Headlights")], ["horn", J("Сигнал", "Horn")], ["radio", J("Радио", "Radio")], ["camera", J("Вид камеры", "Camera view")], ["journal", J("Журнал", "Journal")], ["sleep", J("Спать в машине", "Sleep in car")]].map(([I, g]) => {
      let C = (this.settings.bindings[I] ?? ts[I])[0] ?? "?";
      return `<div class="row"><label>${g}</label><div class="v"><span class="key bind" data-bind="${I}">${Ku(C)}</span></div></div>`;
    }).join("");
  }
  showPause() {
    this.state = "pause", this.overlay(`<h2>${J("<b>Пауза</b>", "<b>Paused</b>")}</h2>
      <div class="col">
        <button class="mbtn" data-a="resume">${J("Продолжить", "Resume")}</button>
        <button class="mbtn" data-a="journal">${J("Журнал", "Journal")}</button>
        <button class="mbtn" data-a="save">${J("Сохранить", "Save")}</button>
        <button class="mbtn" data-a="load" ${this.hooks.hasSave() ? "" : "disabled"}>${J("Загрузить", "Load")}</button>
        <button class="mbtn" data-a="settings">${J("Настройки", "Settings")}</button>
        <button class="mbtn" data-a="quit">${J("Выйти в меню", "Quit to menu")}</button>
      </div>`), this.bindButtons(this.layers.overlay, { resume: () => this.hooks.resume(), journal: () => this.showJournal(true), save: () => {
      this.hooks.save(), this.toast(J("Игра сохранена", "Game saved"));
    }, load: () => this.hooks.load(), settings: () => this.showSettings("pause"), quit: () => this.hooks.quitToMenu() });
  }
  showJournal(A = false) {
    this.state = "journal";
    let I = this.hooks.journal(), g = (i, E) => `<div class="jl"><span>${i}</span><span>${E}</span></div>`, C = (i, E, t, o = "var(--acc)") => `${g(i, t)}<div class="meter"><i style="width:${Math.round(Math.max(0, Math.min(1, E)) * 100)}%;background:${o}"></i></div>`, Q = I.car;
    this.overlay(`<h2>${J("<b>Журнал</b>", "<b>Journal</b>")}</h2>
      <div class="jgrid">
        <div class="jbox"><h3>${J("Путь", "Journey")}</h3>
          ${C(J("До побережья", "To the coast"), I.km / I.goal, `${Math.max(0, I.goal - I.km).toFixed(0)} ${J("км", "km")}`)}
          ${g(J("Пройдено по трассе", "Along the highway"), `${I.km.toFixed(1)} ${J("км", "km")}`)}
          ${g(J("День", "Day"), `${I.day} · ${I.time}`)}
          ${g(J("Погода", "Weather"), I.weather)}
          ${g(J("Температура", "Temperature"), `${I.temp.toFixed(0)} °C`)}
          ${g(J("Деньги", "Money"), `$${I.money.toFixed(0)}`)}
          ${g(J("Убито тварей", "Creatures killed"), String(I.kills))}
        </div>
        <div class="jbox"><h3>${J("Машина", "Car")}</h3>
          ${Q ? `
          ${C(J("Топливо", "Fuel"), Q.fuel / 40, `${Q.fuel.toFixed(1)} / 40 ${J("л", "L")}`)}
          ${C(J("Масло", "Oil"), Q.oil / 3.5, Q.hasEngine ? `${Q.oil.toFixed(1)} / 3.5 ${J("л", "L")}` : J("нет двигателя", "no engine"), "#c8a060")}
          ${C(J("Охлаждение", "Coolant"), Q.coolant / 5, Q.hasRad ? `${Q.coolant.toFixed(1)} / 5 ${J("л", "L")}` : J("нет радиатора", "no radiator"), "var(--blu)")}
          ${C(J("Аккумулятор", "Battery"), Q.batt, Q.hasBatt ? `${Math.round(Q.batt * 100)}%` : J("нет", "none"), "var(--grn)")}
          ${C(J("Двигатель", "Engine"), Q.engine, Q.hasEngine ? `${Math.round(Q.engine * 100)}%` : "—", "#e0a03e")}
          ${g(J("Пробег", "Odometer"), `${Q.odo.toFixed(0)} ${J("км", "km")}`)}
          ${g(J("Недостающие детали", "Missing parts"), Q.missing || J("нет", "none"))}` : `<div style="color:var(--mut)">${J("Машина потеряна", "Car lost")}</div>`}
        </div>
        <div class="jbox" style="grid-column:1 / span 2"><h3>${J("Управление", "Controls")}</h3>
          <div class="ctl">${Gu()}</div>
        </div>
      </div>
      <div class="btnrow"><button class="btn pri" data-a="close">${J("Закрыть", "Close")}</button></div>`), this.bindButtons(this.layers.overlay, { close: () => A ? this.showPause() : this.hooks.resume() });
  }
  showDeath(A, I) {
    this.state = "death", this.hideOverlays();
    let g = this.layers.death;
    g.innerHTML = `<h1>${J("ВЫ ПОГИБЛИ", "YOU DIED")}</h1><div class="cause">${A}</div>
      <div class="statsg"><div>${J("Пройдено", "Distance")}<b>${I.km.toFixed(1)} ${J("км", "km")}</b></div><div>${J("Дней", "Days")}<b>${I.days}</b></div><div>${J("Убито", "Kills")}<b>${I.kills}</b></div><div>${J("Время", "Time")}<b>${I.time}</b></div></div>
      <div class="btnrow" style="justify-content:center">
        <button class="btn" data-a="load" ${this.hooks.hasSave() ? "" : "disabled"}>${J("Загрузить сохранение", "Load save")}</button>
        <button class="btn pri" data-a="new">${J("Новая игра", "New game")}</button>
        <button class="btn" data-a="menu">${J("Главное меню", "Main menu")}</button>
      </div>`, this.bindButtons(g, { load: () => this.hooks.load(), new: () => {
      this.show("death", false), this.showMenu(), this.showNewGame();
    }, menu: () => this.hooks.quitToMenu() }), this.show("death");
  }
  hideDeath() {
    this.show("death", false), this.show("win", false);
  }
  showWin(A) {
    this.state = "win";
    let I = this.layers.win;
    I.innerHTML = `<h1>${J("ВЫ ДОЕХАЛИ", "YOU MADE IT")}</h1><div class="cause" style="color:var(--acc2);margin-top:12px;letter-spacing:.12em">${J("Пять тысяч километров позади. Впереди — море.", "Five thousand kilometres behind you. The sea lies ahead.")}</div>
      <div class="statsg"><div>${J("Пройдено", "Distance")}<b>${A.km.toFixed(0)} ${J("км", "km")}</b></div><div>${J("Дней", "Days")}<b>${A.days}</b></div><div>${J("Убито", "Kills")}<b>${A.kills}</b></div><div>${J("Время", "Time")}<b>${A.time}</b></div></div>
      <div class="btnrow" style="justify-content:center"><button class="btn pri" data-a="go">${J("Ехать дальше", "Keep driving")}</button><button class="btn" data-a="menu">${J("Главное меню", "Main menu")}</button></div>`, this.bindButtons(I, { go: () => {
      this.show("win", false), this.hooks.resume();
    }, menu: () => this.hooks.quitToMenu() }), this.show("win");
  }
  showNote(A) {
    this.state = "note";
    let I = A === "letter" ? sM[this.lang] : Rl[A] ? Rl[A][this.lang === "ru" ? 0 : 1] : A, g = this.layers.note;
    g.className = "layer overlay", g.innerHTML = `<div class="paper">${I.replace(/</g, "&lt;")}<div class="close">${J("Нажмите E или ЛКМ, чтобы закрыть", "Press E or click to close")}</div></div>`, g.onclick = () => this.hooks.resume(), this.show("note");
  }
  buildHud() {
    let A = this.layers.hud;
    A.innerHTML = `
      <div id="blood"></div>
      <div id="compass"><canvas width="420" height="32"></canvas></div>
      <div id="cross"></div>
      <svg id="ring" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" stroke="rgba(0,0,0,.35)"/><circle id="ringv" cx="23" cy="23" r="19" stroke="#f3c77a" stroke-dasharray="119.4" stroke-dashoffset="119.4" stroke-linecap="round"/></svg>
      <div id="target"></div>
      <div id="stats">${["health", "hunger", "thirst", "energy", "stamina"].map((I) => `<div class="st" id="st_${I}"><svg viewBox="0 0 24 24" fill="${MM[I]}">${Uu[I]}</svg><div class="b"><i style="background:${MM[I]}"></i></div></div>`).join("")}</div>
      <div id="handname"></div>
      <div id="hotbar">${[1, 2, 3, 4].map((I) => `<div class="slot" id="slot${I}"><span class="n">${I}</span></div>`).join("")}<div class="slot hand" id="slothand"><span class="n">✋</span></div></div>
      <div id="toasts"></div>
      <div id="hint" class="hidden"></div>
      <div id="radioname" style="opacity:0"></div>
      <div id="carhud" class="hidden"><div class="spd"><span id="ch_s">0</span><small>${J("км/ч", "km/h")}</small><span class="gear" id="ch_g">N</span></div><div class="row2"><span id="ch_w" class="warn"></span><svg class="ficon" viewBox="0 0 24 24"><path d="M5 3h8a1 1 0 0 1 1 1v7h1.5a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0V9.4l-2.2-2.2 1.4-1.4 2.6 2.6c.4.4.7.9.7 1.4V17a3 3 0 0 1-6 0v-4H14v8H4V4a1 1 0 0 1 1-1zm1 2v5h6V5z"/></svg><span class="fuel"><i id="ch_f"></i></span></div></div>
      <div id="fps" class="hidden"></div>
      <div id="blackout"></div>`;
    for (let I of ["cross", "ring", "ringv", "target", "handname", "toasts", "hint", "radioname", "carhud", "ch_s", "ch_g", "ch_w", "ch_f", "fps", "blood", "blackout", "compass", "hotbar", "stats"]) this.hudEls[I] = A.querySelector("#" + I);
    this.compassCanvas = A.querySelector("#compass canvas");
  }
  showHud(A) {
    this.show("hud", A), A && (this.state = "game", this.show("menu", false));
  }
  setBlackout(A) {
    this.hudEls.blackout.style.opacity = String(A);
  }
  updateHud(A, I) {
    let g = this.hudEls, C = A.target, Q = C ? C.name + "|" + C.info.join("|") + "|" + C.actions.map((s) => s.key + s.label).join("|") : "";
    if (Q !== this.lastHud) if (this.lastHud = Q, C) {
      let s = C.info.length && /\d/.test(C.info[0]) && /(л|L|%|\$)/.test(C.info[0]);
      g.target.innerHTML = `<div class="nm">${C.name}</div>${C.info.map((a, n) => `<div class="inf ${n === 0 && s ? "hl" : ""}">${a}</div>`).join("")}<div class="acts">${C.actions.map((a) => `<div class="act"><span class="key">${a.key}</span><span>${a.label}</span></div>`).join("")}</div>`;
    } else g.target.innerHTML = "";
    g.cross.classList.toggle("act", !!C && C.actions.length > 0), g.ring.style.opacity = A.hold > 0 ? "1" : "0", g.ringv.style.strokeDashoffset = String(119.4 * (1 - Math.min(1, A.hold)));
    let i = A.stats;
    for (let s of ["health", "hunger", "thirst", "energy", "stamina"]) {
      let a = document.getElementById("st_" + s), n = i[s];
      a.querySelector("i").style.width = `${Math.max(0, Math.min(100, n))}%`, a.classList.toggle("low", n < 20 && s !== "stamina"), s === "stamina" && (a.style.opacity = n < 99 ? "0.95" : "0");
    }
    let E = (s, a) => `<span class="n">${a}</span>${s ? `<img src="${s.icon}" alt=""><span class="q">${s.qty}</span>` : ""}`;
    A.slots.forEach((s, a) => {
      let n = document.getElementById("slot" + (a + 1)), r = s ? s.icon + s.qty : "";
      n.dataset.k !== r && (n.dataset.k = r, n.innerHTML = E(s, String(a + 1)));
    });
    let t = document.getElementById("slothand"), o = A.hand ? A.hand.icon + A.hand.qty : "";
    t.dataset.k !== o && (t.dataset.k = o, t.innerHTML = E(A.hand, "✋")), g.handname.textContent = A.hand ? A.hand.name : "", g.hotbar.style.opacity = A.inCar ? "0.55" : "1", g.compass.style.display = A.compass === null ? "none" : "block", A.compass !== null && this.drawCompass(A.compass);
    let e = A.car;
    g.carhud.classList.toggle("hidden", !e || !this.settings.carHud), e && (g.ch_s.textContent = String(Math.round(Math.abs(e.speed))), g.ch_g.textContent = e.gear, g.ch_f.style.width = `${Math.round(e.fuel * 100)}%`, g.ch_w.textContent = e.warn), g.fps.classList.toggle("hidden", !this.settings.showFps), this.settings.showFps && (g.fps.textContent = `${A.fps.toFixed(0)} FPS`), g.blood.style.opacity = String(Math.min(0.9, A.hurt)), this.hintTimer > 0 && (this.hintTimer -= I, this.hintTimer <= 0 && (g.hint.style.opacity = "0"), this.hintTimer <= -0.7 && g.hint.classList.add("hidden")), this.radioTimer > 0 && (this.radioTimer -= I, this.radioTimer <= 0 && (g.radioname.style.opacity = "0"));
  }
  drawCompass(A) {
    let I = this.compassCanvas, g = I.getContext("2d");
    g.clearRect(0, 0, I.width, I.height);
    let C = (-A * 180 / Math.PI + 180) % 360;
    C < 0 && (C += 360);
    let Q = 2.4;
    g.textAlign = "center", g.font = "600 13px Segoe UI, Arial";
    for (let i = -100; i <= 100; i += 5) {
      let E = Math.round(C + i), t = (E % 360 + 360) % 360, o = I.width / 2 + (E - C) * Q;
      if (t % 5 === 0) if (g.fillStyle = "rgba(255,255,255,0.8)", g.shadowColor = "rgba(0,0,0,.8)", g.shadowBlur = 3, t % 45 === 0) {
        let e = { 0: J("С", "N"), 45: J("СВ", "NE"), 90: J("В", "E"), 135: J("ЮВ", "SE"), 180: J("Ю", "S"), 225: J("ЮЗ", "SW"), 270: J("З", "W"), 315: J("СЗ", "NW") }[t];
        g.fillStyle = t === 0 ? "#f3c77a" : "#fff", g.fillText(e, o, 15);
      } else g.fillRect(o - 0.5, t % 15 === 0 ? 18 : 22, 1, t % 15 === 0 ? 8 : 4);
    }
    g.fillStyle = "#e8a74a", g.fillRect(I.width / 2 - 1, 24, 2, 8);
  }
  toast(A, I = false) {
    let g = this.hudEls.toasts;
    if (!g) return;
    let C = g.lastElementChild;
    if (C && C.dataset.m === A) {
      C.dataset.t = String(Date.now());
      return;
    }
    let Q = dh("div", "toast" + (I ? " bad" : ""), A);
    for (Q.dataset.m = A, g.appendChild(Q); g.children.length > 5; ) g.removeChild(g.firstChild);
    setTimeout(() => {
      Q.style.opacity = "0";
    }, 3800), setTimeout(() => Q.remove(), 4500);
  }
  hint(A, I = 8) {
    if (!this.settings.hints) return;
    let g = this.hudEls.hint;
    g.innerHTML = `<small>${J("Подсказка", "Hint")}</small>${A}`, g.classList.remove("hidden"), g.style.opacity = "1", this.hintTimer = I;
  }
  radioName(A) {
    let I = this.hudEls.radioname;
    I.textContent !== A && (I.textContent = A), I.style.opacity = "1", this.radioTimer = 2.5;
  }
};
function Ku(B) {
  return { Space: J("Пробел", "Space"), ShiftLeft: "Shift", ShiftRight: "Shift", ControlLeft: "Ctrl", Escape: "Esc", Tab: "Tab", BracketLeft: "[", BracketRight: "]", Comma: ",", Period: ".", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }[B] ?? B.replace("Key", "").replace("Digit", "");
}
function Gu() {
  return [["W A S D", J("Ходьба / езда", "Walk / drive")], ["Shift", J("Бег", "Sprint")], ["E", J("Взаимодействие, открыть, сесть / выйти", "Interact, open, enter / exit")], [J("ЛКМ", "LMB"), J("Взять / использовать (держать — снять деталь, залить)", "Take / use (hold to unbolt, pour)")], [J("ПКМ", "RMB"), J("Бросить предмет / прицел", "Throw item / aim")], ["Q", J("Положить предмет", "Drop item")], ["1–4", J("Карманы инвентаря", "Inventory pockets")], ["I", J("Зажигание (держать — стартер)", "Ignition (hold to crank)")], ["L / H / N", J("Фары / сигнал / радио", "Lights / horn / radio")], [J("Пробел", "Space"), J("Прыжок / ручной тормоз", "Jump / handbrake")], ["R / F", J("Передачи (механика), перезарядка / фонарик", "Gears (manual), reload / flashlight")], ["V", J("Вид из машины", "Car camera")], ["Tab", J("Журнал", "Journal")], ["Esc", J("Пауза", "Pause")]].map(([A, I]) => `<span class="key">${A}</span><span>${I}</span>`).join("");
}
var Fu = new URLSearchParams(location.search), aC = {};
Fu.forEach((B, A) => aC[A] = B);
var CE = new Rh();
CE.showLoading();
var as = wM(), uh = { kind: "menu" }, ns = 1979;
if (aC.play) uh = { kind: "new", difficulty: 1, auto: true }, ns = aC.seed ? Number(aC.seed) : 1337;
else if (as?.mode === "new") uh = { kind: "new", difficulty: as.difficulty ?? 1, auto: as.auto ?? true }, ns = as.seed ?? Math.floor(Math.random() * 99999);
else if (as?.mode === "load") {
  let B = Tl();
  B && (uh = { kind: "load", save: B }, ns = B.seed);
} else aC.seed && (ns = Number(aC.seed));
function UM(B) {
  let A = document.getElementById("ldl");
  A && (A.textContent = B, A.style.color = "#e0523e");
}
var fQ;
try {
  fQ = new kn({ antialias: false, powerPreference: "high-performance", stencil: false });
} catch (B) {
  throw UM(J("WebGL 2 недоступен: обновите браузер или драйвер видеокарты", "WebGL 2 is not available: update your browser or graphics driver")), B;
}
fQ.setPixelRatio(Math.min(devicePixelRatio, 1.5) * (aC.pr ? Number(aC.pr) : CE.settings.renderScale));
fQ.setSize(innerWidth, innerHeight);
fQ.toneMapping = ui;
fQ.toneMappingExposure = aC.exp ? Number(aC.exp) : 1;
fQ.shadowMap.enabled = true;
fQ.shadowMap.type = di;
document.body.appendChild(fQ.domElement);
var oB = new Nh(fQ, CE, { seed: ns, quality: aC.q ? Number(aC.q) : CE.settings.quality, test: aC });
CE.hooks = oB.uiHooks();
window.__game = oB;
(aC.auto || aC.nolock) && (oB.input.noLock = true);
(async () => {
  try {
    await oB.init((I, g) => CE.setLoading(I, g), uh);
  } catch (I) {
    console.error(I), UM(J("Ошибка загрузки: ", "Loading failed: ") + I.message);
    return;
  }
  aC.incar && oB.playerCar && oB.enterCar(oB.playerCar, "driver", true), addEventListener("resize", () => oB.resize(innerWidth, innerHeight)), oB.resize(innerWidth, innerHeight);
  let B = 0, A = (I) => {
    requestAnimationFrame(A);
    try {
      oB.frame(I);
    } catch (g) {
      B++ < 5 && console.error(g);
    }
    window.__frames = oB.frames;
  };
  requestAnimationFrame(A), CE.loadingDone(() => oB.start(), !!aC.auto), window.__ready = true;
})();
