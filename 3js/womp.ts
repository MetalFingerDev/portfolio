import "./style.css";
import ViewTargetsButton from "./src/viewTargetsBtn";
import { nextDeltaDays } from "./src/units";

import { SolarSystemScene } from "./src/Scene";
import { OrbitingSpaceShip } from "./src/Ship";
import Render from "./src/Render";

const { space, sun, earth, moon } = SolarSystemScene();

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas element with id "bg" not found');

const renderer = new Render(canvas);
const ship = new OrbitingSpaceShip(
  renderer.domElement,
  earth.earthGroup.position
);
const controls = ship.controls;
const animateCameraTo = (
  targetPos: any,
  lookAt: any,
  _duration?: number,
  onComplete?: () => void
) => ship.move(targetPos, lookAt, onComplete);

moon.orbitGroup.rotation.y = Math.PI / 4;

function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  const delta = nextDeltaDays(now);

  earth.update(delta);
  sun.update(delta);
  moon.update(delta);

  controls.update();
  renderer.render(space, ship.camera);
}

const viewSunBtn = document.createElement("button");
viewSunBtn.textContent = "View Sun";
viewSunBtn.className = "view-sun-btn";
document.body.appendChild(viewSunBtn);

ViewTargetsButton(viewSunBtn, controls, earth, sun, animateCameraTo, moon);

// render loop
animate();
