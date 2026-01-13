import * as THREE from "three";
import { AU_SCENE, LY_SCENE } from "./conversions";

export type address = (typeof regions)[keyof typeof regions];

// `region` is provided as a legacy alias below to remain compatible with
// existing code that imports `type region` from this module.

/**
 * Interface for individual entities (Planets, Stars, Moons)
 */
export interface ICelestialBody {
  group: THREE.Group;
  update(delta: number): void;
  destroy(): void;
  // Switches between full textures/geometry and simple point/sprite representations
  setDetail(isHighDetail: boolean): void;
}

/**
 * Interface for spatial containers (Solar System, Galaxy, Local Fluff)
 */
export interface IRegion {
  group: THREE.Group;
  bodies: ICelestialBody[];
  cfg: data;
  update(delta: number): void;
  destroy(): void;
  // Propagates detail level to all internal bodies
  setDetail(isHighDetail: boolean): void;
  // Allow a region to centrally receive the main camera for LOD decisions
  setCamera(camera: THREE.PerspectiveCamera): void;
}

// Backwards compatible alias for previous `region` interface name
// Note: `IRegion` is the canonical region interface used across the codebase.
// Remove legacy `region` alias to avoid duplication.

export interface data {
  Name?: string;
  Dist: number;
  Ratio: number;
  Offset?: number;
}

export const regions = {
  SOLAR_SYSTEM: 0,
  INTERSTELLAR_SPACE: 1,
  LOCAL_FLUFF: 2,
  GALAXY: 3,
  LOCAL_GROUP: 4,
  LANIAKEA: 5,
} as const;

export const compendium: Record<address, data> = {
  [regions.SOLAR_SYSTEM]: {
    Name: "Solar System",
    // Boundary at Kuiper belt (~50 AU)
    Dist: 50 * AU_SCENE,
    Ratio: 1,
  },
  [regions.INTERSTELLAR_SPACE]: {
    Name: "Interstellar Space",
    // Region beyond Solar System; set boundary around 1 light-year
    Dist: 1 * LY_SCENE,
    // Larger ratio to represent expanded scale
    Ratio: 10,
    Offset: 0,
  },
  [regions.LOCAL_FLUFF]: {
    // Lowered Ratio from 1000 to 10
    // This makes the local star cloud 100x larger in the scene
    Name: "Local Fluff",
    Dist: 50 * LY_SCENE,
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
    // Sun's position: 26,000 LY converted to scene units and scaled by the Galaxy ratio
    Offset: (26000 * LY_SCENE) / 50000,
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

export interface GalaxyData {
  name: string;
  color: number;
  size: number; // Diameter in Light Years
  coords: { x: number; y: number; z: number }; // Relative to Milky Way in LY
}

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
