import * as THREE from "three";
import type { data, IRegion } from "./config";

import BaseRegion from "./BaseRegion";

export class Laniakea extends BaseRegion implements IRegion {
  constructor(cfg: data) {
    super(cfg);
  }

  public update(_delta: number): void {
    // no-op for this large-scale region
  }

  destroy(): void {
    this.bodies.forEach((b) => {
      try {
        b.destroy();
      } catch (e) {}
    });

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

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.group.userData.camera = camera;
  }

  setDetail(_isHighDetail: boolean): void {
    // Laniakea has no LOD switching; store state for UI/debug
    this.group.userData.detailIsHigh = !!_isHighDetail;
  }
}
