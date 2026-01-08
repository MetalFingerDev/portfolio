import * as THREE from "three";
import { type region, type data } from "./config";

export class LocalFluff implements region {
  public group: THREE.Group = new THREE.Group();

  constructor(cfg: data) {
    this.group.position.x = cfg.Offset || 0;
    this.init(cfg.Ratio, cfg.Dist);
  }

  private init(ratio: number, dist: number) {
    const starCount = 2000; // Much higher count possible with Points
    const boundaryRadius = dist / ratio;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0x9bb0ff), // Blue-ish
      new THREE.Color(0xfff4ea), // White
      new THREE.Color(0xffd2a1), // Yellow-ish
      new THREE.Color(0xffcc6f), // Orange
    ];

    for (let i = 0; i < starCount; i++) {
      // Spherical distribution
      const r = Math.random() * boundaryRadius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const i3 = i * 3;
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // Random color from palette
      const clr = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = clr.r;
      colors[i3 + 1] = clr.g;
      colors[i3 + 2] = clr.b;

      sizes[i] = Math.random() * 2;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true, // Stars get smaller as you zoom out
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.group.add(starField);
  }

  destroy(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Points) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}
