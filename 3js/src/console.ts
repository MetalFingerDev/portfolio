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
export function updateRegionHud(currentAddress: address): void {
  if (!regionHud) return;
  const cfg = compendium[currentAddress];
  regionHud.textContent = cfg?.Name || `Region ${currentAddress}`;
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
