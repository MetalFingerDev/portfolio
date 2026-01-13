import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type address, type IRegion, compendium, regions } from "./config";

const navDropdown = document.getElementById("nav-dropdown") as HTMLElement;
const navToggle = document.getElementById("nav-toggle") as HTMLButtonElement;
const navList = document.getElementById("nav-list") as HTMLUListElement;
const regionHud = document.getElementById("region-name") as HTMLElement;
const sceneSelector = document.getElementById("scene-selector");

navToggle.addEventListener("click", () => {
  navDropdown.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!navDropdown.contains(e.target as Node)) {
    navDropdown.classList.remove("open");
  }
});

// Separate HUD update function - decoupled from navigation
export function updateRegionHud(
  currentAddress: address,
  stage?: Map<address, IRegion>
): void {
  if (!regionHud) return;
  const cfg = compendium[currentAddress];
  let txt = cfg?.Name || `Region ${currentAddress}`;
  if (stage) {
    try {
      const r = stage.get(currentAddress);
      if (r && r.group && r.group.userData) {
        if (r.group.userData.cameraAssigned) txt += " (camera)";
        if (r.group.userData.detailIsHigh) txt += " (high)";
      }
    } catch (e) {}
  }
  regionHud.textContent = txt;
}

export function updateNavigationList(
  stage: Map<address, IRegion>,
  currentAddress: address
) {
  navList.innerHTML = "";
  const currentRegion = stage.get(currentAddress);
  if (!currentRegion) return;

  const namesFound = new Set<string>();

  currentRegion.group.traverse((child) => {
    if (
      child.name &&
      (child.type === "Mesh" || child.type === "Group") &&
      !namesFound.has(child.name)
    ) {
      const li = document.createElement("li");
      li.textContent = child.name;
      li.dataset.uuid = child.uuid;
      navList.appendChild(li);
      namesFound.add(child.name);
    }
  });
}

export function setupNavListClickHandler(
  stage: Map<address, IRegion>,
  getCurrentAddress: () => address,
  ship: THREE.PerspectiveCamera,
  controls: OrbitControls,
  setTrackedObject: (obj: THREE.Object3D | null) => void
) {
  navList.addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest("li");
    if (!li) return;

    const uuid = li.dataset.uuid;
    if (!uuid) return;

    const currentRegion = stage.get(getCurrentAddress());
    if (!currentRegion) return;

    const target = currentRegion.group.getObjectByProperty("uuid", uuid);
    if (!target) return;

    setTrackedObject(target);

    const worldPos = new THREE.Vector3();
    target.getWorldPosition(worldPos);

    let offsetDist = 50;
    if (target instanceof THREE.Mesh && target.geometry.boundingSphere) {
      offsetDist = target.geometry.boundingSphere.radius * 3;
    }

    const offset = new THREE.Vector3(0, offsetDist * 0.3, offsetDist);
    ship.position.copy(worldPos).add(offset);

    controls.target.copy(worldPos);
    controls.update();

    navDropdown.classList.remove("open");
  });
}

export function setupSceneSelector(onSceneChange: (addr: address) => void) {
  if (!sceneSelector) return;

  sceneSelector.innerHTML = "";

  Object.entries(regions).forEach(([key, addr]) => {
    const cfg = compendium[addr];

    const btn = document.createElement("button");
    btn.className = "scene-btn";
    btn.textContent = cfg.Name || key;

    btn.onclick = () => {
      onSceneChange(addr);
      document.getElementById("nav-dropdown")?.classList.remove("open");
    };

    sceneSelector.appendChild(btn);
  });
}

// Debug overlay: shows loaded regions, camera assignment, and detail state
let _debugInterval: number | undefined;
export function startDebugOverlay(
  stage: Map<address, IRegion>,
  intervalMs = 250
) {
  let panel = document.getElementById("debug-overlay") as HTMLElement | null;
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "debug-overlay";
    panel.style.position = "absolute";
    panel.style.right = "10px";
    panel.style.top = "10px";
    panel.style.background = "rgba(0,0,0,0.65)";
    panel.style.color = "white";
    panel.style.padding = "8px";
    panel.style.fontSize = "12px";
    panel.style.fontFamily = "monospace";
    panel.style.zIndex = "9999";
    panel.style.maxWidth = "260px";
    panel.style.borderRadius = "4px";
    document.body.appendChild(panel);
  }

  function render() {
    const rows: string[] = [];
    stage.forEach((region, addr) => {
      const name = compendium[addr]?.Name || `Region ${addr}`;
      const camera = !!(
        region.group &&
        region.group.userData &&
        region.group.userData.cameraAssigned
      );
      const high = !!(
        region.group &&
        region.group.userData &&
        region.group.userData.detailIsHigh
      );

      // Build row HTML, include per-body radii when available
      let html = `<div style="margin-bottom:6px"><strong>#${addr}</strong> ${name}<br/><span style="opacity:0.85">detail: ${
        high ? "HIGH" : "LOW"
      } &nbsp; camera: ${camera ? "yes" : "no"}</span>`;

      try {
        const bodies = (region as any).bodies as any[] | undefined;
        if (bodies && bodies.length) {
          const bodyRows = bodies.map((b) => {
            const bn = b.group?.name || "(unnamed)";
            const bs = b.group?.userData?.baseSize;
            const bsTxt = typeof bs === "number" ? bs.toFixed(3) : "—";
            return `${bn}: ${bsTxt}`;
          });
          html += `<div style="margin-top:4px;margin-left:8px;font-size:11px;opacity:0.9">Bodies: ${bodyRows.join(
            ", "
          )}</div>`;
        }
      } catch (e) {}

      html += `</div>`;
      rows.push(html);
    });
    if (rows.length === 0) rows.push("<div>No regions loaded</div>");
    panel!.innerHTML =
      `<div style="font-weight:bold;margin-bottom:6px">Regions (${stage.size})</div>` +
      rows.join("");
  }

  render();
  if (_debugInterval) clearInterval(_debugInterval);
  _debugInterval = window.setInterval(render, intervalMs) as unknown as number;
}

export function stopDebugOverlay() {
  if (_debugInterval) {
    clearInterval(_debugInterval);
    _debugInterval = undefined;
  }
  const panel = document.getElementById("debug-overlay");
  if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
}
