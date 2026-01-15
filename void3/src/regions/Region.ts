import * as THREE from "three";

export interface CelestialBody {
  setDetail(isHighDetail: boolean): void;
  update(delta: number): void;
  destroy(): void;
  group?: THREE.Group;
}

export class Region extends THREE.Group {
  public bodies: CelestialBody[] = [];
  public camera?: THREE.PerspectiveCamera;
  public cfg: any;

  constructor(cfg?: any) {
    super();
    this.cfg = cfg || {};
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
    this.userData.camera = camera;
    this.userData.cameraAssigned = true;
  }

  public setDetail(isHighDetail: boolean): void {
    this.userData.detailIsHigh = !!isHighDetail;
    this.bodies.forEach((b) => {
      try {
        if (b && typeof b.setDetail === "function") b.setDetail(isHighDetail);
      } catch (e) {
        /* defensive */
      }
    });
  }

  public update(delta: number): void {
    this.bodies.forEach((b) => {
      try {
        if (b && typeof b.update === "function") b.update(delta);
      } catch (e) {
        /* defensive */
      }
    });
  }

  public destroy(): void {
    this.bodies.forEach((b) => {
      try {
        if (b && typeof b.destroy === "function") b.destroy();
      } catch (e) {
        /* defensive */
      }
    });
    this.bodies = [];
    this.disposeHierarchy(this);
    if (this.parent) this.parent.remove(this);
  }

  private disposeHierarchy(obj: THREE.Object3D): void {
    obj.traverse((child: any) => {
      if (child.geometry && typeof child.geometry.dispose === "function") {
        try {
          child.geometry.dispose();
        } catch (e) {}
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => this.disposeMaterial(m));
        } else {
          this.disposeMaterial(child.material);
        }
      }
      if (child instanceof THREE.Light && child.parent)
        child.parent.remove(child);
    });
  }

  private disposeMaterial(material: any): void {
    if (!material) return;
    try {
      Object.keys(material).forEach((prop) => {
        const val = material[prop];
        if (val && val.isTexture && typeof val.dispose === "function") {
          try {
            val.dispose();
          } catch (e) {}
        }
      });
    } catch (e) {}
    if (typeof material.dispose === "function") {
      try {
        material.dispose();
      } catch (e) {}
    }
  }
}
