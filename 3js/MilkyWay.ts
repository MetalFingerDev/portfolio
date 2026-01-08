import * as THREE from "three";
import { getModel } from "./utils";
import { type data, type region } from "./config";

export class MilkyWay implements region {
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;
  public cfg: data;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    this.model = await getModel("/milky_way/scene.gltf");
    this.model.position.x = -this.cfg.Offset!;
    this.group.add(this.model);
    this.group.visible = false;
    this.group.position.x = this.cfg.Offset || 0;
  }

  destroy(): void {
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  }
}
