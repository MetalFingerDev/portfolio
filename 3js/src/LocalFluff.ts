import * as THREE from "three";
import type { IRegion, ICelestialBody, data } from "./config";

export class LocalFluff implements IRegion {
  public group: THREE.Group = new THREE.Group();
  public cfg: data;
  public bodies: ICelestialBody[] = [];

  constructor(cfg: data) {
    this.cfg = cfg;
    this.init();
  }

  public update(_delta: number): void {
    // no-op update; could animate subtle movement later
  }

  private init() {
    // Apply the regional offset to the group position
    this.group.position.x = this.cfg.Offset || 0;

    const starCount = 50000;
    const boundaryRadius = this.cfg.Dist / this.cfg.Ratio;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // UNIFORM VOLUMETRIC: Cube root for uniform sphere volume distribution
      // This ensures stars fill the entire region evenly, not concentrated at center
      const r = Math.cbrt(Math.random()) * boundaryRadius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // MATCHED COLOR: Identical HSL range to SolarSystem
      const color = new THREE.Color().setHSL(
        0.6 + Math.random() * 0.05,
        0.8,
        0.5 + Math.random() * 0.4
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5, // Match size with SolarSystem
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false, // Essential for visual parity
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(geometry, material);
    this.group.add(stars);

    // Volume glow remains for atmosphere
    const volumeGeo = new THREE.SphereGeometry(boundaryRadius * 0.8, 32, 32);
    const volumeMat = new THREE.MeshBasicMaterial({
      color: 0x112244,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    this.group.add(new THREE.Mesh(volumeGeo, volumeMat));
  }

  destroy() {
    this.bodies.forEach((b) => {
      try {
        b.destroy();
      } catch (e) {}
    });

    this.group.traverse((c: any) => {
      if (c.geometry) c.geometry.dispose();
    });
  }

  setDetail(_isHighDetail: boolean): void {
    this.bodies.forEach((b) => {
      try {
        b.setDetail(_isHighDetail);
      } catch (e) {}
    });
    // LocalFluff currently has no LOD variants beyond bodies; noop
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.group.userData.camera = camera;
  }
}
