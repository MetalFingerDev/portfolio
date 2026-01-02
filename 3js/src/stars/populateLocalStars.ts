import * as THREE from "three";
import { STAR_FIELD_RADIUS, metersToScene } from "../units";
import type { StarEntry } from "./types";
import Stars from "../Stars";

const PARSEC_METERS = 3.085677581e16;
const parsecToScene = (pc: number) => metersToScene(pc * PARSEC_METERS);

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}
function bvToRgb(bv = 0.65) {
  bv = Math.max(-0.4, Math.min(2.0, bv));
  const t = (bv + 0.4) / 2.4;
  const r = Math.min(1, Math.max(0, 1.0 - 0.5 * t));
  const g = Math.min(1, Math.max(0, 1.0 - 0.2 * t));
  const b = Math.min(1, Math.max(0, 0.6 + 0.4 * (1 - t)));
  return [r, g, b];
}

export function populateLocalStars(instance: Stars, stars: StarEntry[]) {
  const n = stars.length;
  if (n === 0) return instance;

  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const sizes = new Float32Array(n);

  const MIN_PARSEC = 1;
  const magToSize = (mag: number) => Math.max(0.6, 10 - mag) * 0.5;
  const magToDistanceScene = (mag: number) => {
    const raw = Math.pow(10, (mag + 5) / 5);
    const scatter = 0.7 + Math.random() * 1.6;
    return parsecToScene(Math.max(MIN_PARSEC, raw * scatter));
  };

  const minAngularSeparationDeg = 0.02;
  const maxPerturbDeg = 0.1;
  const maxAttempts = 12;
  const cosMinSep = Math.cos((minAngularSeparationDeg * Math.PI) / 180);

  const raDecToUnit = (raDeg: number, decDeg: number) => {
    const ra = degToRad(raDeg),
      dec = degToRad(decDeg);
    const x = Math.cos(dec) * Math.cos(ra);
    const y = Math.sin(dec);
    const z = Math.cos(dec) * Math.sin(ra);
    const len = Math.hypot(x, y, z) || 1;
    return [x / len, y / len, z / len] as [number, number, number];
  };

  const placedDirs: Array<[number, number, number]> = [];

  for (let i = 0; i < n; i++) {
    const s = stars[i];
    let ra = s.ra,
      dec = s.dec;
    let unit = raDecToUnit(ra, dec);

    let attempt = 0;
    let ok = false;
    while (attempt < maxAttempts && !ok) {
      ok = true;
      for (let j = 0; j < placedDirs.length; j++) {
        const d = placedDirs[j];
        if (unit[0] * d[0] + unit[1] * d[1] + unit[2] * d[2] > cosMinSep) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        ra += (Math.random() * 2 - 1) * maxPerturbDeg;
        dec += (Math.random() * 2 - 1) * maxPerturbDeg;
        unit = raDecToUnit(ra, dec);
        attempt++;
      }
    }

    const r = magToDistanceScene(s.mag);
    positions[i * 3] = unit[0] * r;
    positions[i * 3 + 1] = unit[1] * r;
    positions[i * 3 + 2] = unit[2] * r;
    placedDirs.push(unit);

    const [cr, cg, cb] = bvToRgb(s.bv ?? 0.65);
    colors[i * 3] = cr;
    colors[i * 3 + 1] = cg;
    colors[i * 3 + 2] = cb;

    const baseSize = magToSize(s.mag);
    const distanceScale = Math.min(
      1,
      STAR_FIELD_RADIUS / Math.max(r, STAR_FIELD_RADIUS)
    );
    sizes[i] = Math.max(0.25, baseSize * distanceScale);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { scale: { value: window.devicePixelRatio } },
    vertexShader: `attribute float size; varying vec3 vColor; uniform float scale; void main(){ vColor = color; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_PointSize = size*scale*(300.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition; }`,
    fragmentShader: `varying vec3 vColor; void main(){ float d = length(gl_PointCoord - vec2(0.5)); float alpha = 1.0 - smoothstep(0.0, 0.5, d); if (alpha < 0.01) discard; gl_FragColor = vec4(vColor * alpha, alpha); }`,
  });

  const points = new THREE.Points(geom, mat);
  points.frustumCulled = false;
  instance.starGroup.add(points);
  return instance;
}
