import * as THREE from "three";
import { type region, type data } from "./config";
const PLANET_DATA = [
  { name: "Mercury", color: 0xaaaaaa, size: 0.38, distance: 4 },
  { name: "Venus", color: 0xe3bb76, size: 0.95, distance: 7 },
  { name: "Earth", color: 0x2233ff, size: 1.0, distance: 10 },
  { name: "Mars", color: 0xdd4422, size: 0.53, distance: 15 },
  { name: "Jupiter", color: 0xd8ca9d, size: 3.5, distance: 25 },
  { name: "Saturn", color: 0xa49b72, size: 2.9, distance: 35 },
  { name: "Uranus", color: 0xc1eeee, size: 1.8, distance: 45 },
  { name: "Neptune", color: 0x5b5ddf, size: 1.7, distance: 55 },
];

export class SolarSystem implements region {
  public group: THREE.Group = new THREE.Group();
  private static sphereGeo = new THREE.SphereGeometry(1, 32, 32);

  constructor(cfg: data) {
    this.group.position.x = cfg.Offset || 0;
    this.init(cfg.Ratio);
  }

  private init(ratio: number) {
    PLANET_DATA.forEach((data) => {
      const mat = new THREE.MeshStandardMaterial({ color: data.color });
      const mesh = new THREE.Mesh(SolarSystem.sphereGeo, mat);

      mesh.scale.setScalar(data.size * ratio);
      mesh.position.x = data.distance * ratio;

      this.group.add(mesh);
    });
  }

  public destroy() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material.dispose();
      }
    });
  }
}
