import "./index.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type address, regions, compendium } from "./src/config";
import { RegionManager } from "./src/RegionManager";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  updateNavigationList,
  setupNavListClickHandler,
  updateRegionHud,
  startDebugOverlay,
} from "./src/console";
import { setQuality, getQuality } from "./src/quality";

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
const clock = new THREE.Clock();
const space = new THREE.Scene();
const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e15
);
renderer.toneMappingExposure = 0.5;

const controls = new OrbitControls(ship, canvas);
controls.enableDamping = true;

const light = new THREE.AmbientLight(0x404040);
space.add(light);

const regionManager = new RegionManager(space, ship, regions.SOLAR_SYSTEM);

let trackedObject: THREE.Object3D | null = null;

function hyperSpace(targetAddress: address) {
  trackedObject = null; // Break lock during jump

  regionManager.hyperSpace(targetAddress, controls);

  // Handle tracking for frontier
  const frontier = regionManager.getCurrentRegion();
  if (frontier) {
    const anchor = frontier.group.getObjectByName("Solar System Anchor");
    if (anchor) trackedObject = anchor;
  }

  controls.update();
  updateRegionHud(targetAddress, regionManager.getStage());
  startDebugOverlay(regionManager.getStage());
  setTimeout(
    () => updateNavigationList(regionManager.getStage(), targetAddress),
    100
  );
}

function updateLabelVisibility() {
  const currentAddress = regionManager.getCurrentAddress();
  const cfg = compendium[currentAddress];
  const cameraDistance = ship.position.distanceTo(controls.target);

  // Hide labels in high-ratio regions or when zoomed out
  const shouldHideLabels = cfg.Ratio > 100 || cameraDistance > 1000;

  regionManager.getStage().forEach((region) => {
    region.group.traverse((child) => {
      if (child instanceof CSS2DObject) {
        child.visible = !shouldHideLabels;
      }
    });
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const distance = ship.position.distanceTo(controls.target);
  const currentAddress = regionManager.getCurrentAddress();
  const cfg = compendium[currentAddress];

  if (trackedObject) {
    const worldPos = new THREE.Vector3();
    trackedObject.getWorldPosition(worldPos);

    controls.target.lerp(worldPos, 0.1);
  }

  if (cfg.Dist && distance > cfg.Dist && currentAddress < regions.LANIAKEA) {
    hyperSpace((currentAddress + 1) as address);
  }

  if (currentAddress > regions.SOLAR_SYSTEM) {
    const prevAddress = (currentAddress - 1) as address;
    const prevCfg = compendium[prevAddress];

    const boundary = (prevCfg.Dist || 0) * (prevCfg.Ratio / cfg.Ratio);

    if (distance < boundary * 0.9) {
      hyperSpace(prevAddress);
    }
  }

  regionManager.update(delta);

  // Update label visibility based on zoom level and region
  updateLabelVisibility();

  controls.update();

  renderer.render(space, ship);
  labelRenderer.render(space, ship);
}

window.addEventListener("resize", () => {
  ship.aspect = window.innerWidth / window.innerHeight;
  ship.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);

// Load initial regions
regionManager.loadRegion(regions.SOLAR_SYSTEM);
regionManager.loadRegion(regions.LOCAL_FLUFF);

const initialRegion = regionManager.getCurrentRegion();
if (initialRegion) {
  initialRegion.setDetail?.(true);
  initialRegion.setCamera?.(ship as THREE.PerspectiveCamera);
  initialRegion.group.userData.cameraAssigned = true;
  console.debug &&
    console.debug(`initial region camera assigned for ${regions.SOLAR_SYSTEM}`);
}

setupNavListClickHandler(
  regionManager.getStage(),
  () => regionManager.getCurrentAddress(),
  ship,
  controls,
  (obj) => {
    trackedObject = obj;
  }
);

updateRegionHud(regionManager.getCurrentAddress(), regionManager.getStage());
setTimeout(
  () =>
    updateNavigationList(
      regionManager.getStage(),
      regionManager.getCurrentAddress()
    ),
  500
);

// Keyboard shortcuts to toggle global quality: 1 = low, 2 = medium, 3 = high
window.addEventListener("keydown", (e) => {
  if (e.code === "Digit1") {
    setQuality("low");
    console.info("Quality set to", getQuality());
  } else if (e.code === "Digit2") {
    setQuality("medium");
    console.info("Quality set to", getQuality());
  } else if (e.code === "Digit3") {
    setQuality("high");
    console.info("Quality set to", getQuality());
  }
});

animate();
