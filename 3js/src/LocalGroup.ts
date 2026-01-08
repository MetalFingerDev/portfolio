import * as THREE from "three";
import { getModel } from "./utils";
import { type data, type region } from "./config";
import { lyToScene } from "./units";

export class LocalGroup implements region {
  public cfg: data;
  public group: THREE.Group = new THREE.Group();
  private model: THREE.Group | null = null;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    // 1. Load the model
    this.model = await getModel("/milky_way/scene.gltf");

    // 2. Adjust the Scale
    // Since the Milky Way is ~100,000 Light Years across,
    // we use a multiplier that feels right for the "Local Group" view.
    const galaxyScale = lyToScene(100000) / this.cfg.Ratio; // Increase this number until it fits your scene perfectly
    this.model.scale.setScalar(galaxyScale);

    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        materials.forEach((mat) => {
          // Adjust color for a warmer, galactic glow
          if ((mat as any).color) {
            (mat as any).color.setHex(0xffe28a);
          }

          // Boost emissive properties to make it shine in dark space
          if ((mat as any).emissive) {
            (mat as any).emissive.setHex(0x443311);
            (mat as any).emissiveIntensity = 1.5; // Increased for better Bloom effect
          }

          // Ensure the texture looks good from both sides
          mat.side = THREE.DoubleSide;
          (mat as any).transparent = true;
          (mat as any).depthWrite = false; // Prevents "blocky" transparency artifacts
          (mat as any).needsUpdate = true;
        });
      }
    });

    // 3. Positioning
    // Reset position to center before applying the offset
    this.model.position.set(-this.cfg.Offset!, 0, 0);

    this.group.add(this.model);

    // Make it visible! (Check if your controller logic turns this on elsewhere)
    this.group.visible = true;
  }

  // Add an update method to make the galaxy rotate slowly
  public update(delta: number): void {
    if (this.model) {
      this.model.rotation.y += delta * 0.05; // Cinematic slow spin
    }
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
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
