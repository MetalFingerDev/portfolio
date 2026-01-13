import * as THREE from "three";
import type { data, region } from "./config";

export default class InterstellarSpace implements region {
  public group: THREE.Group;
  public cfg: data;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.group = new THREE.Group();
    this.group.name = cfg.Name || "Interstellar Space";
    // Minimal visual: a faint fog or placeholder could be added later
  }

  update(_delta: number) {
    // no-op for now
  }

  setDetail(_isHighDetail: boolean): void {
    // Interstellar space has no high/low detail variants — noop
  }

  destroy() {
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
