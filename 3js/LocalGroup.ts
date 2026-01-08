import * as THREE from "three";
import { getModel } from "./utils";
import { type data, type region } from "./config";

export class LocalGroup implements region {
  public cfg: data;
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    this.model = await getModel("/milky_way/scene.gltf");
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach((mat) => {
          if ((mat as any).color) {
            (mat as any).color.setHex(0xffe28a);
          }
          if ((mat as any).emissive) {
            (mat as any).emissive.setHex(0x332200);
            (mat as any).emissiveIntensity = 0.2;
          }
          (mat as any).needsUpdate = true;
        });
      }
    });
    this.model.position.x = -this.cfg.Offset!;
    this.group.add(this.model);
    this.group.visible = false;
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
