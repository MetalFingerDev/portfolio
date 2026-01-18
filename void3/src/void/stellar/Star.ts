import * as THREE from "three";
import { CelestialBody } from "../regions";

/**
 * Star object
 * Has PointLight at its core
 */
export class Star extends CelestialBody {
  public readonly isStar = true;
  public readonly isPlanet = false;
  public light?: THREE.PointLight;

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
    emission: boolean = true,
    name?: string,
  ) {
    super(name || "Star");

    this.config = { intensity, radius, color, emission };

    this.group = new THREE.Group();
    this.group.name = `${this.name}-high-placeholder`;
    this.add(this.group);
  }

  /**
   * Lazily creates the Icosahedron mesh and light and registers them with LOD.
   */
  public create(): void {
    if (this.mesh) return;
    const { color, radius, intensity, emission } = this.config;
    const geometry = new THREE.IcosahedronGeometry(1, 6);
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
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    if (this.group) this.group.add(this.mesh);
    if (emission) {
      this.light = new THREE.PointLight(color, intensity, 0);
      this.light.castShadow = true;
      this.light.shadow.mapSize.set(1024, 1024);
      this.light.shadow.bias = -0.001;
      this.mesh.add(this.light);
    }
  }

  public setCamera(_camera: THREE.Camera): void {
    // Stars usually don't need camera-specific logic unless doing lens flares
  }

  public update(delta: number): void {
    if (this.group && this.group.visible && !this.mesh) {
      this.create();
    }

    // Per-star updates
    this.onUpdate?.(delta);

    // Update any child bodies
    for (const child of this.children) {
      if (typeof (child as any).update === "function") {
        (child as any).update(delta);
      }
    }
  }

  protected onDestroy(): void {
    if (this.mesh && this.mesh instanceof THREE.Mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    if (this.light) {
      try {
        // PointLight does not have a standard dispose method, but call if present
        (this.light as any).dispose?.();
      } catch (e) {}
    }
  }

  protected onUpdate(delta: number): void {
    // Stars are usually static in system-space, but could rotate
    if (this.mesh && (this.mesh as THREE.Mesh).visible)
      this.mesh.rotation.y += delta * 0.1;
  }
}
