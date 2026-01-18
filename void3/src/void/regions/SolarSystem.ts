import * as THREE from "three";
import { Region } from "./Region";
import { Star } from "../stellar"
import { Planet } from "../planetary";
import { Moon } from "../planetary";

export class SolarSystem extends Region {
  // Public accessors for key bodies
  public sun!: Star;
  public planets: Map<string, Planet> = new Map();
  public moons: Map<string, Moon> = new Map();

  private _shell?: THREE.Mesh;

  constructor() {
    // 1. Initialize the Region (Base Class)
    super({
      name: "Solar System",
      radius: 5000,
      debugShells: false, // Set to true to see the entry/exit bounds
    });

    console.log(`[SolarSystem] Initializing ${this.name}...`);

    // 2. Build the hierarchy
    this.setup();
  }

  /**
   * Orchestrates the creation of the star, planets, and moons.
   * Utilizes the 'parent' parameter in constructors to build the scene graph.
   */
  private setup(): void {
    // --- Create Sun ---
    // Parent is 'this' (SolarSystem Region)
    this.sun = new Star(this, "Sun", 20000, 15, 0xffffff, true);
    console.log("Sun created.");

    // --- Configuration ---
    const planetConfig = [
      { name: "Mercury", color: 0x8c8c8c, size: 0.8, orbit: 40, speed: 1.5 },
      { name: "Venus", color: 0xe3bb76, size: 1.2, orbit: 70, speed: 1.1 },
      { name: "Earth", color: 0x2233ff, size: 1.3, orbit: 100, speed: 0.8 },
      { name: "Mars", color: 0xff4422, size: 1.0, orbit: 140, speed: 0.6 },
      { name: "Jupiter", color: 0xff4111, size: 11, orbit: 300, speed: 0.4 },
    ];

    const moonConfig = [
      {
        name: "Luna",
        color: 0xffffcf,
        size: 0.3,
        orbit: 14,
        speed: 1,
        parent: "earth",
      },
      {
        name: "Phobos",
        color: 0x554433,
        size: 0.2,
        orbit: 6,
        speed: 2.0,
        parent: "mars",
      },
    ];

    // --- Create Planets ---
    planetConfig.forEach((conf) => {
      // Pass 'this.sun' as parent so planets orbit the sun, not the center of the region
      const planet = new Planet(
        this.sun,
        conf.name,
        conf.color,
        conf.size,
        conf.orbit,
        conf.speed,
      );

      this.planets.set(conf.name.toLowerCase(), planet);
      console.log(`Planet added: ${planet.name}`);
    });

    // --- Create Moons ---
    moonConfig.forEach((conf) => {
      // Find the parent planet in our map
      const parentPlanet = this.planets.get(conf.parent);

      if (parentPlanet) {
        const moon = new Moon(
          parentPlanet,
          conf.name,
          conf.color,
          conf.size,
          conf.orbit,
          conf.speed,
        );
        this.moons.set(conf.name.toLowerCase(), moon);
        console.log(`Moon added: ${moon.name} orbiting ${parentPlanet.name}`);
      } else {
        console.warn(
          `Could not find parent planet ${conf.parent} for moon ${conf.name}`,
        );
      }
    });

    // --- System Shell (Visual Boundary) ---
    this.createSystemShell();
  }

  /**
   * Creates a visual boundary for the system
   */
  private createSystemShell(): void {
    const geom = new THREE.SphereGeometry(4500, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x050010,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.1, // Lower opacity for better visibility inside
    });
    this._shell = new THREE.Mesh(geom, mat);
    this._shell.name = "SystemShell";
    this.add(this._shell);
  }

  /**
   * Custom update logic (optional)
   * The base 'Region' class already recursively updates all children (Sun -> Planets -> Moons).
   * We can add system-wide logic here if needed.
   */
  protected onUpdate(delta: number): void {
    // Example: Slowly rotate the entire background shell
    if (this._shell) {
      this._shell.rotation.y += 0.02 * delta;
    }
  }

  /**
   * Clean up resources
   */
  protected onDestroy(): void {
    console.log("Destroying SolarSystem...");

    // Dispose the shell specifically
    if (this._shell) {
      this._shell.geometry.dispose();
      (this._shell.material as THREE.Material).dispose();
    }

    // Clear maps
    this.planets.clear();
    this.moons.clear();

    // super.onDestroy() will traverse and dispose all children (Sun, Planets, etc)
    super.onDestroy();
  }
}
