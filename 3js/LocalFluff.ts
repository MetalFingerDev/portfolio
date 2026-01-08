import * as THREE from "three";
import { Config } from "./config";

export class LocalFluff {
  public group: THREE.Group = new THREE.Group();
  public cfg: Config;

  constructor(cfg: Config) {
    this.cfg = cfg;
    this.createStars();
  }

  private createStars() {
    // 1. The Sun (at the center)
    const sunGeom = new THREE.SphereGeometry(2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    this.group.add(sun);

    // 2. Neighboring Stars
    const starGeom = new THREE.SphereGeometry(1, 12, 12);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Create 2000 stars in a shell around the origin
    for (let i = 0; i < 2000; i++) {
      const star = new THREE.Mesh(starGeom, starMat);

      // Random position between 100 and 8000 units
      const distance = 100 + Math.random() * 7900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      star.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(phi) * Math.sin(theta),
        distance * Math.cos(phi)
      );

      this.group.add(star);
    }
  }
}
