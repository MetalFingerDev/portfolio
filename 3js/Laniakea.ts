import * as THREE from "three";
import { Config } from "./config";

export class Laniakea {
  public group: THREE.Group = new THREE.Group();
  public cfg: Config;
  constructor(cfg: Config) {
    this.cfg = cfg;
  }
}
