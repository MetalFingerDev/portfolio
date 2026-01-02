import "./style.css";
import * as THREE from "three";
import { nextDeltaDays } from "./src/units";

import { MilkyWayScene } from "./src/Scene";
import { OrbitingSpaceShip } from "./src/Ship";
import Render from "./src/Render";

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas element with id "bg" not found');

const renderer = new Render(canvas);
const ship = new OrbitingSpaceShip(renderer.domElement);

const animateCameraTo = (
  targetPos: any,
  lookAt: any,
  _duration?: number,
  onComplete?: () => void
) => ship.move(targetPos, lookAt, onComplete);

let space: THREE.Scene | undefined;
let galaxy: any;
let sun: any;

async function init() {
  const sceneObjs = MilkyWayScene();
  space = sceneObjs.space;
  galaxy = sceneObjs.galaxy;
  sun = sceneObjs.sun;

  // center controls on the scene root
  ship.controls.target.set(0, 0, 0);
  ship.controls.update();

  // wait until the model finishes loading (resolves even on load failure)
  try {
    if (galaxy && galaxy.loaded) await galaxy.loaded;
    // you could adjust camera here if needed
  } catch (e) {
    console.warn("MilkyWay load promise rejected", e);
  }

  // start the render loop once assets are ready
  animate();
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  const delta = nextDeltaDays(now);

  if (galaxy && typeof galaxy.update === "function") galaxy.update(delta);
  if (sun && typeof sun.update === "function") sun.update(delta);

  ship.controls.update();
  if (space) renderer.render(space, ship.camera);
}

init();
