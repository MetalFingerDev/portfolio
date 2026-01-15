import "./style.css";
import * as THREE from "three";

import Display from "./rendering/Display";
import Ship from "./controls/Ship";
import Space from "./scenes/Space";

import { SolarSystem } from "./regions/SolarSystem";
import { MilkyWay } from "./regions/MilkyWay";
// --- Setup ---

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");

const display = new Display(canvas, {
  antialias: true,
  logarithmicDepthBuffer: true,
});
display.setSize(window.innerWidth, window.innerHeight);

const ship = new Ship(canvas);
ship.camera.position.set(0, 20, 80);
ship.controls.enableDamping = true;

const space = new Space({
  background: 0x2e004f,
});

// --- App Logic ---
const solar = new SolarSystem();
space.add(solar);
solar.setCamera(ship.camera);
solar.setDetail(true);

const target = new THREE.Vector3();
if (solar.earth) {
  solar.earth.getWorldPosition(target);
  ship.controls.target.copy(target);
  // Position camera offset from Earth so it's not inside the planet
  ship.camera.position.copy(target).add(new THREE.Vector3(0, 20, 80));
  ship.controls.update();
}

const milkyWay = new MilkyWay();
space.add(milkyWay);
milkyWay.setCamera(ship.camera);
milkyWay.setDetail(true);

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    milkyWay.update(delta);
    solar.update(delta);
  } catch (e) {
    /* defensive */
  }
  ship.controls.update();
  display.render(space, ship.camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  ship.camera.aspect = window.innerWidth / window.innerHeight;
  ship.camera.updateProjectionMatrix();
  display.renderer.setSize(window.innerWidth, window.innerHeight);
});
