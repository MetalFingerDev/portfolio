import { LocalFluff } from "./LocalFluff";
import { Region } from "./Region";
import { Star } from "./Star";
import { Planet } from "./Planet";

export class SolarSystem extends Region {
  public sun: Star;
  public mercury: Planet;
  public venus: Planet;
  public earth: Planet;
  public mars: Planet;
  public jupiter: Planet;
  public saturn: Planet;
  public uranus: Planet;
  public neptune: Planet;

  public fluff: LocalFluff;

  constructor(cfg?: any) {
    super(cfg);
    this.name = "solar-system";

    // --- SUN ---
    this.sun = new Star(1.5, 5, 0xffcc00);
    this.sun.name = "Sun";
    this.add(this.sun);
    (this.sun as any).group = this.sun;
    this.bodies.push(this.sun);

    // --- PLANETS ---
    this.mercury = new Planet("Mercury", 0xaaaaaa, 0.8);
    this.venus = new Planet("Venus", 0xe3bb76, 1.2);
    this.earth = new Planet("Earth", 0x2233ff, 1.3);
    this.mars = new Planet("Mars", 0xff3300, 1.0);
    this.jupiter = new Planet("Jupiter", 0xd8ca9d, 3.5);
    this.saturn = new Planet("Saturn", 0xc5ab6e, 3.0);
    this.uranus = new Planet("Uranus", 0x4fd0e7, 2.0);
    this.neptune = new Planet("Neptune", 0x5b5ddf, 2.0);

    const planets = [
      this.mercury,
      this.venus,
      this.earth,
      this.mars,
      this.jupiter,
      this.saturn,
      this.uranus,
      this.neptune,
    ];

    let distance = 10;

    planets.forEach((p) => {
      this.add(p);
      // Position
      p.position.setX(distance);
      // Register body
      (p as any).group = p;
      this.bodies.push(p);

      // Hardcoded spacing logic
      const planetRadius = p.scale.x;
      distance += 8 + planetRadius * 2;
    });

    // --- BOUNDARY (No Shells) ---
    // Hardcoded boundary for the fluff to start
    const boundaryRadius = 120;

    // --- INTERSTELLAR MEDIUM ---
    const fluffInner = boundaryRadius * 10; // 1,200
    const fluffOuter = boundaryRadius * 100; // 12,000

    this.fluff = new LocalFluff(fluffInner, fluffOuter, 300);
    this.add(this.fluff);
    this.bodies.push(this.fluff);
  }
}
