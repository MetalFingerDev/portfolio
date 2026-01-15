import * as THREE from "three";
import { type CelestialBody } from "./Region";

/**
 * Simple Star with a visible Mesh and a Light
 */
export class Star extends THREE.Group implements CelestialBody {
  public light: THREE.PointLight;
  public mesh: THREE.Mesh;

  constructor(
    intensity: number = 1,
    radius: number = 1,
    color: number = 0xffffff
  ) {
    super();
    this.name = "Star";

    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);

    this.light = new THREE.PointLight(color, intensity, 0);
    this.add(this.light);

    this.scale.setScalar(radius);
  }

  setDetail(_isHighDetail: boolean): void {}
  update(_delta: number): void {}
  destroy(): void {
    if (this.parent) this.parent.remove(this);
  }
}

/**
 * Planet with a visible Mesh
 */
export class Planet extends THREE.Group implements CelestialBody {
  public mesh: THREE.Mesh;

  constructor(name: string, color: number, size: number) {
    super();
    this.name = name || "Planet";

    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshStandardMaterial({ color: color });
    this.mesh = new THREE.Mesh(geometry, material);

    this.add(this.mesh);
    this.scale.setScalar(size);
  }

  setDetail(_isHighDetail: boolean): void {}

  update(delta: number): void {
    this.rotation.y += 0.5 * delta;
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
  }
}
