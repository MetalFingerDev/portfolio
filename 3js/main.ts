import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Compendium, Region } from "./config";

import { MilkyWay } from "./MilkyWay";
import { LocalFluff } from "./LocalFluff";
import { SolarSystem } from "./SolarSystem";
import { LocalGroup } from "./LocalGroup";
import { Laniakea } from "./Laniakea";

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const space = new THREE.Scene();
const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  999999999
);
ship.position.set(0, 2, 150);

const controls = new OrbitControls(ship, canvas);
controls.enableDamping = true;

const Regions = {
  [Region.SOLAR_SYSTEM]: new SolarSystem(Compendium[Region.SOLAR_SYSTEM]),
  [Region.LOCAL_FLUFF]: new LocalFluff(Compendium[Region.LOCAL_FLUFF]),
  [Region.GALAXY]: new MilkyWay(Compendium[Region.SOLAR_SYSTEM]),
  [Region.LOCAL_GROUP]: new LocalGroup(Compendium[Region.LOCAL_GROUP]),
  [Region.LANIAKEA]: new Laniakea(),
};

let currentRegion = Region.SOLAR_SYSTEM;

Object.keys(Regions).forEach((key) => {
  const levelKey = Number(key) as Region;
  const group = Regions[levelKey].group;
  space.add(group);
  group.visible = levelKey === currentRegion;
});

const light = new THREE.AmbientLight(0xffffff, 5.0);
space.add(light);

function performSnap(targetLevel: Region) {
  const currentCfg = Compendium[currentRegion];
  const targetCfg = Compendium[targetLevel];
  const factor = currentCfg.Ratio! / targetCfg.Ratio!;

  // Scale both the ship AND the orbit target
  ship.position.multiplyScalar(factor);
  controls.target.multiplyScalar(factor);

  // Toggle Visibility
  Regions[currentRegion].group.visible = false;
  Regions[targetLevel].group.visible = true;

  currentRegion = targetLevel;

  // Important: Update controls so the new target/position are registered
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  const distance = ship.position.length();
  const cfg = Compendium[currentRegion];

  // 1. Zooming OUT logic
  if (cfg.Dist && distance > cfg.Dist && currentRegion < Region.LANIAKEA) {
    performSnap(currentRegion + 1);
  }

  // 2. Zooming IN logic (The Fix)
  if (currentRegion > Region.SOLAR_SYSTEM) {
    const prevLevel = (currentRegion - 1) as Region;
    const prevCfg = Compendium[prevLevel];

    const snapBackBoundary =
      (prevCfg.Dist || 0) * (prevCfg.Ratio! / cfg.Ratio!);

    if (distance < snapBackBoundary * 0.9) {
      performSnap(prevLevel);
    }
  }

  controls.update();
  renderer.render(space, ship);
}

window.addEventListener("resize", () => {
  ship.aspect = window.innerWidth / window.innerHeight;
  ship.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
