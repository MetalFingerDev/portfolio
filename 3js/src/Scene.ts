import * as THREE from "three";
import { CloseSun } from "./Sun";
import Earth from "./Earth";
import { AllStars, LocalStars } from "./Stars";
import Moon from "./Moon";
import MilkyWay from "./MilkyWay";
import DistantSun from "./Sun";

export default class Scene extends THREE.Scene {
  constructor() {
    super();
  }
}

export function SolarSystem() {
  const space = new Scene();

  const sun = CloseSun(space);
  const earth = new Earth(space);
  const stars = LocalStars(space);
  const moon = new Moon(space, earth.earthGroup as THREE.Group);

  return { space, sun, earth, moon, stars };
}

export function createMilkyWayScene() {
  const space = new Scene();

  const galaxy = new MilkyWay(space);
  const stars = AllStars(space);
  const sun = new DistantSun(space);

  return { space, galaxy, stars, sun };
}
