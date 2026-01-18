import * as THREE from "three";
import { CelestialBody } from "../regions";

export class Moon extends CelestialBody {
  private config: {
    color: number;
    size: number;
  };

  constructor(
    parent: CelestialBody,
    name: string = "Moon",
    color: number = 0xaaaaaa,
    size: number = 0.5,
    orbit: number = 3,
    velocity: number = 0.5,
  ) {
    super(name, parent);

    this.config = { color, size };
    this.orbit = orbit;
    this.velocity = velocity;

    this.group = new THREE.Group();
    this.group.name = `${this.name}-group`;
    this.add(this.group);

    this.update(0);
  }

  public create(): void {
    if (this.mesh) return;

    const { color, size } = this.config;
    const geometry = new THREE.IcosahedronGeometry(1, 6);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(size);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    if (this.group) this.group.add(this.mesh);
  }

  public setCamera(): void {
  }

  protected onUpdate(delta: number): void {
    if (!this.mesh) this.create();

    if (this.mesh) {
      this.mesh.rotation.y += 1.0 * delta;
    }
  }
}
