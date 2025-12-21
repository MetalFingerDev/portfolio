import * as THREE from "three";
import { STAR_FIELD_RADIUS, metersToScene } from "./units";
import starsData from "./bright-stars.json";

export default class Stars {
  starPoints?: THREE.Points;
  starGroup: THREE.Group = new THREE.Group();
  interiorMesh?: THREE.Mesh;
  static RADIUS = STAR_FIELD_RADIUS;

  constructor(scene: THREE.Scene) {
    scene.add(this.starGroup);

    // Use the imported bright-star JSON data
    const stars = starsData as Array<{
      ra: number;
      dec: number;
      mag: number;
      bv?: number;
    }>;

    if (!stars || stars.length === 0) {
      console.warn("No star data available.");
      return;
    }

    const degToRad = (d: number) => (d * Math.PI) / 180;

    function magToSize(mag: number) {
      // tuned for this scene; tweak as needed
      return Math.max(0.6, 10 - mag) * 0.5;
    }

    function bvToRgb(bv = 0.65) {
      bv = Math.max(-0.4, Math.min(2.0, bv));
      const t = (bv + 0.4) / 2.4;
      const r = Math.min(1, Math.max(0, 1.0 - 0.5 * t));
      const g = Math.min(1, Math.max(0, 1.0 - 0.2 * t));
      const b = Math.min(1, Math.max(0, 0.6 + 0.4 * (1 - t)));
      return [r, g, b];
    }

    const n = stars.length;
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const sizes = new Float32Array(n);

    // Physical conversion helpers
    const PARSEC_METERS = 3.085677581e16;
    const parsecToScene = (pc: number) => metersToScene(pc * PARSEC_METERS);

    // Map apparent magnitude to a plausible distance (in scene units)
    // Using distance modulus assuming an absolute magnitude M = 0 as a simple proxy:
    //   d(pc) = 10^{(m + 5) / 5}
    // Convert to scene units exactly: 1 parsec = PARSEC_METERS meters
    // and 1 scene unit = Earth radius (6371000 m).
    // So 1 pc ≈ 3.085677581e16 / 6.371e6 ≈ 4.848e9 scene units.
    const MIN_PARSEC = 1; // don't place stars closer than this (parsecs)
    // ~4.848e9 scene units per parsec (parsec → meters → scene units)

    function magToDistanceScene(mag: number) {
      const rawDParsec = Math.pow(10, (mag + 5) / 5);
      // add scatter so stars aren't all pinned to exact shells
      const scatter = 0.7 + Math.random() * 1.6; // ~[0.7, 2.3]
      const dParsec = Math.max(MIN_PARSEC, rawDParsec * scatter);
      return parsecToScene(dParsec);
    }

    // Angular separation enforcement (avoid visual overlaps)
    const minAngularSeparationDeg = 0.02; // min angular separation between placed stars (degrees)
    const maxPerturbDeg = 0.1; // how much to jitter ra/dec when resolving conflicts
    const maxAttempts = 12;
    const minAngularSeparationRad = (minAngularSeparationDeg * Math.PI) / 180;
    const cosMinSep = Math.cos(minAngularSeparationRad);

    function raDecToUnit(raDeg: number, decDeg: number) {
      const ra = degToRad(raDeg);
      const dec = degToRad(decDeg);
      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.sin(dec);
      const z = Math.cos(dec) * Math.sin(ra);
      const len = Math.hypot(x, y, z) || 1;
      return [x / len, y / len, z / len] as [number, number, number];
    }

    const placedDirs: Array<[number, number, number]> = [];

    for (let i = 0; i < n; i++) {
      const s = stars[i];

      // start with catalog RA/DEC but allow small perturbations to avoid overlaps
      let ra = s.ra;
      let dec = s.dec;
      let unit = raDecToUnit(ra, dec);

      let attempt = 0;
      let ok = false;
      while (attempt < maxAttempts && !ok) {
        ok = true;
        for (let j = 0; j < placedDirs.length; j++) {
          const d = placedDirs[j];
          const dot = unit[0] * d[0] + unit[1] * d[1] + unit[2] * d[2];
          if (dot > cosMinSep) {
            ok = false;
            break;
          }
        }
        if (!ok) {
          // jitter the coordinates slightly and retry
          ra += (Math.random() * 2 - 1) * maxPerturbDeg;
          dec += (Math.random() * 2 - 1) * maxPerturbDeg;
          unit = raDecToUnit(ra, dec);
          attempt++;
        }
      }

      // If we couldn't find a non-conflicting direction, keep the best we have and proceed
      const r = magToDistanceScene(s.mag);
      const x = unit[0] * r;
      const y = unit[1] * r;
      const z = unit[2] * r;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // record placed direction
      placedDirs.push(unit);

      const [cr, cg, cb] = bvToRgb(s.bv ?? 0.65);
      colors[i * 3] = cr;
      colors[i * 3 + 1] = cg;
      colors[i * 3 + 2] = cb;

      // size should fall off with distance so bright but far stars don't dominate
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
      depthWrite: false, // don't write to depth buffer so stars don't occlude nearer objects
      depthTest: true, // enable depth testing so stars are occluded by closer scene objects
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: { scale: { value: window.devicePixelRatio } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float scale;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * scale * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          // soft circular falloff for smoother edges and better blending
          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          if (alpha < 0.01) discard;
          // modulate color by alpha to avoid bright halos
          gl_FragColor = vec4(vColor * alpha, alpha);
        }
      `,
    });

    const points = new THREE.Points(geom, mat);
    points.frustumCulled = false;
    this.starGroup.add(points);
  }
}
