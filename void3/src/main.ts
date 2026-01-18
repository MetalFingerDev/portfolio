import "./style.css";
import * as THREE from "three";

import Display from "./rendering/Display";
import Ship from "./controls/Ship";
import Space from "./scenes/Space";

import { regionManager } from "./void/regions/RegionManager";
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
ship.handleResize(window.innerWidth, window.innerHeight);

const space = new Space({
  background: 0x2e004f,
});

const solarSystem = new SolarSystem();
space.add(solarSystem);

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    regionManager.update(ship.camera, delta);

    ship.update();
  } catch (e) {
    console.error(e);
  }

  display.render(space, ship.camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  ship.handleResize(window.innerWidth, window.innerHeight);
  display.setSize(window.innerWidth, window.innerHeight);
});
