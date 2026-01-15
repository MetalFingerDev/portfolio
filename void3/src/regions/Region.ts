import * as THREE from "three";

export const REGION_SCALE = 2;

export interface CelestialBody {
  setDetail(isHighDetail: boolean): void;
  update(delta: number): void;
  destroy(): void;
  group?: THREE.Group | THREE.Object3D;
}

export class Region extends THREE.Group {
  public bodies: CelestialBody[] = [];
  public camera?: THREE.PerspectiveCamera;
  public cfg: any;

  // New property to define the active "High Detail" zone
  public radius: number = 0;

  constructor(cfg?: any) {
    super();
    this.cfg = cfg || {};
    // Default radius can be overwritten by child classes (e.g. SolarSystem)
    this.radius = cfg?.radius || 1000;
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
    this.userData.camera = camera;
  }

  public setDetail(isHighDetail: boolean): void {
    // Avoid redundant updates if state hasn't changed
    if (this.userData.detailIsHigh === isHighDetail) return;

    this.userData.detailIsHigh = !!isHighDetail;
    this.bodies.forEach((b) => {
      if (b && typeof b.setDetail === "function") {
        b.setDetail(isHighDetail);
      }
    });
  }

  public update(delta: number): void {
    // 1. Perform the Proximity Check
    if (this.camera) {
      this.checkRegionEntry();
    }

    // 2. Standard Update Propogation
    this.bodies.forEach((b) => {
      if (b && typeof b.update === "function") b.update(delta);
    });
  }

  /**
   * Checks if the camera is inside the Region's radius.
   * Propagates effect to all children via setDetail().
   */
  private checkRegionEntry(): void {
    if (!this.camera) return;

    // Get world positions to ensure accuracy regardless of scene graph nesting
    const myPos = new THREE.Vector3();
    this.getWorldPosition(myPos);

    const camPos = this.camera.position; // Assuming camera is in world space
    const dist = myPos.distanceTo(camPos);

    // Add a small buffer (hysteresis) to prevent flickering at the boundary
    const threshold = this.radius * (this.userData.detailIsHigh ? 1.1 : 1.0);

    const isInside = dist < threshold;
    this.setDetail(isInside);
  }

  public destroy(): void {
    this.bodies.forEach((b) => {
      if (b && typeof b.destroy === "function") b.destroy();
    });
    this.bodies = [];
    if (this.parent) this.parent.remove(this);
  }
}
