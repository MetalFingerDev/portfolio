import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sun from "./src/Sun";
import Earth from "./src/Earth";
import ViewTargetsButton from "./src/viewTargetsBtn";
import Stars from "./src/Stars";
import Moon from "./src/Moon";
import { nextDeltaDays } from "./src/units";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000000
);
camera.position.set(0, 0, 3);

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas element with id "bg" not found');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
(renderer as any).physicallyCorrectLights = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

// Feature flags
const MOON_ROTATION_ENABLED = false; // set to true to enable moon rotation

// handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const sun = new Sun(scene);
const earth = new Earth(scene);
// add star field (debug shell on so you can see it immediately)
new Stars(scene, 4000);
// add the moon as a child of the Earth group so it orbits the Earth
const moon = new Moon(scene, earth.earthGroup as THREE.Group);
controls.target.copy(earth.earthGroup.position);
controls.update();

// simple animate loop (delta expressed in days: 1 = 1 astronomical day)
function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  // get delta in 'days' from units helper (clamps internally)
  const delta = nextDeltaDays(now);

  earth.update(delta);
  if (MOON_ROTATION_ENABLED) moon.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

// Create the view-sun button (styles live in `style.css`)
const viewSunBtn = document.createElement("button");
viewSunBtn.textContent = "View Sun";
viewSunBtn.className = "view-sun-btn";
document.body.appendChild(viewSunBtn);

// Minimal camera move function (immediate snap)
const animateCameraTo = (
  targetPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  _duration: number = 0,
  onComplete?: () => void
) => {
  camera.position.copy(targetPos);
  controls.target.copy(lookAt);
  controls.update();
  if (onComplete) onComplete();
};

// Wire up the view button (cycles Earth → Sun → Moon → Stars)
ViewTargetsButton(viewSunBtn, controls, earth, sun, animateCameraTo, moon);

// start render loop
animate();
