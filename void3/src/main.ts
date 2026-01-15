import "./style.css";
import Display from "./rendering/Display";
import Visualization from "./visualization";
import Overlay from "./ui/overlay";
import Ship from "./controls/Ship";
import Space from "./scenes/Space";
import SystemManager from "./systems";
import registerer from "./regions";

const canvas = document.querySelector<HTMLCanvasElement>("#app");
if (!canvas) throw new Error("Canvas not found");

const display = new Display(canvas, { antialias: true, alpha: false });
display.setSize(window.innerWidth, window.innerHeight);

const ship = new Ship(canvas);

const space = new Space();

const visualization = new Visualization(space, display);

const stage = new SystemManager(space, ship.camera, display.renderer);

const overlay = new Overlay();
stage.onScaleChange = (id: string, scale: number) => {
  overlay.update(id, scale);
};

const inputHandler = new InputHandler(ship, stage, visualization, overlay);

registerer(stage);

// notify overlay when active system changes
stage.onActiveSystemChange = (id: string | null) => {
  overlay.update(id, (stage.current?.group.scale.x as number) ?? 1);
};

// Testing: load each system and set a reasonable scale for visual verification.
// Load Solar System first (this will also load its neighbor Interstellar Space).
stage.load("solar-system");
stage.setSystemScale("solar-system", 1);
stage.setSystemScale("interstellar-space", 1000);

// Load Milky Way to set its scale as well, then return to Solar System.
stage.load("milky-way");
stage.setSystemScale("milky-way", 10);

// Return to Solar System as the active view for interaction/testing.
stage.load("solar-system");

// initialize overlay with current values
overlay.update(
  stage.current?.group.name ?? null,
  (stage.current?.group.scale.x as number) ?? 1
);

visualization.updateVisibleObjects(stage.current);

// Basic animation loop ---------------------------------------------------
let lastTime = performance.now();
let running = true;

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  display.setSize(w, h);
  ship.handleResize(w, h);
}

window.addEventListener("resize", onResize);

// Keyboard controls
document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key === "l" || key === "L") {
    stage.toggleLOD();
    return;
  }

  if (key === "s" || key === "S") {
    const nextSystem =
      (stage as any).getActiveSystemId() === "solar-system"
        ? "interstellar-space"
        : "solar-system";
    ship.hyperSpace(nextSystem, stage, visualization, overlay);
    return;
  }

  inputHandler.handleKey(key);
});

function animate(now = performance.now()) {
  if (!running) return;
  const dt = Math.max(0, (now - lastTime) / 1000);
  lastTime = now;

  // update controls and active system
  ship.update();
  stage.update(dt);

  // --- NEW: Distance Check for automatic hyperspace jumps ---
  const distance = ship.camera.position.distanceTo(ship.controls.target);

  // Automatic hyperspace transitions based on camera distance
  const activeId = (stage as any).getActiveSystemId();

  // Laniakea <-> Milky Way (zooming in from Laniakea should enter Milky Way)
  // arrivalDistances: laniakea=3000, milky-way=1500 => threshold ~2000
  if (distance < 2000 && activeId === "laniakea-super-cluster") {
    ship.hyperSpace("milky-way", stage, visualization, overlay);
  }
  if (distance > 2000 && activeId === "milky-way") {
    ship.hyperSpace("laniakea-super-cluster", stage, visualization, overlay);
  }

  // Milky Way <-> Interstellar (threshold ~1750)
  if (distance > 1750 && activeId === "milky-way") {
    ship.hyperSpace("interstellar-space", stage, visualization, overlay);
  }
  if (distance < 1750 && activeId === "interstellar-space") {
    ship.hyperSpace("milky-way", stage, visualization, overlay);
  }

  // Solar System <-> Interstellar (retain previous safe thresholds)
  if (distance > 1000 && activeId === "solar-system") {
    ship.hyperSpace("interstellar-space", stage, visualization, overlay);
  }

  if (distance < 200 && activeId === "interstellar-space") {
    ship.hyperSpace("solar-system", stage, visualization, overlay);
  }
  // ---------------------------------------------------------

  // render current scene
  visualization.render(ship.camera);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Pause/resume when the tab visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(animate);
  } else {
    running = false;
  }
});
