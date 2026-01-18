import './style.css';
import * as THREE from 'three';

// Rendering & UI
import Display from './rendering/Display';
import Overlay from './rendering/Overlay';

// Logic & Controls
import Ship from './controls/Ship';
import { regionManager } from './void/regions/RegionManager';
import { KBC } from './void/cosmic_web/KBC';
import Space from './void/regions/Space';

const CONFIG = {
  camera: {
    fov: 60,
    startPos: new THREE.Vector3(0, 100000, 3000000),
    smoothing: true,
  },
  rendering: {
    antialias: true,
    logarithmicDepthBuffer: true,
    bgColor: 0x050510,
  },
};

async function init() {
  const canvas = document.querySelector('#app') as HTMLCanvasElement | null;
  if (!canvas) throw new Error('Critical: Canvas element [#app] not found in DOM.');

  const display = new Display(canvas, {
    antialias: CONFIG.rendering.antialias,
    logarithmicDepthBuffer: CONFIG.rendering.logarithmicDepthBuffer,
  });
  display.setSize(window.innerWidth, window.innerHeight);

  const overlay = new Overlay();
  overlay.update('Initializing...', 0);

  const space = new Space({ background: CONFIG.rendering.bgColor });

  const ship = new Ship(canvas, undefined, {
    regionAware: true,
    overlay: overlay,
    notifyOnTransition: true,
    focusOnEntry: false,
    focusOnExit: true,
    smoothingEnabled: CONFIG.camera.smoothing,
    smoothingDurationMs: 2500,
  });

  ship.camera.position.copy(CONFIG.camera.startPos);
  ship.controls.update();

  // --- Generate Content ---
  overlay.notify('Initializing Cosmos...', 0);

  const kbc = new KBC();
  space.add(kbc);
  regionManager.register(kbc);

  // FIX: Added ': string' type annotation here
  await kbc.build((msg: string) => {
    overlay.update(msg, 0);
  });

  overlay.notify('Structure Resolved. Engaging Drive.', 3000);

  setTimeout(() => {
    ship.focusOnRegion(kbc, 1.5, 3000);
  }, 500);

  // --- Render Loop ---
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    try {
      regionManager.update(ship.camera, delta);
      ship.update();
    } catch (e) {
      console.warn('Simulation tick error:', e);
    }
    display.render(space, ship.camera);
  };

  animate();

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ship.handleResize(w, h);
    display.setSize(w, h);
  });
}

init().catch((err) => console.error(err));
