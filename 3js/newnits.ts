export enum SceneLevel {
  SOLAR_SYSTEM = 0,
  LOCAL_FLUFF = 1,
  GALAXY = 2,
  LOCAL_GROUP = 3,
  LANIAKEA = 4, 
}

interface LevelConfig {
  Dist?: number;
  Ratio?: number;
  Scale?: number;
  Offset?: number;
}

export const WORLD_CONFIG: Record<SceneLevel, LevelConfig> = {
  [SceneLevel.SOLAR_SYSTEM]: {
    Dist: 10000,
    Ratio: 1,
    Scale: 1,
  },
  [SceneLevel.LOCAL_FLUFF]: {
    Dist: 10000,
    Ratio: 10,
    Scale: 1,
  },
  [SceneLevel.GALAXY]: {
    Dist: 5000,
    Ratio: 100,
    Scale: 10,
    Offset: 2000,
  },
  [SceneLevel.LOCAL_GROUP]: {
    Dist: 50000,
    Ratio: 100,
    Scale: 10,
    Offset: 0,
  },
  [SceneLevel.LANIAKEA]: {
    Dist: 200000,
    Ratio: 10000,
    Scale: 1,
  },
};
