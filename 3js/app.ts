import "./index.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type address, type IRegion, regions, compendium } from "./src/config";
import { lyToScene } from "./src/conversions";
import { MilkyWay } from "./src/MilkyWay";
import { LocalFluff } from "./src/LocalFluff";
import { SolarSystem } from "./src/SolarSystem";
import InterstellarSpace from "./src/InterstellarSpace";
import { LocalGroup } from "./src/LocalGroup";
import { Laniakea } from "./src/Laniakea";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
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

const stage = new Map<address, IRegion>();
let currentAddress: address = regions.SOLAR_SYSTEM;

const legend: Record<address, new (cfg: any) => IRegion> = {
  [regions.SOLAR_SYSTEM]: SolarSystem,
  [regions.INTERSTELLAR_SPACE]: InterstellarSpace,
  [regions.LOCAL_FLUFF]: LocalFluff,
  [regions.GALAXY]: MilkyWay,
  [regions.LOCAL_GROUP]: LocalGroup,
  [regions.LANIAKEA]: Laniakea,
};

let trackedObject: THREE.Object3D | null = null;

function loadRegion(address: address) {
  if (stage.has(address)) return;

  const cfg = compendium[address];
  if (!cfg) return;

  const embark = legend[address];
  const creation = new embark(compendium[address]);

  stage.set(address, creation);
  space.add(creation.group);
  // Set detail level based on whether this is the ship's current region
  (creation as any).setDetail?.(address === currentAddress);

  // If the region exposes a setCamera method, register the ship camera (used for LOD updates)
  (creation as any).setCamera?.(ship as THREE.PerspectiveCamera);
  creation.group.userData.cameraAssigned = true;
  // Debug: confirm camera assigned for newly loaded region
  console.debug && console.debug(`setCamera called for region ${address}`);

  const offset = cfg.Offset || 0; // Retrieve the entry point offset

  // Only set camera position if this is the current active region
  if (address === currentAddress) {
    if (address === regions.GALAXY) {
      // Sun is ~26,000 LY from galactic center
      const sunDistFromCenter = lyToScene(26000) / cfg.Ratio;
      // Position ship at the Sun's galactic location, looking at the galactic center
      ship.position.set(sunDistFromCenter, 500, 500);
      controls.target.set(0, 0, 0); // Look at galactic center
      controls.update();
    }
    if (address === regions.LOCAL_FLUFF) {
      const entryDist = lyToScene(50) / cfg.Ratio;
      // Position ship relative to the fluff's offset
      ship.position.set(offset, 0, entryDist);
      controls.target.set(offset, 0, 0);
      controls.update();
    }
    if (address === regions.SOLAR_SYSTEM) {
      // Position ship relative to the solar system's offset
      ship.position.set(offset, 2, 150);
      controls.target.set(offset, 0, 0);
      controls.update();
    }
  }
}

function unloadRegion(address: address) {
  const departure = stage.get(address);

  if (departure) {
    space.remove(departure.group);
    departure.destroy();
    stage.delete(address);
  }
}

function hyperSpace(targetAddress: address) {
  trackedObject = null; // Break lock during jump

  const previousAddress = currentAddress;
  const prevCfg = compendium[previousAddress];
  const targetCfg = compendium[targetAddress];

  // Ensure the target region is loaded and ready so we can set its detail/camera
  loadRegion(targetAddress);

  // 1. Swap detail levels so only the target is high-detail
  (stage.get(previousAddress) as any)?.setDetail?.(false);
  (stage.get(targetAddress) as any)?.setDetail?.(true);

  // 2. Ensure both regions have the ship camera (useful for LOD computation after swap)
  (stage.get(previousAddress) as any)?.setCamera?.(
    ship as THREE.PerspectiveCamera
  );
  (stage.get(previousAddress) as any)?.group.userData &&
    ((stage.get(previousAddress) as any).group.userData.cameraAssigned = true);
  (stage.get(targetAddress) as any)?.setCamera?.(
    ship as THREE.PerspectiveCamera
  );
  (stage.get(targetAddress) as any)?.group.userData &&
    ((stage.get(targetAddress) as any).group.userData.cameraAssigned = true);

  // Debug: confirm camera reassignment during hyperSpace
  console.debug &&
    console.debug(
      `setCamera reassigned to prev ${previousAddress}, target ${targetAddress}`
    );

  // 3. Calculate and apply camera transform from previous -> target
  const currentOffset = prevCfg.Offset || 0;

  const relativePos = ship.position
    .clone()
    .setX(ship.position.x - currentOffset);
  const relativeTarget = controls.target
    .clone()
    .setX(controls.target.x - currentOffset);

  const factor = prevCfg.Ratio / targetCfg.Ratio;
  relativePos.multiplyScalar(factor);
  relativeTarget.multiplyScalar(factor);

  const scaledTargetOffset = (targetCfg.Offset || 0) / targetCfg.Ratio;

  ship.position.x -= currentOffset;
  ship.position.copy(relativePos).setX(relativePos.x + scaledTargetOffset);
  ship.position.x += scaledTargetOffset;

  controls.target.x -= currentOffset;
  controls.target
    .copy(relativeTarget)
    .setX(relativeTarget.x + scaledTargetOffset);
  controls.target.x += scaledTargetOffset;

  // 4. Visibility and tracking for frontier
  const frontier = stage.get(targetAddress);
  if (frontier) {
    // Rely on setDetail to control visible internals; ensure camera is registered so any LOD or helpers can use it
    (frontier as any).setCamera?.(ship as THREE.PerspectiveCamera);
    frontier.group.userData.cameraAssigned = true;
    console.debug &&
      console.debug(`setCamera called for frontier ${targetAddress}`);

    const anchor = frontier.group.getObjectByName("Solar System Anchor");
    if (anchor) trackedObject = anchor;
  }

  // After swapping detail, update currentAddress
  currentAddress = targetAddress;

  // 5. Keep only current and neighbor regions loaded
  const neighbors = [currentAddress, currentAddress - 1, currentAddress + 1];
  stage.forEach((_, addr) => {
    if (!neighbors.includes(addr)) unloadRegion(addr);
  });

  neighbors.forEach((addr) => {
    if (addr >= regions.SOLAR_SYSTEM && addr <= regions.LANIAKEA) {
      loadRegion(addr as address);
    }
  });

  controls.update();
  updateRegionHud(currentAddress, stage);
  // Start the debug overlay to show regions, camera, and detail state
  startDebugOverlay(stage);
  setTimeout(() => updateNavigationList(stage, currentAddress), 100);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const distance = ship.position.distanceTo(controls.target);
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

  stage.forEach((region) => {
    if (region.update) {
      region.update(delta);
    }
  });

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

loadRegion(regions.SOLAR_SYSTEM);
loadRegion(regions.LOCAL_FLUFF);

const initialRegion = stage.get(currentAddress);
if (initialRegion) {
  initialRegion.setDetail?.(true);
  initialRegion.setCamera?.(ship as THREE.PerspectiveCamera);
  initialRegion.group.userData.cameraAssigned = true;
  console.debug &&
    console.debug(`initial region camera assigned for ${currentAddress}`);
}

setupNavListClickHandler(
  stage,
  () => currentAddress,
  ship,
  controls,
  (obj) => {
    trackedObject = obj;
  }
);

updateRegionHud(currentAddress, stage);
setTimeout(() => updateNavigationList(stage, currentAddress), 500);

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
