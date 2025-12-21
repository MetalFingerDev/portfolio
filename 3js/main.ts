import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sun from "./src/Sun";
import Earth from "./src/Earth";
import setupViewSunButton from "./src/viewSunBtn";
import Stars from "./src/Stars";

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

renderer.render(scene, camera);

// handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const sun = new Sun(scene);
const earth = new Earth(scene);
// add star field (debug shell on so you can see it immediately)
const stars = new Stars(scene, 4000);
console.log(stars);
controls.target.copy(earth.earthGroup.position);
controls.update();

// simple animate loop
function animate() {
  requestAnimationFrame(animate);

  earth.update();
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

// Wire up the view button
setupViewSunButton(viewSunBtn, controls, earth, sun, animateCameraTo);

// start render loop
animate();
