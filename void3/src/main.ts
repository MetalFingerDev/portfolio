import "./style.css";
import Display from "./rendering/index";
import Visualization from "./visualization";

import { Ship, InputHandler } from "./controls";
import Space from "./scenes";
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

const inputHandler = new InputHandler(ship, stage, visualization);

registerer(stage);
stage.load("solar-system");
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
  inputHandler.handleKey(e.key);
});

function animate(now = performance.now()) {
  if (!running) return;
  const dt = Math.max(0, (now - lastTime) / 1000);
  lastTime = now;

  // update controls and active system
  ship.update(dt);
  stage.update(dt);

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
