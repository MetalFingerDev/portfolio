import * as THREE from 'three';
import { Region } from '@/void/regions';
import { Star } from '@/void/stellar';

export class Galaxy extends Region {
  public height: number;
  public starCount: number;

  constructor(
    name: string = 'Unnamed Galaxy',
    radius: number = 3162050000,
    height: number = 64241000,
    orbitRadius: number = 0,
    orbitSpeed: number = 0,
    starCount?: number,
  ) {
    super({
      name: name,
      radius: radius,
      entry: radius,
      exit: radius * 1.2,
      debugShells: false,
    });
    this.orbit = orbitRadius;
    this.velocity = orbitSpeed;
    this.angle = Math.random() * Math.PI * 2;
    this.height = height ?? radius * 0.2;
    this.starCount = starCount ?? Math.floor(radius / 10);

    this.createGalaxyMesh();

    // Check if we should auto-populate (subclasses might want to do this themselves)
    // For backward compatibility, we run it, but now subclasses can clear it
    // or we could check `new.target` to see if we are a subclass.
    // Ideally, subclasses like MilkyWay should override spreadStars().
    this.spreadStars();
  }

  /**
   * Protected so subclasses can override the visual boundary style
   */
  protected createGalaxyMesh(): void {
    const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32);

    const material = new THREE.MeshBasicMaterial({
      color: 0x4400ff,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.name = 'GalaxyBounds';
    this.add(mesh);
  }

  /**
   * Protected so subclasses can override the star distribution logic
   * (e.g. Spiral Arms vs Elliptical)
   */
  protected spreadStars(): void {
    for (let i = 0; i < this.starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * this.radius;

      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      const z = (Math.random() - 0.5) * this.height;

      const starSize = Math.random() * 2 + 0.5;
      const starColor = new THREE.Color().setHSL(Math.random(), 0.8, 0.5).getHex();

      const star = new Star(this, `Star-${i}`, 5000 * Math.random(), starSize, starColor, true);

      star.position.set(x, y, z);
    }
  }

  protected onUpdate(delta: number): void {
    this.rotation.z += 0.05 * delta;
  }
}
