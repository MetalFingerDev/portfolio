import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sun from "./src/Sun";
import Earth from "./src/Earth";
import ViewTargetsButton from "./src/viewTargetsBtn";
import Stars from "./src/Stars";
import Moon from "./src/Moon";
import { nextDeltaDays, SUN_DISTANCE_SCENE } from "./src/units";

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
const stars = new Stars(scene);
const moon = new Moon(scene, earth.earthGroup as THREE.Group);

moon.orbitGroup.rotation.y = Math.PI / 4;

controls.target.copy(earth.earthGroup.position);
controls.update();
console.log(stars);
// Earth orbit ring centered on the Sun
{
  const segments = 256;
  const positions = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    positions[i * 3] = Math.sin(t) * SUN_DISTANCE_SCENE;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.cos(t) * SUN_DISTANCE_SCENE;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.18,
    depthTest: false,
  });
  const earthOrbit = new THREE.LineLoop(geom, mat);
  // position the orbit so it's centered on the Sun's world position
  earthOrbit.position.copy(sun.sunMesh.position);
  scene.add(earthOrbit);
}

// triangle connecting Sun, Earth and Moon centers (updates per-frame)
const triangleGeom = new THREE.BufferGeometry();
const triPositions = new Float32Array(9);
triangleGeom.setAttribute(
  "position",
  new THREE.BufferAttribute(triPositions, 3)
);
const triMat = new THREE.LineBasicMaterial({
  color: 0xffaa66,
  transparent: true,
  opacity: 0.6,
  depthTest: false,
});
const triangle = new THREE.LineLoop(triangleGeom, triMat);
scene.add(triangle);

// simple animate loop (delta expressed in days: 1 = 1 astronomical day)
function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  // get delta in 'days' from units helper (clamps internally)
  const delta = nextDeltaDays(now);

  earth.update(delta);
  sun.update(delta);
  if (MOON_ROTATION_ENABLED) moon.update(delta);

  // update triangle (Sun ↔ Earth ↔ Moon)
  {
    const posAttr = triangle.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const sunPos = new THREE.Vector3();
    sun.sunMesh.getWorldPosition(sunPos);
    const earthPos = new THREE.Vector3();
    earth.earthGroup.getWorldPosition(earthPos);
    const moonPos = new THREE.Vector3();
    moon.moonMesh.getWorldPosition(moonPos);
    arr[0] = sunPos.x;
    arr[1] = sunPos.y;
    arr[2] = sunPos.z;
    arr[3] = earthPos.x;
    arr[4] = earthPos.y;
    arr[5] = earthPos.z;
    arr[6] = moonPos.x;
    arr[7] = moonPos.y;
    arr[8] = moonPos.z;
    posAttr.needsUpdate = true;
  }

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
