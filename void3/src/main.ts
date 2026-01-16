import "./style.css";
import * as THREE from "three";

import Display from "./rendering/Display";
import Ship from "./controls/Ship";
import Space from "./scenes/Space";

import { LocalGroup } from "./regions/LocalGroup";
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

const localGroup = new LocalGroup();
space.add(localGroup);
const milkyWay = new MilkyWay();
space.add(milkyWay);

localGroup.setCamera(ship.camera);
localGroup.setDetail(true);

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    // 4. Update the regions
    localGroup.update(delta);

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
