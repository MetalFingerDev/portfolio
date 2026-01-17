import * as THREE from "three";
import { type CelestialBody } from "../regions/Region";

export class Star extends THREE.Group implements CelestialBody {
  public readonly isStar = true; // Identifier for automatic relationships

  private light?: THREE.PointLight;
  private mesh?: THREE.Mesh;
  private point: THREE.Points;
  private lod: THREE.LOD;

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

    // THREE.LOD instance to manage geometry detail levels
    this.lod = new THREE.LOD();
    this.add(this.lod);

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

    // Add low-detail level to LOD (visible when far enough away)
    const lowDetailDistance = Math.max(100, radius * 20);
    this.lod.addLevel(this.point, lowDetailDistance);

    // Keep compatibility: ensure high detail assets if someone requests it
    this.setDetail(true);
  }

  /**
   * Compatibility shim: requesting high detail will ensure the high-detail assets
   * exist; visibility is handled by THREE.LOD, not manually toggled here.
   */
  public setDetail(isHighDetail: boolean): void {
    if (isHighDetail) {
      this.ensureHighDetailAssets();
    }
    // No manual visibility toggles; LOD decides which level to show.
  }

  /**
   * Lazily creates the high-detail Icosahedron mesh and light and registers them with LOD.
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

    // Attach light as a child of the mesh so it follows the high-detail level
    if (emission) {
      this.light = new THREE.PointLight(color, intensity, 0);
      this.light.castShadow = true;
      this.light.shadow.mapSize.set(1024, 1024);
      this.light.shadow.bias = -0.001;
      this.mesh.add(this.light);
    }

    // Register the mesh as the high-detail level at distance 0 (closest)
    this.lod.addLevel(this.mesh, 0);
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
