import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { CONFIG, Region } from "./config";

import { MilkyWay } from "./MilkyWay";
import { LocalFluff } from "./LocalFluff";
import { SolarSystem } from "./SolarSystem";
import { LocalGroup } from "./LocalGroup";
import { Laniakea } from "./Laniakea";

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const viewport = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
viewport.setSize(window.innerWidth, window.innerHeight);

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
  [Region.SOLAR_SYSTEM]: new SolarSystem(),
  [Region.LOCAL_FLUFF]: new LocalFluff(),
  [Region.GALAXY]: new MilkyWay(),
  [Region.LOCAL_GROUP]: new LocalGroup(),
  [Region.LANIAKEA]: new Laniakea(),
};

let currentLevel = Region.SOLAR_SYSTEM;

Object.keys(levels).forEach((key) => {
  const levelKey = Number(key) as Region;
  const group = levels[levelKey].group;
  space.add(group);
  group.visible = levelKey === currentLevel;
});

const light = new THREE.AmbientLight(0xffffff, 5.0);
space.add(light);

function enterHyperSpace(targetLevel: Region) {
  const currentCfg = CONFIG[currentLevel];
  const targetCfg = CONFIG[targetLevel];

  const factor = currentCfg.Ratio! / targetCfg.Ratio!;

  ship.position.multiplyScalar(factor);
  controls.target.multiplyScalar(factor);

  levels[currentLevel].group.visible = false;
  levels[targetLevel].group.visible = true;

  currentLevel = targetLevel;

  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  const distance = ship.position.length();
  const cfg = CONFIG[currentLevel];

  // 1. Zooming OUT
  if (cfg.Dist && distance > cfg.Dist && currentLevel < Region.LANIAKEA) {
    enterHyperSpace(currentLevel + 1);
  }

  // 2. Zooming IN
  if (currentLevel > Region.SOLAR_SYSTEM) {
    const prevLevel = (currentLevel - 1) as Region;
    const prevCfg = CONFIG[prevLevel];

    const snapBackBoundary =
      (prevCfg.Dist || 0) * (prevCfg.Ratio! / cfg.Ratio!);

    if (distance < snapBackBoundary * 0.9) {
      enterHyperSpace(prevLevel);
    }
  }

  controls.update();
  viewport.render(space, ship);
}

window.addEventListener("resize", () => {
  ship.aspect = window.innerWidth / window.innerHeight;
  ship.updateProjectionMatrix();
  viewport.setSize(window.innerWidth, window.innerHeight);
});

animate();
