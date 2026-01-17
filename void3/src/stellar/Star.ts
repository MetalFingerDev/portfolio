import * as THREE from "three";
import { type CelestialBody } from "../regions/Region";

export class Star extends THREE.Group implements CelestialBody {
  public readonly isStar = true; // Identifier for automatic relationships

  private light?: THREE.PointLight;
  private mesh?: THREE.Mesh;
  private point: THREE.Points;

  private config: {
    intensity: number;
    radius: number;
    color: number;
    emission: boolean;
  };

  constructor(
    intensity: number = 10000,
    radius: number = 5,
    color: number = 0xffffff,
    emission: boolean = true
  ) {
    super();
    this.name = "Star";

    this.config = { intensity, radius, color, emission };

    // 1. Low Detail: Point Geometry (uses star color)
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );
    const pointMat = new THREE.PointsMaterial({
      color: color,
      size: 1.5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    this.point = new THREE.Points(pointGeom, pointMat);
    this.point.name = "star-point";
    this.add(this.point);

    this.setDetail(true);
  }

  /**
   * Toggles between Point geometry (low detail)
   * and Icosahedron geometry (high detail).
   */
  public setDetail(isHighDetail: boolean): void {
    if (isHighDetail) {
      // Show High Detail
      this.point.visible = false;
      this.ensureHighDetailAssets();
      if (this.mesh) this.mesh.visible = true;
      if (this.light) this.light.visible = true;
    } else {
      // Show Low Detail (Points)
      this.point.visible = true;
      if (this.mesh) this.mesh.visible = false;
      if (this.light) this.light.visible = false;
    }
  }

  /**
   * Lazily creates the high-detail Icosahedron mesh and light.
   */
  private ensureHighDetailAssets(): void {
    if (this.mesh) return;

    const { color, radius, intensity, emission } = this.config;

    // 2. High Detail: Icosahedron Geometry
    const geometry = new THREE.IcosahedronGeometry(1, 6);

    // Use MeshStandardMaterial so planets react to this star's light
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
      roughness: 0.5,
      metalness: 0.0,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(radius);
    this.mesh.name = "star-mesh";

    // the star mesh itself should not cast shadow on planets (it emits light)
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    this.add(this.mesh);

    if (emission) {
      // Point light with large intensity and infinite range (distance = 0)
      this.light = new THREE.PointLight(color, intensity, 0);
      this.light.castShadow = true;
      // Reasonable shadow settings for quality
      this.light.shadow.mapSize.set(1024, 1024);
      this.light.shadow.bias = -0.001;
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
    if (this.light) {
      try {
        this.light.dispose();
      } catch (e) {}
    }
  }
}
