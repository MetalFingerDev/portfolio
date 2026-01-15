import { Shell } from "./Shells";
import { InterstellarMedium } from "./InterstellerMedium";
import { Region } from "./Region";
import { Star, Planet } from "./CelestialBodies";

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

  // Add the shell property
  public shell: Shell;
  public medium: InterstellarMedium; // Add property

  constructor(cfg?: any) {
    super(cfg);
    this.name = "solar-system";

    // --- SUN ---
    this.sun = new Star(1.5, 5, 0xffcc00);
    this.sun.name = "Sun";
    this.add(this.sun);
    (this.sun as any).group = this.sun;
    this.bodies.push(this.sun as any);

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
    let maxBoundary = 0; // Track the edge of the system

    planets.forEach((p) => {
      this.add(p);

      // Position
      p.position.setX(distance);

      // Calculate next position
      const planetRadius = p.scale.x;
      distance += 8 + planetRadius * 2;

      // Track farthest point (Position + Radius)
      maxBoundary = p.position.x + planetRadius;

      // Register body
      (p as any).group = p;
      this.bodies.push(p as any);
    });

    // --- SHELLS ---
    // Create shells starting just outside the farthest planet (Neptune)
    // Adding a buffer of 10 units so it doesn't clip through the planet.
    const innerRadius = maxBoundary + 10;
    this.shell = new Shell(innerRadius);
    this.add(this.shell);

    // Register shell as a body so it gets update() calls (rotation)
    this.bodies.push(this.shell);

    // --- INTERSTELLAR MEDIUM ---
    // Cutoff is the Middle Shell boundary (Inner Radius * 10)
    const middleShellRadius = innerRadius * 10;
    // Create the medium filling the space up to that boundary
    this.medium = new InterstellarMedium(middleShellRadius, 15000);
    this.add(this.medium);
    this.bodies.push(this.medium);
  }
}
