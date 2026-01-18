import "./style.css";
import * as THREE from "three";

import Display from "./rendering/Display";
import Ship from "./controls/Ship";
import Space from "./void/regions/Space";

import { regionManager } from "./void/regions/RegionManager";
import { SolarSystem } from "./void/regions/SolarSystem";
// --- Setup ---

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");
console.log("Canvas found:", canvas);

const display = new Display(canvas, {
  antialias: true,
  logarithmicDepthBuffer: true,
});
console.log("Display created:", display);
display.setSize(window.innerWidth, window.innerHeight);
console.log("Display size set:", window.innerWidth, window.innerHeight);

const ship = new Ship(canvas);
console.log("Ship initialized:", ship);
ship.camera.position.set(0, 20, 8);
ship.controls.enableDamping = true;
console.log("Ship camera position:", ship.camera.position);
console.log("Ship controls damping enabled:", ship.controls.enableDamping);
ship.handleResize(window.innerWidth, window.innerHeight);

const space = new Space({
  background: 0x2e004f,
});
console.log("Space created with background:", 0x2e004f);

const solarSystem = new SolarSystem();
space.add(solarSystem);
console.log("SolarSystem added to space:", solarSystem);

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();

  // 1. Update the Solar System (moves the planets)
  solarSystem.update(delta);

  try {
    regionManager.update(ship.camera, delta);

    // --- If we have solarSystem.sun, force the controls to look at its updated position ---
    if (solarSystem.sun) {
      const position = new THREE.Vector3();
      solarSystem.sun.getWorldPosition(position);
      ship.controls.target.copy(position);
    }

    // 2. Update the Ship (applies the target change to the camera)
    ship.update();
  } catch (e) {
    console.error("Error in animate loop:", e);
  }

  display.render(space, ship.camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  console.log("Window resized to:", window.innerWidth, window.innerHeight);
  ship.handleResize(window.innerWidth, window.innerHeight);
  display.setSize(window.innerWidth, window.innerHeight);
  console.log("Handled resize for ship and display");
});
