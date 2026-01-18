import './style.css';
import * as THREE from 'three';

import Display from './rendering/Display';
import Ship from './controls/Ship';
import Space from './void/regions/Space';

import { regionManager } from './void/regions/RegionManager';
import { SolarSystem } from './void/regions/SolarSystem';
import { MilkyWay } from './void/galactic';
import { LocalFluff } from './void/stellar/LocalFluff';
// --- Setup ---

const canvas = document.querySelector('#app') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Canvas not found');
console.log('Canvas found:', canvas);

const display = new Display(canvas, {
  antialias: true,
  logarithmicDepthBuffer: true,
});
console.log('Display created:', display);
display.setSize(window.innerWidth, window.innerHeight);
console.log('Display size set:', window.innerWidth, window.innerHeight);

const ship = new Ship(canvas);
console.log('Ship initialized:', ship);

// Initial position: Inside the Solar System
ship.camera.position.set(0, 20, 8);
ship.controls.enableDamping = true;

// --- CRITICAL FIX: GALACTIC SCALE CAMERA ---
// Standard far plane is ~2000. We need 100 Billion to see the galaxy edge.
ship.camera.far = 100000000000;
// We keep 'near' small (0.1) so we can still see planets close up.
// This relies on 'logarithmicDepthBuffer: true' to prevent Z-fighting.
ship.camera.near = 0.1;
ship.camera.updateProjectionMatrix();

ship.handleResize(window.innerWidth, window.innerHeight);
console.log('Ship camera position:', ship.camera.position);
console.log('Ship controls damping enabled:', ship.controls.enableDamping);
console.log('Camera frustum updated: near=', ship.camera.near, 'far=', ship.camera.far);

const space = new Space({
  background: 0x2e004f,
});
console.log('Space created with background:', 0x2e004f);

const solarSystem = new SolarSystem();
space.add(solarSystem);
console.log('SolarSystem added to space:', solarSystem);
// Enable debug shells so entry/exit bounds are visible during development
solarSystem.toggleDebug(true);
console.log('SolarSystem debug shells enabled');

// 2. Add Milky Way (Massive, surrounding 0,0,0)
// Updated to use the new constructor (Radius = 20 Billion)
const milkyWay = new MilkyWay('Milky Way', 20000000000);

// Center the galaxy so the Solar System is inside it
milkyWay.position.set(0, 0, 0);

space.add(milkyWay);
console.log('MilkyWay added to space:', milkyWay);

// Enable debug wireframe (cylinder)
milkyWay.toggleDebug(false);
console.log('MilkyWay debug shells enabled');

// --- Local Fluff (nearby stellar cloud) ---
const localFluff = new LocalFluff(300); // default ~300 stars
localFluff.position.set(0, 0, 0); // centered around origin
space.add(localFluff);
console.log('LocalFluff added to space:', localFluff);
// Enable debug shells so the entry/exit bounds are visible during development
localFluff.toggleDebug(true);
console.log('LocalFluff debug shells enabled');

// Register regions so the camera knows how to handle them
regionManager.register(solarSystem);
regionManager.register(milkyWay);
regionManager.register(localFluff);

const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();

  // 1. Update the Solar System (moves the planets)
  solarSystem.update(delta);

  try {
    regionManager.update(ship.camera, delta);

    // --- If we have solarSystem.sun, force the controls to look at its updated position ---
    if (solarSystem.sun) {
      const position = new THREE.Vector3();
      solarSystem.sun.getWorldPosition(position);
      ship.controls.target.copy(position);
    }

    // 2. Update the Ship (applies the target change to the camera)
    ship.update();
  } catch (e) {
    console.error('Error in animate loop:', e);
  }

  display.render(space, ship.camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  console.log('Window resized to:', window.innerWidth, window.innerHeight);
  ship.handleResize(window.innerWidth, window.innerHeight);

  // Re-apply camera limits after resize reset
  ship.camera.far = 100000000000;
  ship.camera.updateProjectionMatrix();

  display.setSize(window.innerWidth, window.innerHeight);
  console.log('Handled resize for ship and display');
});
