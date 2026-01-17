import { LocalFluff } from "../regions";
import { Region } from "../regions/Region";
import { Star } from "../stellar";
import { SolarSystem } from "../regions/SolarSystem"; // optional solar to size galaxy

export class Galaxy extends Region {
  public sun: Star;
  public fluff: LocalFluff;
  public solar?: SolarSystem;

  constructor(cfg?: any, solar?: SolarSystem) {
    super(cfg);
    this.name = "milky-way";

    if (solar) this.solar = solar;

    this.sun = new Star(1.5, 5, 0xffcc00);
    this.sun.name = "Sun";
    this.add(this.sun);

    (this.sun as any).group = this.sun;
    this.bodies.push(this.sun);

    let innerRadius: number;
    if (this.solar && typeof (this.solar as any).boundaryRadius === "number") {
      // Use the explicit boundary radius exported by the SolarSystem
      innerRadius = (this.solar as any).boundaryRadius + 10;
    } else {
      const maxBoundary = 120;
      innerRadius = maxBoundary + 10;
    }

    const middleShellRadius = innerRadius * 10;
    const outerShellRadius = innerRadius * 100;

    this.fluff = new LocalFluff(middleShellRadius, outerShellRadius, 150);
    this.add(this.fluff);
    this.bodies.push(this.fluff);

    if (this.solar) {
      this.solar.position.set(outerShellRadius / 2, 0, 0);
      this.add(this.solar);
      this.bodies.push(this.solar);
    }
  }
}
