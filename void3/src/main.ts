import "./style.css";
import * as THREE from "three";

import Display from "./rendering/Display";
import Ship from "./controls/Ship";
import Space from "./scenes/Space";

import { regionManager } from "./void/regions/RegionManager";
import { LocalGroup } from "./void/regions/LocalGroup";
import { MilkyWay } from "./void/regions/MilkyWay";
import { SolarSystem } from "./void/regions/SolarSystem";
// --- Setup ---

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");

const display = new Display(canvas, {
  antialias: true,
  logarithmicDepthBuffer: true,
});
display.setSize(window.innerWidth, window.innerHeight);

const ship = new Ship(canvas);
ship.camera.position.set(0, 20, 8);
ship.controls.enableDamping = true;

const space = new Space({
  background: 0x2e004f,
});

const solarSystem = new SolarSystem();
space.add(solarSystem);
const localGroup = new LocalGroup();
space.add(localGroup);
const milkyWay = new MilkyWay();
space.add(milkyWay);

// Enable LOD logging for development (set to false to silence)
regionManager.log = true;

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    regionManager.update(ship.camera, delta);

    ship.controls.update();
  } catch (e) {
    console.error(e);
  }

  display.render(space, ship.camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  ship.camera.aspect = window.innerWidth / window.innerHeight;
  ship.camera.updateProjectionMatrix();
  display.renderer.setSize(window.innerWidth, window.innerHeight);
});
