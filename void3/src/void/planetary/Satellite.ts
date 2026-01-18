import * as THREE from "three";
import { CelestialBody } from "../regions"; // Adjust path as necessary

/**
 * Satellite represents a body orbiting a planet or another celestial object.
 * It utilizes the orbital parameters provided by the CelestialBody base class.
 */
export class Satellite extends CelestialBody {
  // Required by CelestialBody interface
  public readonly isStar = false;
  public readonly isPlanet = false;

  private _geometry?: THREE.BufferGeometry;
  private _material?: THREE.Material;
  private size: number = 0.5;
  private color: number = 0xaaaaaa;

  constructor(
    name: string,
    orbitDistance: number,
    orbitalVelocity: number,
    size?: number,
    color?: number,
  ) {
    super(name);

    // Apply optional overrides
    if (size !== undefined) this.size = size;
    if (color !== undefined) this.color = color;

    // Initialize orbital parameters from base class
    this.orbit = orbitDistance;
    this.velocity = orbitalVelocity;

    // Trigger the creation of the satellite's visuals
    this.create();
  }

  /**
   * Implementation of CelestialBody.create()
   * Sets up the mesh and visual components of the satellite.
   */
  public create(): void {
    this._geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    this._material = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.mesh = new THREE.Mesh(this._geometry, this._material);

    // Allow the mesh to cast/receive shadows if your engine supports it
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.add(this.mesh);
  }

  /**
   * Implementation of CelestialBody.setCamera()
   * Can be used for billboarding labels or LOD adjustments.
   */
  public setCamera(_camera: THREE.Camera): void {
    // Example: If the satellite had a label, you would make it face the camera here
    // this.label.quaternion.copy(_camera.quaternion);
  }

  /**
   * Implementation of CelestialBody.onUpdate()
   * Handles the orbital progression logic.
   */
  protected onUpdate(delta: number): void {
    // 1. Update the angle based on velocity and time delta
    this.angle += this.velocity * delta;

    // 2. Calculate new position based on orbit radius
    // We update the position of the Group (this), which moves all child meshes
    this.position.x = Math.cos(this.angle) * this.orbit;
    this.position.z = Math.sin(this.angle) * this.orbit;

    // 3. Optional: Add some self-rotation for visual flair
    if (this.mesh) {
      this.mesh.rotation.y += delta * 0.5;
    }
  }

  /**
   * Implementation of CelestialBody.onDestroy()
   * Ensures GPU memory is freed when the satellite is removed.
   */
  protected onDestroy(): void {
    if (this._geometry) this._geometry.dispose();
    if (this._material) {
      if (Array.isArray(this._material)) {
        this._material.forEach((m) => m.dispose());
      } else {
        this._material.dispose();
      }
    }

    console.log(`Satellite ${this.name} resources disposed.`);
  }
}
