import * as THREE from "three";

export function createMoon() {
  const moonTexture = new THREE.TextureLoader().load("moon.jpg");
  const normalTexture = new THREE.TextureLoader().load("normal.jpg");

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      normalMap: normalTexture,
    })
  );
  moon.position.z = 30;
  moon.position.setX(-10);
  return moon;
}
