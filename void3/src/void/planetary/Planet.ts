import * as THREE from "three";
import { CelestialBody } from "../regions";

/**
 * Planet with Level of Detail (LOD)
 * Switches between Point geometry (low detail) and Icosahedron geometry (high detail)
 */
export class Planet extends CelestialBody {
  public readonly isPlanet = true;
  public group?: THREE.Group;
  public lod: THREE.LOD = new THREE.LOD();
  public bodies: import("../regions").CelestialBody[] = [];

  private config: {
    name: string;
    color: number;
    size: number;
    orbit: number;
    velocity: number;
  };

  constructor(
    name: string = "Unnamed",
    color: number = 0xffffff,
    size: number = 1,
    orbit: number = 10,
    velocity: number = 0.1,
  ) {
    super(name);
    this.config = {
      name,
      color,
      size,
      orbit: orbit + Math.random() * 20,
      velocity: velocity + Math.random() * 0.5,
    };

    this.orbit = this.config.orbit;
    this.velocity = this.config.velocity;

    this.group = new THREE.Group();
    this.group.name = `${this.name}-group`;
    this.add(this.group);

    // initial placement (use base `angle`)
    const x = Math.cos(this.angle) * this.orbit;
    const z = Math.sin(this.angle) * this.orbit;
    this.position.set(x, 0, z);
  }

  /**
   * Lazily creates the high-detail Icosahedron geometry
   */
  public create(): void {
    if (this.mesh) return;
    const { color, size } = this.config;
    const geometry = new THREE.IcosahedronGeometry(1, 6);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 1,
      metalness: 0,
      flatShading: false,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(size);
    this.mesh.name = `${this.name}-mesh`;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    if (this.group) this.group.add(this.mesh);
  }

  public setCamera(camera: THREE.Camera): void {
    // Propagate camera to any child bodies
    for (const child of this.children) {
      if ((child as any).setCamera) {
        (child as any).setCamera(camera);
      }
    }
  }

  public update(delta: number): void {
    if (this.group && this.group.visible && !this.mesh) {
      this.create();
    }

    // Self rotation
    if (this.mesh && this.mesh.visible) {
      this.mesh.rotation.y += 0.5 * delta;
    }

    // Delegate planet-specific update to the protected hook
    this.onUpdate?.(delta);

    // Ensure any explicit child .update calls still run
    for (const child of this.children) {
      if (typeof (child as any).update === "function") {
        (child as any).update(delta);
      }
    }
  }

  // --- Hook for localized per-body updates ---
  protected onUpdate(delta: number): void {
    // Logic for the planet's own orbit
    this.angle += this.velocity * delta;
    this.position.x = Math.cos(this.angle) * this.orbit;
    this.position.z = Math.sin(this.angle) * this.orbit;

    if (this.mesh && (this.mesh as THREE.Mesh).visible)
      this.mesh.rotation.y += delta * 0.5;

    // Propagate update to Satellites (Moons)
    for (const body of this.bodies) {
      if ((body as any).onUpdate) {
        (body as any).onUpdate(delta);
      }
    }
  }

  protected onDestroy(): void {
    // Dispose local resources
    if (this.point && this.point instanceof THREE.Points) {
      this.point.geometry.dispose();
      (this.point.material as THREE.Material).dispose();
    }
    if (this.mesh && this.mesh instanceof THREE.Mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
