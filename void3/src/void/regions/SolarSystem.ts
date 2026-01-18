import * as THREE from "three";
import { Region } from "./Region";
import { Star } from "../stellar";
import { Planet } from "../planetary";
import { Satellite } from "../planetary/Satellite";

export class SolarSystem extends Region {
  public sun!: Star;
  public planets: Map<string, Planet> = new Map();
  private _shell?: THREE.Mesh;

  constructor() {
    // 1. Initialize Region (Solar System size)
    super({
      name: "Solar System",
      radius: 5000,
      debugShells: false,
    });

    this.setupSystem();
  }

  /**
   * Orchestrates the creation of the star, planets, and moons.
   */
  private setupSystem(): void {
    // 2. Create the Sun
    this.sun = new Star(20000, 15, 0xffcc00, true, "Sun");
    this.add(this.sun);
    this.bodies.push(this.sun);

    // 3. Planet Configuration Table
    const planetData = [
      { name: "Mercury", color: 0x8c8c8c, size: 0.8, orbit: 40, speed: 1.5 },
      { name: "Venus", color: 0xe3bb76, size: 1.2, orbit: 70, speed: 1.1 },
      { name: "Earth", color: 0x2233ff, size: 1.3, orbit: 100, speed: 0.8 },
      { name: "Mars", color: 0xff4422, size: 1.0, orbit: 140, speed: 0.6 },
    ];

    planetData.forEach((data) => {
      const planet = new Planet(
        data.name,
        data.color,
        data.size,
        data.orbit,
        data.speed,
      );

      this.add(planet);
      this.bodies.push(planet);
      this.planets.set(data.name.toLowerCase(), planet);

      // 4. Special Case: Add a Moon to Earth
      if (data.name === "Earth") {
        const moon = new Satellite("Luna", 5, 2.0, 0.3, 0xdddddd);
        planet.add(moon);
        planet.bodies.push(moon); // Planet handles updating its own bodies
      }
    });

    this.createSystemShell();
  }

  private createSystemShell() {
    const geom = new THREE.SphereGeometry(4500, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x050010,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.3,
    });
    this._shell = new THREE.Mesh(geom, mat);
    this.add(this._shell);
  }

  /**
   * Finalizing resource cleanup
   */
  protected onDestroy(): void {
    super.onDestroy(); // Disposes all bodies and meshes
    if (this._shell) {
      this._shell.geometry.dispose();
      (this._shell.material as THREE.Material).dispose();
    }
  }
}
