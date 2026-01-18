import * as THREE from 'three';
import { Galaxy } from './Galaxy';

export class MilkyWay extends Galaxy {
  constructor(
    name: string = 'Milky Way',
    radius: number = 3162050000,
    height: number = 64241000,
    orbitRadius: number = 0,
    orbitSpeed: number = 0
  ) {
    // Pass 0 for starCount to disable default generation
    super(name, radius, height, orbitRadius, orbitSpeed, 0);

    if (import.meta.env.DEV) {
      console.log('MilkyWay initialized:', {
        radius: this.radius,
        height: this.height,
        orbit: this.orbit,
        velocity: this.velocity,
        starCount: this.starCount,
      });
    }
  }

  /**
   * SMART OVERRIDE:
   * Instead of creating a massive geometry (which can be glitchy),
   * we create a tiny geometry and scale the mesh matrix.
   */
  protected createGalaxyMesh(): void {
    // 1. Remove the mesh created by the super() class if it exists
    const oldMesh = this.getObjectByName('GalaxyBounds');
    if (oldMesh) this.remove(oldMesh);

    // 2. Create Unit Geometry (Radius = 1, Height = 1)
    // This keeps vertex data normalized and precise.
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 64);

    const material = new THREE.MeshBasicMaterial({
      color: 0x4400ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1, // Increased slightly for visibility
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'GalaxyBounds';

    // 3. Apply the Massive Scale here
    // cylinder height defaults to Y axis, so we scale (R, H, R)
    mesh.scale.set(this.radius, this.height, this.radius);

    // Rotate to lay flat
    mesh.rotation.x = Math.PI / 2;

    this.add(mesh);

    if (import.meta.env.DEV) {
      console.log(`Milky Way Generated. Scale: ${this.radius} AU`);
    }
  }

  protected spreadStars(): void {
    // Empty to prevent default star generation
  }
}
