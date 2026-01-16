import { Region } from "./Region";
import { regionManager } from "./RegionManager";
import { Star } from "../stellar/Star";
import { Planet } from "../planetary/Planet";

export class SolarSystem extends Region {
  public sun: Star;
  public planets: Record<string, Planet> = {}; // Quick access map if needed

  constructor(cfg?: any) {
    // 1. Define Radius:
    // The furthest planet (Neptune) is roughly at distance 100.
    // Multiplied by REGION_SCALE (2) = 200.
    // We set radius to 300 to create a comfortable "High Detail" zone around the system.
    super({ ...cfg, radius: 2000 });

    this.name = "solar-system";

    // --- SUN ---
    // High detail Sun (intensity 5, radius 1.5)
    this.sun = new Star(1.5, 5, 0xffcc00);
    this.sun.name = "Sun";
    this.add(this.sun);
    this.bodies.push(this.sun);

    // --- PLANETS CONFIGURATION ---
    // Optimized: Data-driven generation instead of repeated "new Planet()" calls
    const planetData = [
      { name: "Mercury", color: 0xaaaaaa, scale: 0.8 },
      { name: "Venus", color: 0xe3bb76, scale: 1.2 },
      { name: "Earth", color: 0x2233ff, scale: 1.3 },
      { name: "Mars", color: 0xff3300, scale: 1.0 },
      { name: "Jupiter", color: 0xd8ca9d, scale: 3.5 },
      { name: "Saturn", color: 0xc5ab6e, scale: 3.0 },
      { name: "Uranus", color: 0x4fd0e7, scale: 2.0 },
      { name: "Neptune", color: 0x5b5ddf, scale: 2.0 },
    ];

    let currentDist = 10;

    planetData.forEach((data) => {
      const p = new Planet(data.name, data.color, data.scale);

      // Position Logic
      p.position.setX(currentDist);

      this.add(p);
      this.bodies.push(p);
      this.planets[data.name.toLowerCase()] = p;

      // Spacing update
      currentDist += 8 + p.scale.x * 2;
    });

    // Add some background stars
    this.populateStars(10);
  }

  private populateStars(starCount: number) {
    for (let i = 0; i < starCount; i++) {
      const radialDistance = 400000 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 200;

      const x = radialDistance * Math.cos(angle);
      const z = radialDistance * Math.sin(angle);

      const star = new Star(1.5, 50, 0xffcc00);
      star.position.set(x, height, z);
      // Background stars are low-detail by default
      try {
        star.setDetail(false);
      } catch (e) {}
      this.add(star);

      this.bodies.push(star);
    }
  }

  public setDetail(isHighDetail: boolean): void {
    // propagate to bodies
    super.setDetail(isHighDetail);

    // Log detail changes when manager logging enabled
    if (regionManager.log) {
      console.info(
        `[SolarSystem] setDetail -> ${isHighDetail ? "HIGH" : "LOW"}`
      );
    }
  }

  // Maintain compatibility getters for existing code that expects `solar.earth` etc.
  public get mercury(): Planet | undefined {
    return this.planets["mercury"];
  }
  public get venus(): Planet | undefined {
    return this.planets["venus"];
  }
  public get earth(): Planet | undefined {
    return this.planets["earth"];
  }
  public get mars(): Planet | undefined {
    return this.planets["mars"];
  }
  public get jupiter(): Planet | undefined {
    return this.planets["jupiter"];
  }
  public get saturn(): Planet | undefined {
    return this.planets["saturn"];
  }
  public get uranus(): Planet | undefined {
    return this.planets["uranus"];
  }
  public get neptune(): Planet | undefined {
    return this.planets["neptune"];
  }
}
