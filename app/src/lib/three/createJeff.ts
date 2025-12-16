import * as THREE from "three";

export function createJeff() {
  const jeffTexture = new THREE.TextureLoader().load("jeff.png");
  const jeff = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshBasicMaterial({ map: jeffTexture })
  );
  jeff.position.z = -5;
  jeff.position.x = 2;
  return jeff;
}
