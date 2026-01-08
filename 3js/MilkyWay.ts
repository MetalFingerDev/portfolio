import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Config } from "./config";

export class MilkyWay {
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;
  public cfg: Config;

  constructor(cfg: Config) {
    this.cfg = cfg;
    const loader = new GLTFLoader();

    loader.load("/milky_way/scene.gltf", (gltf) => {
      this.model = gltf.scene;
      this.model.position.x = -cfg.Offset!;
      this.group.add(this.model);
      this.group.visible = false;
      this.group.position.x = this.cfg.Offset || 0;
    });
  }
}
