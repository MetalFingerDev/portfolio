import * as THREE from "three";
import { Config } from "./config";

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

export class SolarSystem {
  public group: THREE.Group = new THREE.Group();
  private cfg;

  constructor(cfg: Config) {
    this.cfg = cfg;
    this.group.position.x = this.cfg.Offset || 0;

    this.createPlanets();
  }

  private createPlanets() {
    const sphereSegments = 32;
    const ratio = this.cfg.Ratio || 1;

    PLANET_DATA.forEach((data) => {
      const scaledDistance = data.distance * ratio;

      const geometry = new THREE.SphereGeometry(sphereSegments, sphereSegments);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.7,
        metalness: 0.1,
      });

      const planet = new THREE.Mesh(geometry, material);
      const orbit = this.createOrbit(scaledDistance);

      planet.position.set(scaledDistance, 0, 0);

      this.group.add(planet);
      this.group.add(orbit);
    });
  }

  private createOrbit(radius: number): THREE.LineLoop {
    const segments = 64;
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
    });

    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.LineLoop(geometry, material);
  }
}
