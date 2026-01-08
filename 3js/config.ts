export enum Region {
  SOLAR_SYSTEM = 0,
  LOCAL_FLUFF = 1,
  GALAXY = 2,
  LOCAL_GROUP = 3,
  LANIAKEA = 4,
}

export interface Config {
  Dist: number;
  Ratio: number;
  Offset?: number;
}

export const Compendium: Record<Region, Config> = {
  [Region.SOLAR_SYSTEM]: {
    Dist: 10000,
    Ratio: 1,
  },
  [Region.LOCAL_FLUFF]: {
    Dist: 10000,
    Ratio: 10,
  },
  [Region.GALAXY]: {
    Dist: 5000,
    Ratio: 100,
    Offset: 2000,
  },
  [Region.LOCAL_GROUP]: {
    Dist: 50000,
    Ratio: 100,
    Offset: 0,
  },
  [Region.LANIAKEA]: {
    Dist: 200000,
    Ratio: 10000,
  },
};
