import * as THREE from "three";
import { AU_SCENE, LY_SCENE } from "./conversions";

export type address = (typeof regions)[keyof typeof regions];

export interface region {
  group: THREE.Group;
  cfg: data;
  update?: (delta: number) => void;
  destroy: () => void;
}

export interface data {
  Name?: string;
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
  [regions.SOLAR_SYSTEM]: {
    Name: "Solar System",
    Dist: 50000 * AU_SCENE,
    Ratio: 1,
  },
  [regions.LOCAL_FLUFF]: {
    // Lowered Ratio from 1000 to 10
    // This makes the local star cloud 100x larger in the scene
    Name: "Local Fluff",
    Dist: 200 * LY_SCENE,
    Ratio: 10,
    Offset: 0,
  },
  [regions.GALAXY]: {
    // Lowered Ratio from 5,000,000 to 50,000
    // This makes the Milky Way disc 100x larger
    // Offset: Sun is ~26,000 LY from galactic center
    Name: "Milky Way",
    Dist: 150000 * LY_SCENE,
    Ratio: 50000,
    Offset: -26000 * LY_SCENE,
  },
  [regions.LOCAL_GROUP]: {
    Name: "Local Group",
    Dist: 100000000 * LY_SCENE,
    Ratio: 100000000,
    Offset: 0,
  },
  [regions.LANIAKEA]: {
    Name: "Laniakea",
    Dist: 500000000 * LY_SCENE,
    Ratio: 1000000000,
  },
};

export interface PlanetData {
  name: string;
  color: number;
  size: number;
  distance: number; // Semi-major axis (a) in AU
  eccentricity: number; // Orbital eccentricity (e)
  angle: number; // Heliocentric Longitude (degrees) on Jan 1, 2026
}

export interface GalaxyData {
  name: string;
  color: number;
  size: number; // Diameter in Light Years
  coords: { x: number; y: number; z: number }; // Relative to Milky Way in LY
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

export const GALAXY_DATA: GalaxyData[] = [
  {
    name: "Milky Way",
    color: 0x4488ff,
    size: 100000,
    coords: { x: 0, y: 0, z: 0 },
  },
  {
    name: "Andromeda (M31)",
    color: 0xffcc99,
    size: 220000,
    coords: { x: 2500000, y: 500000, z: -200000 },
  },
  {
    name: "Triangulum (M33)",
    color: 0xcc99ff,
    size: 60000,
    coords: { x: 2700000, y: -100000, z: 300000 },
  },
  {
    name: "Large Magellanic Cloud",
    color: 0xffffcc,
    size: 14000,
    coords: { x: 160000, y: -50000, z: 100000 },
  },
  {
    name: "Small Magellanic Cloud",
    color: 0xccffff,
    size: 7000,
    coords: { x: 200000, y: 100000, z: -100000 },
  },
];
