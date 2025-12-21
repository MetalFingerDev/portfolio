import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Earth from "./Earth";
import Sun from "./Sun";
import { SUN_RADIUS_SCENE } from "./units";

export default function setupViewSunButton(
  viewSunBtn: HTMLButtonElement,
  controls: OrbitControls,
  earth: Earth,
  sun: Sun,
  animateCameraTo: (
    targetPos: THREE.Vector3,
    lookAt: THREE.Vector3,
    _duration?: number,
    onComplete?: () => void
  ) => void
) {
  let viewingSun = false;
  viewSunBtn.addEventListener("click", () => {
    viewingSun = !viewingSun;
    const cam = viewingSun
      ? sun.sunMesh.position
          .clone()
          .add(new THREE.Vector3(SUN_RADIUS_SCENE * 4, 0, SUN_RADIUS_SCENE * 2))
      : new THREE.Vector3(0, 0, 3);
    const target = viewingSun
      ? sun.sunMesh.position.clone()
      : earth.earthMesh.position.clone();
    animateCameraTo(cam, target, 0, () => {
      controls.target.copy(target);
      controls.update();
    });
    viewSunBtn.textContent = viewingSun ? "Back to Earth" : "View Sun";
  });
}
