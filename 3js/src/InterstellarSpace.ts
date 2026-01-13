import * as THREE from "three";
import type { data, IRegion, ICelestialBody } from "./config";

export default class InterstellarSpace implements IRegion {
  public group: THREE.Group;
  public cfg: data;
  public bodies: ICelestialBody[] = [];

  constructor(cfg: data) {
    this.cfg = cfg;
    this.group = new THREE.Group();
    this.group.name = cfg.Name || "Interstellar Space";
    // Minimal visual: a faint fog or placeholder could be added later
  }

  update(_delta: number) {
    this.bodies.forEach((b) => {
      try {
        b.update(_delta);
      } catch (e) {}
    });
    // no-op for other visuals for now
  }

  setDetail(_isHighDetail: boolean): void {
    this.group.userData.detailIsHigh = !!_isHighDetail;
    this.bodies.forEach((b) => {
      try {
        b.setDetail(_isHighDetail);
      } catch (e) {}
    });
    // Interstellar space has no separate LOD visuals — noop beyond bodies
  }

  destroy() {
    this.bodies.forEach((b) => {
      try {
        b.destroy();
      } catch (e) {}
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.group.userData.camera = camera;
  }
}
