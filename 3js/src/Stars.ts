import * as THREE from "three";
import { STAR_FIELD_RADIUS } from "./units";

export default class Stars {
  starPoints?: THREE.Points;
  starGroup: THREE.Group = new THREE.Group();
  interiorMesh?: THREE.Mesh;
  static RADIUS = STAR_FIELD_RADIUS;

  constructor(scene: THREE.Scene) {
    scene.add(this.starGroup);

    // Attempt to load a preprocessed bright-star JSON (public/bright-stars.json), fall back to the internal random shell
    const tryLoadCatalog = async (url: string) => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("not ok");
        const stars = await resp.json();
        return stars as Array<{
          ra: number;
          dec: number;
          mag: number;
          bv?: number;
        }>;
      } catch (e) {
        return null;
      }
    };

    const degToRad = (d: number) => (d * Math.PI) / 180;
    const raDecToXYZ = (raDeg: number, decDeg: number, r: number) => {
      const ra = degToRad(raDeg);
      const dec = degToRad(decDeg);
      const x = r * Math.cos(dec) * Math.cos(ra);
      const y = r * Math.sin(dec);
      const z = r * Math.cos(dec) * Math.sin(ra);
      return [x, y, z];
    };

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

    (async () => {
      const stars = await tryLoadCatalog("/bright-stars.json");
      if (!stars) {
        console.warn(
          "bright-stars.json not found — no star catalog loaded. Run scripts/generate_stars.js to create it."
        );
      } else {
        const n = stars.length;
        const positions = new Float32Array(n * 3);
        const colors = new Float32Array(n * 3);
        const sizes = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const s = stars[i];
          const r = STAR_FIELD_RADIUS * (0.98 + Math.random() * 0.04);
          const [x, y, z] = raDecToXYZ(s.ra, s.dec, r);
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
          const [cr, cg, cb] = bvToRgb(s.bv ?? 0.65);
          colors[i * 3] = cr;
          colors[i * 3 + 1] = cg;
          colors[i * 3 + 2] = cb;
          sizes[i] = magToSize(s.mag);
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
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
              if (d > 0.5) discard;
              gl_FragColor = vec4(vColor, 1.0);
            }
          `,
        });

        const points = new THREE.Points(geom, mat);
        points.frustumCulled = false;
        this.starGroup.add(points);
      }

      // Milky Way sphere if texture exists
      const loader = new THREE.TextureLoader();
      loader.load(
        "/milkyway.jpg",
        (tex) => {
          const mat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false,
          });
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(STAR_FIELD_RADIUS * 0.99, 64, 64),
            mat
          );
          sphere.frustumCulled = false;
          this.starGroup.add(sphere);
        },
        undefined,
        () => {
          // ignore if not found
        }
      );
    })();

    // optional debug interior shell (yellow, visible from inside)
  }
}
