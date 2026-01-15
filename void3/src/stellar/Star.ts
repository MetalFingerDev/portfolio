import * as THREE from "three";
import { type CelestialBody } from "../regions/Region";

export class Star extends THREE.Group implements CelestialBody {
  private light?: THREE.PointLight;
  private mesh?: THREE.Mesh;
  private point: THREE.Points;

  private starConfig: {
    intensity: number;
    radius: number;
    color: number;
    hasLight: boolean;
  };

  constructor(
    intensity: number = 1,
    radius: number = 1,
    color: number = 0xffffff,
    hasLight: boolean = true
  ) {
    super();
    this.name = "Star";

    this.starConfig = {
      intensity,
      radius,
      color,
      hasLight,
    };

    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );
    const pointMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      sizeAttenuation: false,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    this.point = new THREE.Points(pointGeom, pointMat);

    this.point.name = "star-point";
    this.add(this.point);
    this.setDetail(false);
  }

  public setDetail(_isHighDetail: boolean): void {
    this.point.visible = false;
    this.ensureHighDetailAssets();
    if (this.mesh) this.mesh.visible = true;
    if (this.light) this.light.visible = true;
  }

  private ensureHighDetailAssets(): void {
    if (this.mesh) return;

    const { color, radius, intensity, hasLight } = this.starConfig;
    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: color });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(radius);
    this.add(this.mesh);

    if (hasLight) {
      this.light = new THREE.PointLight(color, intensity, 0);
      this.add(this.light);
    }
  }

  update(_delta: number): void {}

  destroy(): void {
    if (this.parent) this.parent.remove(this);
    if (this.point.geometry) this.point.geometry.dispose();
    if (this.point.material) (this.point.material as THREE.Material).dispose();
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    if (this.light) this.light.dispose();
  }
}
