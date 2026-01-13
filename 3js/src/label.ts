import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export function createLabel(text: string, yOffset: number): CSS2DObject {
  const div = document.createElement("div");
  div.className = "solar-label";
  div.textContent = text;
  div.style.cssText = `
    color: rgba(255, 255, 255, 0.8);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    pointer-events: none;
  `;
  const label = new CSS2DObject(div);
  label.position.set(0, yOffset, 0);
  return label;
}
