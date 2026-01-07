import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CONFIG, Region } from "./config";

export class MilkyWay {
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;

  constructor() {
    const loader = new GLTFLoader();
    loader.load("/milky_way/scene.gltf", (gltf) => {
      this.model = gltf.scene;

      const cfg = CONFIG[Region.GALAXY];

      this.model.position.x = -cfg.Offset!;

      this.group.add(this.model);
      this.group.visible = false;
    });
  }
}
