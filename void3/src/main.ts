import "./style.css";
import Display from "./rendering/index";

import { Ship } from "./controls";
import Space from "./scenes";
import SystemManager from "./systems";
import registerer from "./regions";

const canvas = document.querySelector<HTMLCanvasElement>("#app");
if (!canvas) throw new Error("Canvas not found");

const display = new Display(canvas, { antialias: true, alpha: false });
display.setSize(window.innerWidth, window.innerHeight);

const ship = new Ship({ dom: canvas });

const space = new Space();

const stage = new SystemManager(space, ship.camera, display.renderer);

registerer(stage);
stage.load("solar-system");
