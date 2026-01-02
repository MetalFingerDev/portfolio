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
    Dist: 10000, // Threshold to exit Solar System
    Ratio: 1, // Planet distances are multiplied by this
    Scale: 1,
  },
  [SceneLevel.LOCAL_FLUFF]: {
    Dist: 10000, // Snap to Galaxy at 5k
    Ratio: 10, // Shrunk 100x
    Scale: 1,
  },
  [SceneLevel.GALAXY]: {
    Dist: 5000, // Threshold to exit Galaxy
    Ratio: 100, // Galaxy stars/details scale
    Scale: 10,
    Offset: 2000,
  },
  [SceneLevel.LOCAL_GROUP]: {
    Dist: 50000,
    Ratio: 100, // <--- This needs to be LARGE so galaxies aren't at 0,0,0
    Scale: 1000, // <--- This needs to be LARGE so the models are visible
    Offset: 0,
  },
  [SceneLevel.LANIAKEA]: {
    Dist: 200000, // Final boundary
    Ratio: 10000, // 100x jump from Local Group
    Scale: 1,
  },
};
