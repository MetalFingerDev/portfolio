import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import Sun from "./scene/Sun";
import Earth from "./scene/Earth";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const scene = new THREE.Scene();
const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas element with id "bg" not found');

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);
camera.position.setZ(2.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,
  0.6,
  0.85
);
bloomPass.threshold = 0.85;
bloomPass.strength = 1.2;
bloomPass.radius = 0.6;
composer.addPass(bloomPass);

// CSS2D renderer for labels (keeps labels at screen-size regardless of distance)
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.zIndex = "10";
document.body.appendChild(labelRenderer.domElement);

// Camera position overlay
const camInfo = document.createElement("div");
camInfo.className = "camera-info";
Object.assign(camInfo.style, {
  position: "absolute",
  left: "12px",
  bottom: "12px",
  padding: "6px 8px",
  background: "rgba(0,0,0,0.6)",
  color: "white",
  fontFamily: "monospace",
  fontSize: "12px",
  borderRadius: "4px",
  zIndex: "1000",
});
document.body.appendChild(camInfo);

const earth = new Earth(scene);
const sun = new Sun(scene);
// inform earth about sun position so city lights shader can determine night side
earth.setSunPosition(sun.position);

// Earth label (size-independent, screen-space)
const earthLabelDiv = document.createElement("div");
earthLabelDiv.className = "label";
earthLabelDiv.textContent = "Earth";
Object.assign(earthLabelDiv.style, {
  color: "white",
  background: "transparent",
  fontSize: "14px",
  padding: "2px 6px",
  borderRadius: "4px",
  textShadow: "0 0 6px rgba(0,0,0,0.9)",
  pointerEvents: "none",
});
const earthLabel = new CSS2DObject(earthLabelDiv);
earthLabel.position.set(0, Earth.RADIUS + 0.3, 0);
earth.mesh.add(earthLabel);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.zoomSpeed = 1.2;
controls.panSpeed = 1.0;
(controls as any).screenSpacePanning = true;
controls.minDistance = 1;
controls.maxDistance = 100000;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  earth.update(delta);
  sun.update();
  controls.update();

  // Update camera info overlay (screen-space readable)
  camInfo.textContent = `Cam: ${camera.position.x.toFixed(
    2
  )}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`;

  composer.render();
  // Render label overlays on top
  labelRenderer.render(scene, camera);
}
animate();

const viewSunBtn = document.createElement("button");
viewSunBtn.textContent = "View Sun";
Object.assign(viewSunBtn.style, {
  position: "absolute",
  right: "12px",
  top: "12px",
  padding: "8px 10px",
  background: "rgba(0,0,0,0.6)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "4px",
  cursor: "pointer",
  zIndex: "1000",
});
document.body.appendChild(viewSunBtn);

function animateCameraTo(
  targetPos: THREE.Vector3,
  lookAt: THREE.Vector3,
  _duration = 700,
  onComplete?: () => void
) {
  camera.position.copy(targetPos);
  controls.target.copy(lookAt);
  controls.update();
  onComplete?.();
}

let viewingSun = false;
viewSunBtn.addEventListener("click", () => {
  if (!viewingSun) {
    const sunPos = sun.position.clone();
    const camPos = sunPos
      .clone()
      .add(new THREE.Vector3(Sun.RADIUS * 2.5, 0, 0));
    (controls as any).enablePan = false;
    (controls as any).screenSpacePanning = false;
    (controls as any).minPolarAngle = 0.05;
    (controls as any).maxPolarAngle = Math.PI - 0.05;
    controls.minDistance = Math.max(0.1, Sun.RADIUS * 1.05);
    controls.maxDistance = Math.max(controls.minDistance + 1, Sun.RADIUS * 300);
    animateCameraTo(camPos, sunPos, 900, () => {
      controls.target.copy(sunPos);
      controls.update();
    });
    viewSunBtn.textContent = "Back to Earth";
    viewingSun = true;
  } else {
    const earthPos = earth.mesh.position.clone();
    const camPos = earthPos
      .clone()
      .add(new THREE.Vector3(Earth.RADIUS * 2.5, 0, 0));
    (controls as any).enablePan = false;
    (controls as any).screenSpacePanning = false;
    (controls as any).minPolarAngle = 0.05;
    (controls as any).maxPolarAngle = Math.PI - 0.05;
    controls.minDistance = Math.max(0.1, Earth.RADIUS * 1.05);
    controls.maxDistance = Math.max(
      controls.minDistance + 1,
      Earth.RADIUS * 300
    );
    animateCameraTo(camPos, earthPos, 800, () => {
      controls.target.copy(earthPos);
      controls.update();
    });
    viewSunBtn.textContent = "View Sun";
    viewingSun = false;
  }
});
