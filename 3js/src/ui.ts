import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type address, type region } from "./config";

// ============================================================================
// NAVIGATION UI
// ============================================================================

const navDropdown = document.getElementById("nav-dropdown") as HTMLElement;
const navToggle = document.getElementById("nav-toggle") as HTMLButtonElement;
const navList = document.getElementById("nav-list") as HTMLUListElement;

navToggle.addEventListener("click", () => {
  navDropdown.classList.toggle("open");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!navDropdown.contains(e.target as Node)) {
    navDropdown.classList.remove("open");
  }
});

export function updateNavigationList(
  stage: Map<address, region>,
  currentAddress: address
) {
  navList.innerHTML = "";
  const currentRegion = stage.get(currentAddress);
  if (!currentRegion) return;

  const namesFound = new Set<string>();

  currentRegion.group.traverse((child) => {
    // Only add if it has a name AND it's a Mesh or Group (avoiding labels/helpers)
    if (
      child.name &&
      (child.type === "Mesh" || child.type === "Group") &&
      !namesFound.has(child.name)
    ) {
      const li = document.createElement("li");
      li.textContent = child.name;
      li.dataset.uuid = child.uuid;
      navList.appendChild(li);
      namesFound.add(child.name); // Prevent duplicates
    }
  });
}

export function setupNavListClickHandler(
  stage: Map<address, region>,
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

    // Get world position of target
    const worldPos = new THREE.Vector3();
    target.getWorldPosition(worldPos);

    // Calculate offset based on object's bounding sphere or a default
    let offsetDist = 50;
    if (target instanceof THREE.Mesh && target.geometry.boundingSphere) {
      offsetDist = target.geometry.boundingSphere.radius * 3;
    }

    const offset = new THREE.Vector3(0, offsetDist * 0.3, offsetDist);
    ship.position.copy(worldPos).add(offset);

    // Lock OrbitControls to the target's center
    controls.target.copy(worldPos);
    controls.update();

    // Close dropdown
    navDropdown.classList.remove("open");
  });
}
