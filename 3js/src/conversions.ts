import * as THREE from "three";

// Physical constants in meters
export const EARTH_RADIUS_M = 6371000;
export const SUN_RADIUS_M = 695700000;
export const MOON_RADIUS_M = 1737400;
export const AU_METERS = 149597870700;
export const LY_METERS = 9.461e15;

/**
 * Converts real-world meters to internal scene units.
 * 1 Scene Unit = 1 Earth Radius when ratio is 1.
 */
export const toSceneUnits = (meters: number, ratio: number) => {
  return meters / EARTH_RADIUS_M / ratio;
};

// Backwards-compatible constants (scene units at ratio=1)
export const EARTH_RADIUS = 1; // 1 scene unit
export const AU_SCENE = AU_METERS / EARTH_RADIUS_M; // ~23481
export const LY_SCENE = LY_METERS / EARTH_RADIUS_M;

export const auToScene = (au: number) => au * AU_SCENE;
export const lyToScene = (ly: number) => ly * LY_SCENE;

export const EARTH_OBLIQUITY_RAD = THREE.MathUtils.degToRad(23.439);
export const EARTH_ROTATION_SPEED = 0.01;

export const EARTH_OBLIQUITY_DEG = 23.439;
export const MOON_AXIS_TILT_DEG = 6.68;
export const SUN_AXIS_TILT_DEG = 7.25;

export const SECONDS_PER_DAY = 1;
export const perSecondToPerDay = (v: number) => v * SECONDS_PER_DAY;

// Moon physical orbital constants
export const MOON_ROTATION = (2 * Math.PI) / (27.321661 * 86400); // rad/sec (approx)
export const MOON_ORBIT_SPEED = MOON_ROTATION; // similar period
export const MOON_ORBIT_INCLINATION_DEG = 5.145; // degrees
export const MOON_DISTANCE_SCENE = auToScene(0.00257); // average distance in AU -> scene units

// Milky Way approximate width (diameter in light years -> scene units)
export const MILKY_WAY_WIDTH_SCENE = lyToScene(100000);
