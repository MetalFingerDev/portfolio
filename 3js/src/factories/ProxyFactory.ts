import * as THREE from "three";

export function createPointProxy(color: number, size: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(size, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geo, mat);
}

export function createLowDetailSphere(
  color: number,
  radius: number
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  return new THREE.Mesh(geo, mat);
}
