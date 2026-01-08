import * as THREE from "three";
import { AU_SCENE, LY_SCENE } from "./units";

export type address = (typeof regions)[keyof typeof regions];

export interface region {
  group: THREE.Group;
  update?: (delta: number) => void;
  destroy: () => void;
}

export interface data {
  Dist: number;
  Ratio: number;
  Offset?: number;
}

export const regions = {
  SOLAR_SYSTEM: 0,
  LOCAL_FLUFF: 1,
  GALAXY: 2,
  LOCAL_GROUP: 3,
  LANIAKEA: 4,
} as const;

export const compendium: Record<address, data> = {
  [regions.SOLAR_SYSTEM]: { Dist: 50000 * AU_SCENE, Ratio: 1 },
  [regions.LOCAL_FLUFF]: { Dist: 200 * LY_SCENE, Ratio: 1000 },
  [regions.GALAXY]: { Dist: 150000 * LY_SCENE, Ratio: 1000000, Offset: 2000 },
  [regions.LOCAL_GROUP]: { Dist: 10000000 * LY_SCENE, Ratio: 100000000 },
  [regions.LANIAKEA]: { Dist: 500000000 * LY_SCENE, Ratio: 1000000000 },
};

export interface PlanetData {
  name: string;
  color: number;
  size: number;
  distance: number; // Semi-major axis (a) in AU
  eccentricity: number; // Orbital eccentricity (e)
  angle: number; // Heliocentric Longitude (degrees) on Jan 1, 2026
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
