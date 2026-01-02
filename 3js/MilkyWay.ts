import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WORLD_CONFIG, SceneLevel } from "./newnits";

export class MilkyWay {
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;

  constructor() {
    const loader = new GLTFLoader();
    loader.load("/milky_way/scene.gltf", (gltf) => {
      this.model = gltf.scene;

      const cfg = WORLD_CONFIG[SceneLevel.GALAXY];

      const s = cfg.Scale!;
      this.model.scale.set(s, s, s);

      this.model.position.x = -cfg.Offset!;

      this.group.add(this.model);
      this.group.visible = false;
    });
  }
}
