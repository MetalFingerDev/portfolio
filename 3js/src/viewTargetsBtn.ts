import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Earth from "./Earth";
import Sun from "./Sun";
import { STAR_FIELD_RADIUS } from "./units";

export default function setupViewTargetsButton(
  viewBtn: HTMLButtonElement,
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
  // 0 = Earth, 1 = Sun, 2 = Stars
  let state = 0;

  function goToEarth() {
    const cam = new THREE.Vector3(0, 0, 3);
    const target = earth.earthMesh.position.clone();
    animateCameraTo(cam, target, 800, () => {
      controls.target.copy(target);
      controls.update();
    });
    viewBtn.textContent = "View Sun";
    state = 0;
  }

  function goToSun() {
    const cam = sun.sunMesh.position
      .clone()
      .add(new THREE.Vector3(SUN_RADIUS_SCENE * 4, 0, SUN_RADIUS_SCENE * 2));
    const target = sun.sunMesh.position.clone();
    animateCameraTo(cam, target, 800, () => {
      controls.target.copy(target);
      controls.update();
    });
    viewBtn.textContent = "View Stars";
    state = 1;
  }

  function goToStars() {
    // place camera near the star field shell on +X side and look inward
    const cam = new THREE.Vector3(
      STAR_FIELD_RADIUS * 0.98,
      0,
      STAR_FIELD_RADIUS * 0.02
    );
    const target = new THREE.Vector3(0, 0, 0);
    animateCameraTo(cam, target, 800, () => {
      controls.target.copy(target);
      controls.update();
    });
    viewBtn.textContent = "Back to Earth";
    state = 2;
  }

  // ensure we reference SUN_RADIUS_SCENE without importing directly (avoid duplicate constant imports)
  const SUN_RADIUS_SCENE = (Sun as any).RADIUS || 109;

  viewBtn.addEventListener("click", () => {
    if (state === 0) goToSun();
    else if (state === 1) goToStars();
    else goToEarth();
  });
}
