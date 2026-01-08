import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type address, type region, regions, compendium } from "./config";
import { MilkyWay } from "./MilkyWay";
import { LocalFluff } from "./LocalFluff";
import { SolarSystem } from "./SolarSystem";
import { LocalGroup } from "./LocalGroup";
import { Laniakea } from "./Laniakea";

// ============================================================================
// SETUP
// ============================================================================

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const space = new THREE.Scene();
const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  999999999
);
ship.position.set(0, 2, 150);

const controls = new OrbitControls(ship, canvas);
controls.enableDamping = true;

const light = new THREE.AmbientLight(0xffffff, 5.0);
space.add(light);

// ============================================================================
// STAGE
// ============================================================================

const stage = new Map<address, region>();
let currentAddress: address = regions.SOLAR_SYSTEM;

const legend: Record<address, new (cfg: any) => region> = {
  [regions.SOLAR_SYSTEM]: SolarSystem,
  [regions.LOCAL_FLUFF]: LocalFluff,
  [regions.GALAXY]: MilkyWay,
  [regions.LOCAL_GROUP]: LocalGroup,
  [regions.LANIAKEA]: Laniakea,
};

// ============================================================================
// SPACE
// ============================================================================

function loadRegion(address: address) {
  if (stage.has(address)) return;

  const embark = legend[address];
  const creation = new embark(compendium[address]);

  stage.set(address, creation);
  space.add(creation.group);
  creation.group.visible = false;
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
}

// ============================================================================
// ANIMATION
// ============================================================================

function animate() {
  requestAnimationFrame(animate);

  const distance = ship.position.distanceTo(controls.target);
  const cfg = compendium[currentAddress];

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

  controls.update();
  renderer.render(space, ship);
}

// ============================================================================
// EVENT-LISTENERS
// ============================================================================

window.addEventListener("resize", () => {
  ship.aspect = window.innerWidth / window.innerHeight;
  ship.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// INITIALIZATION
// ============================================================================

loadRegion(regions.SOLAR_SYSTEM);
loadRegion(regions.LOCAL_FLUFF);

animate();
