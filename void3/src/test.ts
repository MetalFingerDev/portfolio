import "./style.css";
import Display from "./rendering/Display";
import { Ship, InputHandler } from "./controls/Ship";
import Space from "./scenes/Space";
import SystemManager from "./systems";
import registerer from "./regions";
import Visualization from "./visualization";
import * as THREE from "three";
import ShellManager from "./shells/ShellManager";
import Overlay from "./ui/overlay";

const canvas = document.querySelector<HTMLCanvasElement>("#app");
if (!canvas) throw new Error("Canvas not found");

// Renderer / display
const display = new Display(canvas, { antialias: true, alpha: false });
display.setSize(window.innerWidth, window.innerHeight);

// Ship & scene
const ship = new Ship(canvas);
const space = new Space({ background: 0x000000 });
const visualization = new Visualization(space, display);

// System manager and regions
const stage = new SystemManager(space, ship.camera, display.renderer);
registerer(stage);

// Overlay
const overlay = new Overlay();
stage.onScaleChange = (id: string, scale: number) => {
  overlay.update(id, scale);
};

// Add ambient light
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
space.add(ambient);

// Shells: inner/center/outer mapping (also create visual shells in the scene)
const shell = new ShellManager(
  stage,
  ship,
  {
    innerRadius: 300,
    outerRadius: 3000,
    innerId: "solar-system",
    centerId: "interstellar-space",
    outerId: "milky-way",
    margin: 20,
    cooldownMs: 800,
  },
  space
);

// Input
const inputHandler = new InputHandler(ship, stage, visualization, overlay);

// Initial system load: center is the ship's starting scene
stage.load("interstellar-space");
stage.setSystemScale("interstellar-space", 1);
stage.setSystemScale("solar-system", 1);
stage.setSystemScale("milky-way", 1);

// Set ship initial placement somewhere in the center shell (outside innerRadius)
ship.applyTeleport(new THREE.Vector3(0, 0, 600));

// Resize
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  display.setSize(w, h);
  ship.handleResize(w, h);
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
  inputHandler.handleKey(e.key);
});

// Animation loop
let last = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const delta = (now - last) / 1000;
  last = now;

  ship.update();
  shell.update(delta);
  stage.update(delta);
  visualization.render(ship.camera);
}
animate();

// Convenience: expose debug on window for quick inspection
(window as any).__shell = shell;
(window as any).__ship = ship;
(window as any).__stage = stage;
