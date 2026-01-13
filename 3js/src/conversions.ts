import * as THREE from "three";
export const EARTH_RADIUS_METERS = 6371000;
export const metersToScene = (meters: number) => meters / EARTH_RADIUS_METERS;

export const EARTH_RADIUS = 1;
export const SUN_RADIUS = 109.2;
export const MOON_RADIUS = metersToScene(1737400);

export const AU_METERS = 149597870700;
export const AU_SCENE = 23481;
export const auToScene = (au: number) => au * AU_SCENE;

export const LY_AU = 63241.077;
export const LY_SCENE = LY_AU * AU_SCENE;
export const lyToScene = (ly: number) => ly * LY_SCENE;

export const EARTH_OBLIQUITY_RAD = THREE.MathUtils.degToRad(23.439);
export const EARTH_ROTATION_SPEED = 0.01;

export const EARTH_OBLIQUITY_DEG = 23.439;
export const MOON_AXIS_TILT_DEG = 6.68;
export const SUN_AXIS_TILT_DEG = 7.25;

export const SECONDS_PER_DAY = 1;
export const perSecondToPerDay = (v: number) => v * SECONDS_PER_DAY;

// Moon constants (scene units)
export const MOON_ROTATION = (2 * Math.PI) / (27.321661 * 86400); // rad/sec (approx)
export const MOON_ORBIT_SPEED = MOON_ROTATION; // similar period
export const MOON_ORBIT_INCLINATION_DEG = 5.145; // degrees
export const MOON_DISTANCE_SCENE = auToScene(0.00257); // average distance in AU -> scene units

// Milky Way approximate width (diameter in light years -> scene units)
export const MILKY_WAY_WIDTH_SCENE = lyToScene(100000);
