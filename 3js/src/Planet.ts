import * as THREE from "three";
import { AU_SCENE, EARTH_RADIUS_M } from "./conversions";
import { createLabel } from "./label";
import { addOrbit, addAxis } from "./visuals";
import BaseBody from "./BaseBody";
import CelestialBody from "./CelestialBody";
import type { ICelestialBody } from "./config";

export interface PlanetData {
  name: string;
  color: number;
  size: number;
  distance: number; // Semi-major axis (a) in AU
  eccentricity: number; // Orbital eccentricity (e)
  angle: number; // Heliocentric Longitude (degrees)
}

export const PLANET_DATA: PlanetData[] = [
  {
    name: "Mercury",
    color: 0xaaaaaa,
    size: 0.38,
    distance: 0.387,
    eccentricity: 0.2056,
    angle: 250,
  },
  {
    name: "Venus",
    color: 0xffcc33,
    size: 0.95,
    distance: 0.723,
    eccentricity: 0.0067,
    angle: 282,
  },
  {
    name: "Earth",
    color: 0x2233ff,
    size: 1.0,
    distance: 1.0,
    eccentricity: 0.0167,
    angle: 101,
  },
  {
    name: "Mars",
    color: 0xff4422,
    size: 0.53,
    distance: 1.524,
    eccentricity: 0.0934,
    angle: 275,
  },
  {
    name: "Jupiter",
    color: 0xffaa88,
    size: 11.2,
    distance: 5.203,
    eccentricity: 0.0484,
    angle: 105,
  },
  {
    name: "Saturn",
    color: 0xeeddaa,
    size: 9.45,
    distance: 9.537,
    eccentricity: 0.0541,
    angle: 350,
  },
  {
    name: "Uranus",
    color: 0x99ccff,
    size: 4.0,
    distance: 19.19,
    eccentricity: 0.0472,
    angle: 55,
  },
  {
    name: "Neptune",
    color: 0x6688ff,
    size: 3.88,
    distance: 30.07,
    eccentricity: 0.0086,
    angle: 355,
  },
];

export default class Planet extends BaseBody implements ICelestialBody {
  public name: string;
  private inner: CelestialBody;

  constructor(planet: PlanetData, ratio: number, parent?: THREE.Group) {
    super();
    // ... rest
    super();
    this.name = planet.name;

    this.group.name = this.name;

    // Create inner CelestialBody with physical radius
    this.inner = new CelestialBody(
      {
        name: planet.name,
        radiusMeters: planet.size * EARTH_RADIUS_M,
        color: planet.color,
        rotationSpeed: 0.005,
      },
      ratio
    );

    // Add the inner group to this group
    this.group.add(this.inner.group);

    // Get scene radius for axis and label
    const sceneRadius = (this.inner.group.userData as any).baseSize;

    if (parent) {
      const { position } = addOrbit(parent, {
        distanceAU: planet.distance,
        eccentricity: planet.eccentricity,
        angleDeg: planet.angle,
        ratio,
      });
      this.group.position.copy(position);
    } else {
      // Local placement: use same math as addOrbit but apply ratio as divisor
      const a = (planet.distance * AU_SCENE) / ratio;
      const e = planet.eccentricity;
      const angleRad = THREE.MathUtils.degToRad(planet.angle);
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
      this.group.position.set(
        r * Math.cos(angleRad),
        0,
        r * Math.sin(angleRad)
      );
    }

    addAxis(this.inner.getMesh(), sceneRadius * 2.2);
    this.group.add(createLabel(this.name, sceneRadius * 3));

    // Set initial detail
    this.setDetail(true);
  }

  protected initGroups() {
    // Not used in wrapper
  }

  public update(delta: number) {
    this.inner.update(delta);
  }

  public setDetail(isHighDetail: boolean) {
    super.setDetail(isHighDetail);
    this.inner.setDetail(isHighDetail);
  }

  public destroy() {
    this.inner.destroy();
    super.destroy();
  }
}
