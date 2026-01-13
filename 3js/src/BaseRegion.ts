import * as THREE from "three";
import type { IRegion, ICelestialBody, data } from "./config";

export default abstract class BaseRegion implements IRegion {
  public group: THREE.Group = new THREE.Group();
  public bodies: ICelestialBody[] = [];
  public cfg: data;
  protected camera?: THREE.PerspectiveCamera;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.group.position.x = cfg.Offset || 0;
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
    try {
      this.group.userData.camera = camera;
      this.group.userData.cameraAssigned = true;
    } catch (e) {}
  }

  public setDetail(isHighDetail: boolean): void {
    this.group.userData.detailIsHigh = !!isHighDetail;
    this.bodies.forEach((b) => {
      try {
        b.setDetail(isHighDetail);
      } catch (e) {}
    });
  }

  public update(delta: number): void {
    this.bodies.forEach((b) => {
      try {
        b.update(delta);
      } catch (e) {}
    });
  }

  public destroy(): void {
    this.bodies.forEach((b) => {
      try {
        b.destroy();
      } catch (e) {}
    });
    this.group.traverse((obj: any) => {
      if (obj.geometry) {
        try {
          obj.geometry.dispose();
        } catch (e) {}
      }
      if (obj.material) {
        try {
          if (Array.isArray(obj.material))
            obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        } catch (e) {}
      }
      if (obj instanceof THREE.Light && obj.parent) {
        obj.parent.remove(obj);
      }
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
