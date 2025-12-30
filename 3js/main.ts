import "./style.css";
import ViewTargetsButton from "./src/viewTargetsBtn";
import { nextDeltaDays } from "./src/units";

import { SolarSystem } from "./src/Scene";
import { OrbitingSpaceShip } from "./src/Ship";
import Render from "./src/Render";


const { space, sun, earth, moon } = SolarSystem();

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas element with id "bg" not found');

const renderer = new Render(canvas);
const { controls, move } = new OrbitingSpaceShip(
  renderer.domElement,
  earth.earthGroup.position
);

moon.orbitGroup.rotation.y = Math.PI / 4;

function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  const delta = nextDeltaDays(now);

  earth.update(delta);
  sun.update(delta);
  moon.update(delta);

  controls.update();
  renderer.render(space, Or);
}

const viewSunBtn = document.createElement("button");
viewSunBtn.textContent = "View Sun";
viewSunBtn.className = "view-sun-btn";
document.body.appendChild(viewSunBtn);

ViewTargetsButton(viewSunBtn, controls, earth, sun, move, moon);

// render loop
animate();
