import * as THREE from "three";
import { type data, type region } from "./config";

export class LocalFluff implements region {
  public group: THREE.Group = new THREE.Group();
  private cfg: data;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.group.position.x = this.cfg.Offset || 0;
    
    this.createStars();
    this.createSolarSystemProxy();
  }

  private createStars() {
    const starCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const spread = 2000 * this.cfg.Ratio;

    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * spread;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xaaaa99, size: 2 });
    const points = new THREE.Points(geometry, material);
    this.group.add(points);
  }

  private createSolarSystemProxy() {
    const proxyGeo = new THREE.SphereGeometry(50, 16, 16);
    const proxyMat = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.8,
    });

    const proxy = new THREE.Mesh(proxyGeo, proxyMat);

    this.group.add(proxy);
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
