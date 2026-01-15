import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";
import * as THREE from "three";

// --- Setup ---

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e15
);
ship.position.set(0, 20, 80);

const controls = new OrbitControls(ship, canvas);
controls.enableDamping = true;

const space = new THREE.Scene();
const light = new THREE.AmbientLight(0x404040, 5);
space.add(light);
const pointLight = new THREE.PointLight(0xffffff, 100);
pointLight.position.set(20, 20, 20);
space.add(pointLight);

// --- App Logic ---
