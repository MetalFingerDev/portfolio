import * as THREE from "three";
import { regionManager } from "./RegionManager";

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
  // guard to prevent re-entrant updates (infinite recursion)
  private _updating = false;

  // New property to define the active "High Detail" zone
  public radius: number = 0;

  constructor(cfg?: any) {
    super();
    this.cfg = cfg || {};
    // Default radius can be overwritten by child classes (e.g. SolarSystem)
    this.radius = cfg?.radius || 1000;

    // Auto-register with the global region manager
    try {
      regionManager.register(this);
    } catch (e) {
      // defensive: allow usage without manager in tests
    }
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
    this.userData.camera = camera;
  }

  public setDetail(isHighDetail: boolean): void {
    // Avoid redundant updates if state hasn't changed
    if (this.userData.detailIsHigh === isHighDetail) return;

    this.userData.detailIsHigh = !!isHighDetail;
    // iterate over a shallow copy to avoid concurrent modification
    for (const b of this.bodies.slice()) {
      if (b && typeof b.setDetail === "function") b.setDetail(isHighDetail);
    }
  }

  /**
   * Test whether the camera is inside this region (optionally with hysteresis).
   */
  public isCameraInside(camera: THREE.Camera, hysteresis: number = 1): boolean {
    const myPos = new THREE.Vector3();
    this.getWorldPosition(myPos);

    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);

    const distSq = myPos.distanceToSquared(camPos);
    const thresholdSq = this.radius * this.radius * hysteresis * hysteresis;
    return distSq < thresholdSq;
  }

  public update(delta: number): void {
    // prevent re-entrancy / infinite recursion
    if (this._updating) return;
    this._updating = true;
    try {
      // Propagate body updates only; LOD decisions are handled centrally by RegionManager
      for (const b of this.bodies.slice()) {
        if (b && typeof b.update === "function") b.update(delta);
      }
    } finally {
      this._updating = false;
    }
  }

  public destroy(): void {
    this.bodies.forEach((b) => {
      if (b && typeof b.destroy === "function") b.destroy();
    });
    this.bodies = [];
    try {
      regionManager.unregister(this);
    } catch (e) {
      // ignore
    }
    if (this.parent) this.parent.remove(this);
  }
}
