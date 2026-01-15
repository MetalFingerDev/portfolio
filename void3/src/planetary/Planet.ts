import * as THREE from "three";
import { type CelestialBody } from "../regions/Region";

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
