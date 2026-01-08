import * as THREE from "three";

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
  [regions.SOLAR_SYSTEM]: { Dist: 10000, Ratio: 1 },
  [regions.LOCAL_FLUFF]: { Dist: 10000, Ratio: 10 },
  [regions.GALAXY]: { Dist: 5000, Ratio: 100, Offset: 2000 },
  [regions.LOCAL_GROUP]: { Dist: 50000, Ratio: 100 },
  [regions.LANIAKEA]: { Dist: 200000, Ratio: 10000 },
};
