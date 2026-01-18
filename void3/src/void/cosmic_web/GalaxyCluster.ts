import * as THREE from 'three';
import { Region } from '@/void/regions';
import { Galaxy } from '@/void/galactic';
import { regionManager } from '@/void/regions';

export class GalaxyCluster extends Region {
  private galaxyCount: number;
  private spreadRadius: number;
  private spreadHeight: number;

  constructor(
    name: string = 'Unknown Cluster',
    radius: number = 200000,
    count: number = 40
  ) {
    super({
      name: name,
      radius: radius,
      entry: radius,
      exit: radius * 1.2,
      debugShells: false,
    });

    this.galaxyCount = count;

    // Gaussian distribution parameters (Standard Deviation)
    // 1-Sigma (68%) of galaxies will be within this range
    this.spreadRadius = radius * 0.4;
    this.spreadHeight = radius * 0.2;

    this.setup();
  }

  private setup(): void {
    console.log(`[GalaxyCluster] Generating ${this.name} with ${this.galaxyCount} galaxies...`);

    for (let i = 0; i < this.galaxyCount; i++) {
      // 1. Calculate Gaussian Coordinates
      // Angle is uniform (0 to 2PI)
      const angle = Math.random() * Math.PI * 2;

      // Radius 'r' uses absolute Gaussian to cluster near center but allow outliers
      // We use Math.abs because radius must be positive
      const r = Math.abs(this.gaussianRandom(0, this.spreadRadius));

      // Height 'h' (or z) is Gaussian centered at 0
      const h = this.gaussianRandom(0, this.spreadHeight);

      // 2. Map to Coordinate System
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle); // In your requested mapping, Y is the other planar axis
      const z = h; // Z is height/elevation

      // 3. Create Galaxy Instance
      // Varying sizes based on how close to center they are (massive galaxies in center)
      const distRatio = 1 - Math.min(r / this.radius, 1);
      const galaxySize = 500 + distRatio * 1500 + Math.random() * 500;

      const galaxy = new Galaxy(
        `G-${i}`,
        galaxySize,
        0, // Orbit radius (handled manually by group position)
        0 // Velocity
      );

      // Set Position
      galaxy.position.set(x, y, z);

      // Random Rotation (Galaxies aren't all aligned)
      galaxy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // 4. Add to Hierarchy & Manager
      this.add(galaxy);
      regionManager.register(galaxy);
    }

    this.createIntraclusterMedium();
  }

  /**
   * Helper: Box-Muller transform to get numbers following a Normal Distribution.
   * Returns a random number centered around `mean` with specific `stdDev`.
   */
  private gaussianRandom(mean: number, stdDev: number): number {
    const u1 = 1 - Math.random(); // Converting [0,1) to (0,1]
    const u2 = Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
  }

  /**
   * Adds a faint glow to represent the hot gas (ICM) found in galaxy clusters.
   */
  private createIntraclusterMedium(): void {
    const geometry = new THREE.SphereGeometry(this.radius * 0.6, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xaa4422, // Faint X-ray gas glow
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.03,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'Intracluster Medium';
    this.add(mesh);
  }

  /**
   * Clean up child regions from the manager when this cluster is destroyed
   */
  protected onDestroy(): void {
    this.children.forEach((child) => {
      if ((child as any).isRegion) {
        // Duck typing check for Region
        regionManager.unregister(child as Region);
      }
    });
    super.onDestroy();
  }

  protected onUpdate(delta: number): void {
    // Clusters evolve very slowly, just a tiny drift
    this.rotation.y += 0.0005 * delta;
  }
}
