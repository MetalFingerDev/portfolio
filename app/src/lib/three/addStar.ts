import * as THREE from "three";

export function addStar(scene: THREE.Scene) {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array.from({ length: 3 }, () =>
    THREE.MathUtils.randFloatSpread(100)
  );
  star.position.set(x, y, z);
  scene.add(star);
}
