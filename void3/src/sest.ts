import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { SolarSystem } from "./regions/SolarSystem";
import { MilkyWay } from "./regions/MilkyWay";

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

// 1. Create SolarSystem (Independent)
const solar = new SolarSystem();
space.add(solar);
solar.setCamera(ship);
solar.setDetail(true);

// Set camera target to Earth (follow Earth each frame)
const earthTarget = new THREE.Vector3();
if (solar.earth) {
  solar.earth.getWorldPosition(earthTarget);
  controls.target.copy(earthTarget);
  // Position camera offset from Earth so it's not inside the planet
  ship.position.copy(earthTarget).add(new THREE.Vector3(0, 20, 80));
  controls.update();
}

// 2. Create Milky Way (Independent)
// No longer needs to know about the solar system's size or shells
const milkyWay = new MilkyWay();
space.add(milkyWay);
milkyWay.setCamera(ship);
milkyWay.setDetail(true);

// Animation / render loop
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    milkyWay.update(delta);
    solar.update(delta);
  } catch (e) {
    /* defensive */
  }
  controls.update();
  renderer.render(space, ship);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  ship.aspect = window.innerWidth / window.innerHeight;
  ship.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
