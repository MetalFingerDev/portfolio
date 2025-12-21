// Units and conversions for scene scaling
// Scene unit = 1 Earth radius (keeps existing layout but centralizes conversions)

export const METER_UNIT = 6371000;
export const metersToScene = (meters: number) => meters / METER_UNIT;
export const sceneToMeters = (sceneUnits: number) => sceneUnits * METER_UNIT;

export const EARTH_RADIUS_METERS = 6371000; // meters
export const EARTH_RADIUS = metersToScene(EARTH_RADIUS_METERS); // = 1
export const EARTH_ROTATION = 0.01;

export const SUN_RADIUS_METERS = 696000000; // meters
export const SUN_RADIUS_SCENE = metersToScene(SUN_RADIUS_METERS); // = 23,544

export const AU_METERS = 1.495978707e11; // astronomical unit in meters
export const SUN_DISTANCE_METERS = AU_METERS;
export const SUN_DISTANCE_SCENE = metersToScene(SUN_DISTANCE_METERS);

// Star field radius (scene units). Placed beyond the Sun distance so stars appear at infinity.
export const STAR_FIELD_RADIUS = SUN_DISTANCE_SCENE * 3;
