import * as THREE from "three";
import { getModel } from "./utils";
import { type data, type region } from "./config";
import { lyToScene } from "./units";

export class MilkyWay implements region {
  public group: THREE.Group = new THREE.Group();
  public cfg: data;
  private model: THREE.Group | null = null;

  // Use a scale that relates to Light Years from units.ts
  // 100,000 LY is the approximate diameter of the Milky Way
  private modelScale: number = 1;

  constructor(cfg: data) {
    this.cfg = cfg;
    // Ensure the group is actually positioned where the camera is looking
    this.group.position.x = cfg.Offset || 0;
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    this.model = await getModel("/milky_way/scene.gltf");

    // Fix: Scaling it to be visible based on your actual Scene Units
    // If Ratio is 1, this will be 100,000 LY wide.
    const actualScale =
      (lyToScene(100000) / (this.cfg.Ratio || 1)) * this.modelScale;
    this.model.scale.setScalar(actualScale);

    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Handle both single material and material arrays
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        materials.forEach((mat: any) => {
          if (!mat) return;

          // Basic transparency settings
          mat.transparent = true;
          mat.depthWrite = false;
          mat.side = THREE.DoubleSide;
          mat.alphaTest = 0.01; // Helps with texture transparency

          // Make the galaxy self-illuminating (no lights needed)
          // Check for existing texture map to use as emissive
          const textureMap = mat.map || mat.emissiveMap;
          if (textureMap) {
            mat.emissive = new THREE.Color(0xffffff);
            mat.emissiveMap = textureMap;
            mat.emissiveIntensity = 1.2;
          } else {
            // Fallback: just make it glow with a warm color
            mat.emissive = new THREE.Color(0xffe8c0);
            mat.emissiveIntensity = 0.8;
          }

          // Adjust base color to not wash out the texture
          if (mat.color) {
            mat.color.setHex(0xffffff);
          }

          // CRITICAL: Tell Three.js to re-upload this material to GPU
          mat.needsUpdate = true;
        });

        // Also ensure the geometry is properly set up
        if (mesh.geometry) {
          mesh.geometry.computeBoundingSphere();
        }
      }
    });

    this.group.add(this.model);
    this.group.visible = true; // Ensure visibility

    console.log(
      `Milky Way loaded at scale: ${actualScale} at offset: ${this.group.position.x}`
    );
  }

  public setScale(value: number): void {
    this.modelScale = value;
    if (this.model) {
      const actualScale = (lyToScene(100000) / (this.cfg.Ratio || 1)) * value;
      this.model.scale.setScalar(actualScale);
    }
  }

  destroy(): void {
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    // Remove from parent to stop it from "fucking up" other scenes
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
