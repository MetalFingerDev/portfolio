import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Earth from "./Earth";
import Sun from "./Sun";

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

  const setControls = (radius: number) => {
    const c = controls as any;
    c.enablePan = false;
    c.screenSpacePanning = false;
    c.minPolarAngle = 0.05;
    c.maxPolarAngle = Math.PI - 0.05;
    controls.minDistance = Math.max(0.1, radius * 1.05);
    controls.maxDistance = Math.max(controls.minDistance + 1, radius * 300);
  };

  viewSunBtn.addEventListener("click", () => {
    const isViewingSun = !viewingSun;
    const radius = isViewingSun ? Sun.RADIUS : Earth.RADIUS;
    const pos = isViewingSun
      ? sun.position.clone()
      : earth.earthMesh.position.clone();
    // place camera offset on +X and move up along +Y so zoom-out is upwards
    const camPos = pos
      .clone()
      .add(new THREE.Vector3(radius * 2.5, radius * 2.0, 0));
    // ensure camera stays in positive Y direction
    camPos.y = Math.abs(camPos.y);
    const duration = isViewingSun ? 900 : 800;

    setControls(radius);
    animateCameraTo(camPos, pos, duration, () => {
      controls.target.copy(pos);
      controls.update();
    });

    viewSunBtn.textContent = isViewingSun ? "Back to Earth" : "View Sun";
    viewingSun = isViewingSun;
  });
}
