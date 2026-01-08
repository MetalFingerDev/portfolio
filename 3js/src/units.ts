import * as THREE from "three";
// Base Unit: 1 Scene Unit = 1 Earth Radius
export const EARTH_RADIUS_METERS = 6371000;
export const metersToScene = (meters: number) => meters / EARTH_RADIUS_METERS;

// Physical Radii in Scene Units
export const EARTH_RADIUS = 1;
export const SUN_RADIUS = 109.2; // Sun is ~109x Earth
export const MOON_RADIUS = metersToScene(1737400); // ~0.272 Earth Radii

// Distances in Scene Units
export const AU_METERS = 149597870700;
export const AU_SCENE = 23481; // ~23,481.3 Scene Units
export const auToScene = (au: number) => au * AU_SCENE;

export const LY_AU = 63241.077;
export const LY_SCENE = LY_AU * AU_SCENE; // ~1.48 Billion Scene Units
export const lyToScene = (ly: number) => ly * LY_SCENE;

// Rotation & Physics
export const EARTH_OBLIQUITY_RAD = THREE.MathUtils.degToRad(23.439);
export const EARTH_ROTATION_SPEED = 0.01; // Visual speed multiplier

export const EARTH_OBLIQUITY_DEG = 23.439;
export const MOON_AXIS_TILT_DEG = 6.68;
export const SUN_AXIS_TILT_DEG = 7.25;

export const SECONDS_PER_DAY = 1;
export const perSecondToPerDay = (v: number) => v * SECONDS_PER_DAY;
