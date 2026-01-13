import * as THREE from "three";
import { type data, type region } from "./config";
import { lyToScene } from "./conversions";

export class MilkyWay implements region {
  public group: THREE.Group = new THREE.Group();
  public cfg: data;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.initialize();
  }

  private initialize(): void {
    // Keep the group at 0,0,0 so the Galactic Center is the center of the world
    this.group.position.set(0, 0, 0);

    /**
     * ACCURATE PROPORTIONS (100:1 Ratio)
     * - Radius: ~52,850 LY (Total Diameter ~105,700 LY)
     * - Thin Disc Thickness: ~1,000 LY
     * - Bulge: ~12,000 LY diameter (Radius 6,000 LY)
     */
    const radius = lyToScene(52850) / this.cfg.Ratio;
    const thickness = lyToScene(1000) / this.cfg.Ratio;
    const bulgeRadius = lyToScene(6000) / this.cfg.Ratio;

    // 1. THE MAIN DISC (Cylinder)
    // Using a very low opacity and Additive Blending to make it look like gas/glow
    const discGeo = new THREE.CylinderGeometry(radius, radius, thickness, 128);
    discGeo.rotateX(Math.PI / 2); // Orient to the XZ plane

    const discMat = new THREE.MeshBasicMaterial({
      color: 0x4466ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mainDisc = new THREE.Mesh(discGeo, discMat);
    this.group.add(mainDisc);

    // 2. INNER DENSE PLANE (Cylinder)
    // A secondary, much thinner but brighter disc to emphasize the "massive" scale
    const innerPlaneGeo = new THREE.CylinderGeometry(
      radius * 0.8,
      radius * 0.8,
      thickness * 0.1,
      128
    );
    innerPlaneGeo.rotateX(Math.PI / 2);

    const innerPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.group.add(new THREE.Mesh(innerPlaneGeo, innerPlaneMat));

    // 3. THE BULGE (Sphere)
    // Central bulge as a full sphere
    const bulgeGeo = new THREE.SphereGeometry(bulgeRadius, 32, 32);

    const bulgeMat = new THREE.MeshBasicMaterial({
      color: 0xffccaa, // Warm core color
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    this.group.add(new THREE.Mesh(bulgeGeo, bulgeMat));

    // 4. THE CORE POINT (Visual Parity)
    // To match the star style of SolarSystem and LocalFluff
    const corePointGeo = new THREE.BufferGeometry();
    corePointGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );

    const corePointMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 4,
      sizeAttenuation: false, // Crisp pixel logic
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });

    const corePoint = new THREE.Points(corePointGeo, corePointMat);
    this.group.add(corePoint);

    // 5. SOLAR SYSTEM ANCHOR (The "Star" placeholder)
    const sunDist = lyToScene(26000) / this.cfg.Ratio;
    const anchorGeo = new THREE.BufferGeometry();
    anchorGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([sunDist, 0, 0], 3)
    );

    const anchorMat = new THREE.PointsMaterial({
      color: 0xffff00, // Yellow star color
      size: 8,
      sizeAttenuation: false, // Keeps it a constant pixel size
      transparent: true,
      opacity: 0.9,
    });

    const anchor = new THREE.Points(anchorGeo, anchorMat);
    anchor.name = "Solar System Anchor"; // Crucial for finding it in main.ts
    this.group.add(anchor);
  }

  public update(_delta: number): void {
    // Subtle rotation to make the "massive" body feel alive
    this.group.rotation.y += _delta * 0.005;
  }

  destroy(): void {
    this.group.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  setDetail(_isHighDetail: boolean): void {
    // MilkyWay has no separate LOD groups; noop for now
  }
}
