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

// Moon constants
export const MOON_RADIUS_METERS = 1737400; // meters
export const MOON_RADIUS = metersToScene(MOON_RADIUS_METERS);
export const MOON_DISTANCE_METERS = 384400000; // average distance to moon in meters
export const MOON_DISTANCE_SCENE = metersToScene(MOON_DISTANCE_METERS);

// Time unit helpers
export const SECONDS_PER_DAY = 86400; // 1 astronomical day in seconds

// Orbital parameters (realistic values)
export const MOON_ORBIT_INCLINATION_DEG = 5.145; // degrees relative to ecliptic
export const MOON_ORBITAL_PERIOD_DAYS = 27.321661; // sidereal month (days)
export const MOON_ORBITAL_PERIOD_SECONDS =
  MOON_ORBITAL_PERIOD_DAYS * SECONDS_PER_DAY;
export const MOON_ORBIT_SPEED = (2 * Math.PI) / MOON_ORBITAL_PERIOD_SECONDS; // radians per second

// Moon rotation (spin) — Moon is tidally locked so rotation ≈ orbital angular speed
export const MOON_ROTATION = MOON_ORBIT_SPEED;

// Axial tilts (degrees)
export const EARTH_OBLIQUITY_DEG = 23.439281; // Earth's axial tilt (obliquity)
export const MOON_AXIS_TILT_DEG = 6.68; // Moon's axis tilt (approx.)
export const SUN_AXIS_TILT_DEG = 7.25; // Sun axis tilt relative to ecliptic (approx.)

// Sun rotation
export const SUN_ROTATION_PERIOD_DAYS = 25; // approximate equatorial rotation period
export const SUN_ROTATION_PERIOD_SECONDS =
  SUN_ROTATION_PERIOD_DAYS * SECONDS_PER_DAY;
export const SUN_ROTATION_SPEED = (2 * Math.PI) / SUN_ROTATION_PERIOD_SECONDS; // radians per second

export const msToDays = (ms: number) => ms / 1000 / SECONDS_PER_DAY;

export const perSecondToPerDay = (v: number) => v * SECONDS_PER_DAY;

let _lastPerf = performance.now();

export function nextDeltaDays(now = performance.now()) {
  const dtMs = Math.min(now - _lastPerf, 1000);
  _lastPerf = now;
  return msToDays(dtMs);
}

export function resetDeltaClock(now = performance.now()) {
  _lastPerf = now;
}
