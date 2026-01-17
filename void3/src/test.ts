import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { SolarSystem, MilkyWay } from "./void/regions";
import { regionManager } from "./void/regions/RegionManager";

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

const solar = new SolarSystem();
space.add(solar);

const milkyWay = new MilkyWay();
space.add(milkyWay);



// Animation / render loop
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  try {
    regionManager.update(ship, delta);
  } catch (e) {}
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
