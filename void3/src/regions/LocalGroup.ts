import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
// REMOVE: import { Galaxy } from "../galactic/Galaxy"; -> We will use a local class instead
// MilkyWay is managed externally (not included inside LocalGroup)

/**
 * Helper class for generic distant galaxies
 * Uses the same visual logic as Andromeda but configurable
 */
class DistantGalaxy extends Region implements CelestialBody {
  public mesh: THREE.Mesh;

  constructor(radius: number, thickness: number, color: number) {
    super();
    this.name = "DistantGalaxy";

    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);
    this.bodies.push(this);
  }

  destroy() {
    if (this.parent) this.parent.remove(this);
    (this.mesh.geometry as THREE.BufferGeometry).dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

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

    // NOTE: Andromeda no longer populates with stars (handled by MilkyWay density approach)

    this.bodies.push(this);
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

    // Position Andromeda far away (scaled values hard-coded)
    // We place it at (4,000,000, 300,000, -2,000,000) to create a nice parallax
    this.andromeda.position.set(40000000, 300000, -2000000);

    // Rotate it to look distinct
    this.andromeda.rotation.z = Math.PI / 8;
    this.andromeda.rotation.x = Math.PI / 6;

    this.add(this.andromeda);
    this.bodies.push(this.andromeda);

    // --- Populate with placeholder (empty) galaxies ---
    const placeholderCount = 6;
    const colorPalette = [0x9966cc, 0x8844ff, 0x7a33d1, 0x5f2aa8];
    for (let i = 0; i < placeholderCount; i++) {
      const radius = 80000 + Math.random() * 400000;
      const thickness = Math.max(8000, radius * 0.06);
      const color = colorPalette[i % colorPalette.length];

      // FIX: Use DistantGalaxy instead of the imported Galaxy class
      const g = new DistantGalaxy(radius, thickness, color);
      g.name = `Galaxy-${i}`;

      const minDist = 5_000_000;
      const maxDist = 80_000_000;
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();

      const distance = minDist + Math.random() * (maxDist - minDist);
      const pos = dir.multiplyScalar(distance);
      g.position.copy(pos);

      g.rotation.y = Math.random() * Math.PI * 2;
      g.rotation.x = Math.random() * Math.PI; // Random tilt

      const scale = 0.7 + Math.random() * 3.0;
      g.scale.setScalar(scale);

      this.add(g);
      this.bodies.push(g);
    }
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
