import * as THREE from "three";
import { CelestialBody } from "../regions";

export class Star extends CelestialBody {
  public readonly isStar = true;
  public light?: THREE.PointLight;

  private config: {
    intensity: number;
    radius: number;
    color: number;
    emission: boolean;
  };

  /**
   * @param parent The Region or Galaxy this star belongs to.
   * @param name Name of the star.
   */
  constructor(
    parent: CelestialBody | THREE.Object3D | undefined,
    name: string = "Star",
    intensity: number = 10000,
    radius: number = 5,
    color: number = 0xffffff,
    emission: boolean = true,
  ) {
    super(name, parent);
    this.config = { intensity, radius, color, emission };

    this.orbit = 0;
    this.velocity = 0;

    this.group = new THREE.Group();
    this.add(this.group);
  }

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

    if (this.group) this.group.add(this.mesh);

    if (emission) {
      this.light = new THREE.PointLight(color, intensity, 0);
      this.light.castShadow = true;
      this.mesh.add(this.light);
    }
  }

  public setCamera(_camera: THREE.Camera): void {}

  protected onUpdate(delta: number): void {
    if (!this.mesh) this.create();

    if (this.mesh) {
      this.mesh.rotation.y += delta * 0.1;
    }
  }

  protected onDestroy(): void {
    if (this.mesh instanceof THREE.Mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    this.light?.dispose?.();
  }
}
