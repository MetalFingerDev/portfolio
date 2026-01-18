import { Region } from "../regions";
import { Star } from "../stellar";
import { SolarSystem } from "../regions"; // optional solar to size galaxy

export class Galaxy extends Region {
  public sun: Star;
  public solar?: SolarSystem;

  constructor(cfg?: any, solar?: SolarSystem) {
    super(cfg);
    this.name = "milky-way";

    if (solar) this.solar = solar;

    // Create a sun parented to this galaxy region
    this.sun = new Star(this, "Sun", 1.5, 5, 0xffcc00);
    console.log("Galaxy sun created", this.sun.name);

    let innerRadius: number;
    if (this.solar && typeof (this.solar as any).boundaryRadius === "number") {
      // Use the explicit boundary radius exported by the SolarSystem
      innerRadius = (this.solar as any).boundaryRadius + 10;
    } else {
      const maxBoundary = 120;
      innerRadius = maxBoundary + 10;
    }

    const outerShellRadius = innerRadius * 100;

    if (this.solar) {
      this.solar.position.set(outerShellRadius / 2, 0, 0);
      this.add(this.solar);
    }
  }
}
