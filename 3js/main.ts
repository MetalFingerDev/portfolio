import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import Sun from "./src/Sun";
import Earth from "./src/Earth";
import setupViewSunButton from "./src/viewSunBtn";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000000
);

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas element with id "bg" not found');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// tone mapping and bloom to make very bright emissive surfaces visible
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);
// make sure camera far plane comfortably includes the Sun (use 2× distance for margin)
import { SUN_DISTANCE_UNITS, DISTANCE_SCALE } from "./src/Sun";
camera.far = Math.max(
  camera.far,
  (SUN_DISTANCE_UNITS / Math.max(1, DISTANCE_SCALE)) * 2
);
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();

const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.zoomSpeed = 1.2;
controls.minDistance = 1;
controls.maxDistance = 100000;

// simple animate loop
function animate() {
  requestAnimationFrame(animate);
  sun.update();
  earth.update();
  controls.update();
  composer.render();
}

// handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const sun = new Sun(scene);
const earth = new Earth(scene);
controls.target.copy(earth.earthGroup.position);
controls.update();
camera.position.set(0, 0, 3);
camera.lookAt(earth.earthGroup.position);

// create and hook up the view button
const viewSunBtn = document.createElement("button");
viewSunBtn.textContent = "View Sun";
document.body.appendChild(viewSunBtn);

function animateCameraTo(
  targetPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  duration = 700,
  onComplete?: () => void
) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const start = performance.now();
  function step(now: number) {
    const t = Math.min(1, (now - start) / duration);
    camera.position.lerpVectors(startPos, targetPos, t);
    controls.target.lerpVectors(startTarget, lookAt, t);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
    else onComplete?.();
  }
  requestAnimationFrame(step);
}

setupViewSunButton(viewSunBtn, controls, earth, sun, animateCameraTo);

animate();
