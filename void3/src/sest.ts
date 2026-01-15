import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { SolarSystem } from "./SolarSystem";

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e15
);
ship.position.set(0, 20, 80);

const controls = new OrbitControls(ship, canvas);
controls.enableDamping = true;

const space = new THREE.Scene();
const light = new THREE.AmbientLight(0x404040, 5);
space.add(light);

// Create SolarSystem region and add it to the scene
const solar = new SolarSystem();
space.add(solar);
solar.setCamera(ship);
solar.setDetail(true);

// Animation / render loop
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    solar.update(delta);
  } catch (e) {
    /* defensive */
  }
  controls.update();
  renderer.render(space, ship);
  requestAnimationFrame(animate);
}
animate();

// Handle window resize
window.addEventListener("resize", () => {
  ship.aspect = window.innerWidth / window.innerHeight;
  ship.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
