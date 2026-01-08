import * as THREE from "three";
import { type data, type region } from "./config";

export class Laniakea implements region {
  public group: THREE.Group = new THREE.Group();
  public cfg: data;
  constructor(cfg: data) {
    this.cfg = cfg;
  }

  destroy(): void {
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  }
}
