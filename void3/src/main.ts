import "./style.css";
import Renderer from "./rendering/index";

const canvas = document.querySelector<HTMLCanvasElement>("#app");
if (!canvas) throw new Error("Canvas not found");

const renderer = new Renderer(canvas, { antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
