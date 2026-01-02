import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { WORLD_CONFIG, SceneLevel } from "./newnits";

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

const levels = {
  [SceneLevel.SOLAR_SYSTEM]: new SolarSystem(),
  [SceneLevel.LOCAL_FLUFF]: new LocalFluff(), // Inserted here
  [SceneLevel.GALAXY]: new MilkyWay(),
  [SceneLevel.LOCAL_GROUP]: new LocalGroup(),
  [SceneLevel.LANIAKEA]: new Laniakea(),
};

let currentLevel = SceneLevel.SOLAR_SYSTEM;

Object.keys(levels).forEach((key) => {
  const levelKey = Number(key) as SceneLevel;
  const group = levels[levelKey].group;
  space.add(group);
  group.visible = levelKey === currentLevel;
});

const light = new THREE.AmbientLight(0xffffff, 5.0);
space.add(light);

function performSnap(targetLevel: SceneLevel) {
  const currentCfg = WORLD_CONFIG[currentLevel];
  const targetCfg = WORLD_CONFIG[targetLevel];

  // Calculate the scaling factor between the two levels
  // This ensures your "Real Distance" stays the same after the jump
  const factor = currentCfg.Ratio! / targetCfg.Ratio!;

  // Scale both the ship AND the orbit target
  ship.position.multiplyScalar(factor);
  controls.target.multiplyScalar(factor);

  // Toggle Visibility
  levels[currentLevel].group.visible = false;
  levels[targetLevel].group.visible = true;

  currentLevel = targetLevel;

  // Important: Update controls so the new target/position are registered
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  const distance = ship.position.length();
  const cfg = WORLD_CONFIG[currentLevel];

  // 1. Zooming OUT logic
  if (cfg.Dist && distance > cfg.Dist && currentLevel < SceneLevel.LANIAKEA) {
    performSnap(currentLevel + 1);
  }

  // 2. Zooming IN logic (The Fix)
  if (currentLevel > SceneLevel.SOLAR_SYSTEM) {
    const prevLevel = (currentLevel - 1) as SceneLevel;
    const prevCfg = WORLD_CONFIG[prevLevel];

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
