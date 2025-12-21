import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Earth from "./Earth";
import Sun from "./Sun";
import Moon from "./Moon";
import { STAR_FIELD_RADIUS } from "./units";

export default function ViewTargetsButton(
  viewBtn: HTMLButtonElement,
  controls: OrbitControls,
  earth: Earth,
  sun: Sun,
  animateCameraTo: (
    targetPos: THREE.Vector3,
    lookAt: THREE.Vector3,
    _duration?: number,
    onComplete?: () => void
  ) => void,
  moon?: Moon
) {
  // compact view list: each item returns [camPos, lookAt, label]
  const getWorldPos = (
    mesh?: THREE.Object3D | { position: THREE.Vector3 } | null
  ): THREE.Vector3 => {
    const v = new THREE.Vector3();
    if (!mesh) return v;
    if (
      "getWorldPosition" in mesh &&
      typeof mesh.getWorldPosition === "function"
    ) {
      (mesh as THREE.Object3D).getWorldPosition(v);
    } else if ("position" in mesh) {
      v.copy((mesh as { position: THREE.Vector3 }).position);
    }
    return v;
  };

  const views: Array<() => [THREE.Vector3, THREE.Vector3, string]> = [
    () => [
      new THREE.Vector3(0, 0, 3),
      earth.earthMesh.position.clone(),
      "View Sun",
    ],
    () => {
      const sunPos = getWorldPos(sun.sunMesh);
      return [
        sunPos
          .clone()
          .add(
            new THREE.Vector3(
              (sun.constructor as typeof Sun).RADIUS * 4,
              0,
              (sun.constructor as typeof Sun).RADIUS * 2
            )
          ),
        sunPos,
        "View Moon",
      ];
    },
    () => {
      const moonPos =
        moon && moon.moonMesh
          ? getWorldPos(moon.moonMesh)
          : getWorldPos(sun.sunMesh);
      const moonRadius = moon
        ? (moon.constructor as typeof Moon).RADIUS
        : undefined;
      const sunRadius = (sun.constructor as typeof Sun).RADIUS || 50;
      const offsetX = moonRadius ? moonRadius * 2 : sunRadius || 100;
      const offsetZ = moonRadius ? moonRadius : sunRadius || 50;
      return [
        moonPos.clone().add(new THREE.Vector3(offsetX, 0, offsetZ)),
        moonPos,
        "View Stars",
      ];
    },
    () => [
      new THREE.Vector3(STAR_FIELD_RADIUS * 0.98, 0, STAR_FIELD_RADIUS * 0.02),
      new THREE.Vector3(0, 0, 0),
      "Back to Earth",
    ],
  ];

  let idx = 0;
  viewBtn.textContent = views[0]()[2];
  viewBtn.addEventListener("click", () => {
    idx = (idx + 1) % views.length;
    const [cam, lookAt, label] = views[idx]();
    animateCameraTo(cam, lookAt, 800, () => {
      controls.target.copy(lookAt);
      controls.update();
    });
    viewBtn.textContent = label;
  });
}
