import * as THREE from "three";
import { CelestialBody } from "../regions";

export class Planet extends CelestialBody {
  public readonly isPlanet = true;

  private config: {
    color: number;
    size: number;
  };

  /**
   * @param parent The Star (or other body) this planet orbits.
   * @param name Name of the planet.
   */
  constructor(
    parent: CelestialBody,
    name: string = "Unnamed Planet",
    color: number = 0xffffff,
    size: number = 1,
    orbit: number = 10,
    velocity: number = 0.1,
  ) {
    super(name, parent);
    this.config = { color, size };
    this.orbit = orbit;
    this.velocity = velocity;

    this.group = new THREE.Group();
    this.group.name = `${this.name}-group`;
    this.add(this.group);

    const x = Math.cos(this.angle) * this.orbit;
    const z = Math.sin(this.angle) * this.orbit;
    this.position.set(x, 0, z);
  }

  public create(): void {
    if (this.mesh) return;
    const { color, size } = this.config;

    const geometry = new THREE.IcosahedronGeometry(1, 6);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 1,
      metalness: 0,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(size);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    if (this.group) this.group.add(this.mesh);
  }

  public setCamera(camera: THREE.Camera): void {
    this.children.forEach((c) => {
      if (c instanceof CelestialBody) c.setCamera(camera);
    });
  }

  protected onUpdate(delta: number): void {
    if (!this.mesh) this.create();

    if (this.mesh) {
      this.mesh.rotation.y += 0.5 * delta;
    }
  }

  protected onDestroy(): void {
    if (this.mesh instanceof THREE.Mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
