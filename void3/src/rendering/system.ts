import "./style.css";

import Display from "../rendering/Display";
import Ship from "../controls/Ship";
import Space from "../scenes/Space";

import { SolarSystem } from "../regions/SolarSystem";
import { MilkyWay } from "../regions/MilkyWay";
import { LocalGroup } from "../regions/LocalGroup";
// --- Setup ---

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");

const display = new Display(canvas, {
  antialias: true,
  logarithmicDepthBuffer: true,
});
display.setSize(window.innerWidth, window.innerHeight);

const ship = new Ship(canvas);
ship.camera.position.set(0, 20, 80);
ship.controls.enableDamping = true;

const space = new Space({
  background: 0x2e004f,
});
