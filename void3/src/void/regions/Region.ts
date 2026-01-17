import * as THREE from "three";

// 1. Define the custom event map
export interface RegionEventMap extends THREE.Object3DEventMap {
  enter: { type: "enter" };
  exit: { type: "exit" };
}

export interface CelestialBody {
  update(delta: number): void;
  destroy(): void;
  group?: THREE.Group | THREE.Object3D;
}

/**
 * A localized coordinate space.
 * Follows the "Tell, Don't Ask" principle for lifecycle management.
 */
export class Region extends THREE.Group<RegionEventMap> {
  public bodies: CelestialBody[] = [];
  public cfg: any;

  // Entry/Exit shells for LOD hysteresis
  public entryRadius: number;
  public exitRadius: number;

  // LOD State tracking
  public isHighDetail: boolean = false;
  private _isUpdating = false;

  constructor(cfg?: any) {
    super();
    this.cfg = cfg || {};

    // Explicitly define entry and exit shells
    this.entryRadius = cfg?.entryRadius || cfg?.radius || 1000;
    // Default exit shell to 10% larger if not specified
    this.exitRadius = cfg?.exitRadius || this.entryRadius * 1.1;

    this.name = cfg?.name || "Unnamed Region";
  }

  /**
   * Updates all child bodies.
   * Guarded against re-entrancy to prevent stack overflows.
   */
  public update(delta: number): void {
    if (this._isUpdating) return;
    this._isUpdating = true;

    try {
      for (const body of this.bodies) {
        // Safety: Ensure we don't call update on ourselves if accidentally added to bodies
        if (body !== (this as any) && typeof body.update === "function") {
          body.update(delta);
        }
      }
    } finally {
      this._isUpdating = false;
    }
  }

  /**
   * Assigns a camera to this region and propagates to child bodies. Default is a no-op
   * unless specific bodies handle the camera.
   */
  public setCamera(camera: THREE.Camera): void {
    // Store it if consumers need it later
    (this as any)._camera = camera;

    // Propagate to any child bodies that expose setCamera
    for (const body of this.bodies) {
      if (body && typeof (body as any).setCamera === "function") {
        (body as any).setCamera(camera);
      }
    }
  }

  /**
   * Comprehensive cleanup of GPU resources.
   */
  public destroy(): void {
    // 1. Destroy all celestial bodies logic
    this.bodies.forEach((b) => b.destroy?.());
    this.bodies = [];

    // 2. Recursively dispose of Three.js geometries and materials
    this.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });

    // 3. Remove from scene graph
    if (this.parent) {
      this.parent.remove(this);
    }
  }
}
