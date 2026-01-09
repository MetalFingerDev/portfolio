import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type address, type region, regions, compendium } from "./src/config";
import { lyToScene } from "./src/conversions";
import { MilkyWay } from "./src/MilkyWay";
import { LocalFluff } from "./src/LocalFluff";
import { SolarSystem } from "./src/SolarSystem";
import { LocalGroup } from "./src/LocalGroup";
import { Laniakea } from "./src/Laniakea";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  updateNavigationList,
  setupNavListClickHandler,
  updateRegionHud,
} from "./src/console";

const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

const stage = new Map<address, region>();
let currentAddress: address = regions.SOLAR_SYSTEM;

const legend: Record<address, new (cfg: any) => region> = {
  [regions.SOLAR_SYSTEM]: SolarSystem,
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
  creation.group.visible = false;

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

  const current = compendium[currentAddress];
  const target = compendium[targetAddress];
  const factor = current.Ratio / target.Ratio;

  ship.position.multiplyScalar(factor);
  controls.target.multiplyScalar(factor);

  const frontier = stage.get(targetAddress);
  if (frontier) {
    frontier.group.visible = true;
  }

  const interior = stage.get(currentAddress);
  if (interior) {
    interior.group.visible = false;
  }

  currentAddress = targetAddress;

  const actors = [currentAddress, currentAddress - 1, currentAddress + 1];
  stage.forEach((_, actor) => {
    if (!actors.includes(actor)) unloadRegion(actor);
  });

  actors.forEach((actor) => {
    if (actor >= regions.SOLAR_SYSTEM && actor <= regions.LANIAKEA) {
      loadRegion(actor as address);
    }
  });

  controls.update();

  updateRegionHud(currentAddress);
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
  initialRegion.group.visible = true;
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

updateRegionHud(currentAddress);
setTimeout(() => updateNavigationList(stage, currentAddress), 500);

animate();
