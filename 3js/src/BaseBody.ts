import * as THREE from "three";
import type { ICelestialBody } from "./config";

export default abstract class BaseBody implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  protected highDetailGroup: THREE.Group = new THREE.Group();
  protected lowDetailGroup: THREE.Group = new THREE.Group();
  protected isHighDetail = true;

  constructor() {
    this.group.add(this.highDetailGroup, this.lowDetailGroup);
  }

  public setDetail(isHighDetail: boolean) {
    this.isHighDetail = isHighDetail;
    this.group.userData.detailIsHigh = isHighDetail;
    this.highDetailGroup.visible = isHighDetail;
    this.lowDetailGroup.visible = !isHighDetail;
  }

  public update(_delta: number) {
    // Default noop; subclasses override when needed
  }

  protected setBaseSize(size: number) {
    try {
      this.group.userData.baseSize = size;
    } catch (e) {}
  }

  public destroy() {
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
