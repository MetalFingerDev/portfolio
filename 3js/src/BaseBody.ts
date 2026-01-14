import * as THREE from "three";
import type { ICelestialBody } from "./config";
import { disposeObject } from "./utils/threeUtils";

export default abstract class BaseBody implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  protected highDetailGroup: THREE.Group = new THREE.Group();
  protected lowDetailGroup: THREE.Group = new THREE.Group();
  protected isHighDetail = true;

  constructor() {
    this.group.add(this.highDetailGroup, this.lowDetailGroup);
    this.initGroups();
  }

  protected abstract initGroups(): void;

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
    disposeObject(this.group);
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
