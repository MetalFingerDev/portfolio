import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import * as THREE from "three";
import Void from "./scripts/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Void />
  </StrictMode>
);

const screen = document.querySelector("#canvas") as HTMLCanvasElement | null;
if (!screen) throw new Error("screen not found");

const renderer = new THREE.WebGLRenderer({
  screen,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
const clock = new THREE.Clock();
const space = new THREE.Scene();
const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e15
);
