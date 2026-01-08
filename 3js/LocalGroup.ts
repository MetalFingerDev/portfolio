import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Config, Region } from "./config";

export class LocalGroup {
  public cfg: Config;
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;

  constructor(cfg: Config) {
    this.cfg = cfg;
    const loader = new GLTFLoader();

    loader.load("/milky_way/scene.gltf", (gltf) => {
      this.model = gltf.scene;
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
      this.model.position.x = -cfg.Offset!;

      this.group.add(this.model);
      this.group.visible = false;
    });
  }
}
