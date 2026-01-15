import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
// MilkyWay is managed externally (not included inside LocalGroup)
import { Star } from "../stellar/Star";

/**
 * 1. The Andromeda Galaxy Class
 * (Standalone, hardcoded values as requested)
 */
class Andromeda extends Region implements CelestialBody {
  public mesh: THREE.Mesh;

  constructor() {
    super();
    this.name = "Andromeda";

    // --- HARDCODED DIMENSIONS ---
    // Slightly smaller than Milky Way (Radius 400k -> 320k)
    const thickness = 18000;
    const radius = 320000;

    // 1. Create Geometry (Cylinder)
    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

    // 2. Material (Brighter, lighter Galactic Disc)
    const material = new THREE.MeshBasicMaterial({
      color: 0x9966cc, // Amethyst/Lighter Purple
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);

    // 3. Fill Volume with Stars
    this.populateStars(radius, thickness);

    this.bodies.push(this);
  }

  private populateStars(radius: number, thickness: number) {
    const starCount = 3500; // Slightly fewer stars than MW
    const centerColor = new THREE.Color(0xfff0e0); // Bright White/Peach center
    const edgeColor = new THREE.Color(0xaaccff); // Pale Blue outer rim

    for (let i = 0; i < starCount; i++) {
      const rRatio = Math.random();
      const r = radius * rRatio;

      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * thickness;

      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      const size = 0.5 + Math.random() * 2.5;
      const color = centerColor.clone().lerp(edgeColor, rRatio);

      // Create Star
      const star = new Star(0, size, color.getHex(), false);
      star.position.set(x, y, z);

      this.add(star);
    }
  }

  setDetail(isHighDetail: boolean): void {
    // Propagate detail settings to children if they support it
    this.children.forEach((c: any) => {
      try {
        if (c && typeof c.setDetail === "function") c.setDetail(isHighDetail);
      } catch (e) {
        /* defensive */
      }
    });
  }

  update(delta: number): void {
    this.rotation.y += 0.00015 * delta; // Rotate slowly
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
  }
}

/**
 * 2. The Local Group Container
 * Manages the Milky Way and Andromeda
 */
export class LocalGroup extends Region implements CelestialBody {
  public andromeda: Andromeda;

  constructor() {
    super();
    this.name = "LocalGroup";

    // MilkyWay is no longer added here; add it to the scene separately if desired.

    // --- ADD ANDROMEDA ---
    this.andromeda = new Andromeda();

    // Hard-coded scale for Andromeda (2x)
    this.andromeda.scale.setScalar(2);

    // Position Andromeda far away (scaled values hard-coded)
    // We place it at (4,000,000, 300,000, -2,000,000) to create a nice parallax
    this.andromeda.position.set(4000000, 300000, -2000000);

    // Rotate it to look distinct
    this.andromeda.rotation.z = Math.PI / 8;
    this.andromeda.rotation.x = Math.PI / 6;

    this.add(this.andromeda);
    this.bodies.push(this.andromeda);
  }

  setDetail(isHighDetail: boolean): void {
    // Pass detail level down to galaxies
    super.setDetail(isHighDetail);
  }

  update(delta: number): void {
    // Update all child galaxies
    super.update(delta);
  }

  destroy(): void {
    super.destroy();
  }
}
