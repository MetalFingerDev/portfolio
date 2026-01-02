import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WORLD_CONFIG, SceneLevel } from "./newnits";

export class LocalGroup {
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;

  constructor() {
    const loader = new GLTFLoader();
    loader.load("/milky_way/scene.gltf", (gltf) => {
      this.model = gltf.scene;

      // Apply a subtle yellow tint to all mesh materials so the whole model appears warm
      this.model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((mat) => {
            // Tint base color if available
            if ((mat as any).color) {
              (mat as any).color.setHex(0xffe28a);
            }
            // Add a bit of yellow emissive for a warmer look (if supported)
            if ((mat as any).emissive) {
              (mat as any).emissive.setHex(0x332200);
              (mat as any).emissiveIntensity = 0.2;
            }
            (mat as any).needsUpdate = true;
          });
        }
      });

      const cfg = WORLD_CONFIG[SceneLevel.GALAXY];

      const s = cfg.Scale!;
      this.model.scale.set(s, s, s);

      this.model.position.x = -cfg.Offset!;

      this.group.add(this.model);
      this.group.visible = false;
    });
  }
}
