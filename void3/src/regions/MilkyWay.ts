import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
import { Star } from "../stellar/Star";

export class MilkyWay extends Region implements CelestialBody {
  public mesh: THREE.Mesh;

  constructor() {
    super();
    this.name = "MilkyWay";

    // HARDCODED DIMENSIONS
    // Independent of SolarSystem.
    // Thickness = 20,000, Radius = 400,000
    const thickness = 20000;
    const radius = 400000;

    // 1. Create Geometry (Cylinder)
    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

    // 2. Material (Glowing Galactic Disc)
    const material = new THREE.MeshBasicMaterial({
      color: 0x4b0082, // Indigo/Deep Purple
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);

    // Hard-coded scale (2x)
    this.scale.setScalar(2);

    // 3. Fill Volume with Stars
    this.populateStars(radius, thickness);

    // 4. Shift Position (hard-coded)
    // Shift so the Solar System (at 0,0,0) is located halfway out in the disc
    this.position.set(400000, 0, 0);

    this.bodies.push(this);
  }

  private populateStars(radius: number, thickness: number) {
    const starCount = 4000;
    const centerColor = new THREE.Color(0xffcc99); // Warm/Yellow center
    const edgeColor = new THREE.Color(0x99ccff); // Blue outer rim

    for (let i = 0; i < starCount; i++) {
      // --- Position Logic ---
      const rRatio = Math.random();
      const r = radius * rRatio;

      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * thickness;

      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      // --- Visual Logic ---
      const size = 0.5 + Math.random() * 2.5;
      const color = centerColor.clone().lerp(edgeColor, rRatio);

      // Create Star (no light to avoid shader uniform overload)
      const star = new Star(0, size, color.getHex(), false);
      star.position.set(x, y, z);

      this.add(star);
    }
  }

  setDetail(isHighDetail: boolean): void {
    this.children.forEach((c: any) => {
      try {
        if (c && typeof c.setDetail === "function") c.setDetail(isHighDetail);
      } catch (e) {
        /* defensive */
      }
    });
  }

  update(delta: number): void {
    // Very slow galactic rotation
    this.rotation.y += 0.0001 * delta;
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
    this.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            (mesh.material as THREE.Material[]).forEach((m) => m.dispose());
          } else {
            (mesh.material as THREE.Material).dispose();
          }
        }
      }
    });
  }
}
