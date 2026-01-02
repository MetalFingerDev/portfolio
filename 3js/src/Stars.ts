import * as THREE from "three";
import { SUN_DISTANCE_SCENE } from "./units";

export default class Stars {
  starPoints?: THREE.Points;
  starGroup: THREE.Group = new THREE.Group();
  interiorMesh?: THREE.Mesh;

  constructor(scene?: THREE.Scene) {
    if (scene) scene.add(this.starGroup);
  }
}

export function AllStars(scene: THREE.Scene) {
  return new Stars(scene);
}

export function LocalStars(scene: THREE.Scene) {
  const stars = new Stars(scene);

  // 50 AU across => radius = 25 AU in scene units
  const radius = SUN_DISTANCE_SCENE * 25;

  const geom = new THREE.SphereGeometry(radius, 64, 32);
  const tex = new THREE.TextureLoader().load("/milkyway.jpg");
  const sRGB =
    (THREE as any).sRGBEncoding ?? (THREE as any).SRGBColorSpace ?? undefined;
  if (sRGB !== undefined) (tex as any).encoding = sRGB;

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    depthWrite: false,
  });
  mat.toneMapped = true;
  mat.color.setScalar(0.6);
  mat.transparent = true;
  mat.opacity = 0.95;

  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = "local-milkyway";
  stars.interiorMesh = mesh;
  stars.starGroup.add(mesh);

  return stars;
}

export function DistantStars(scene: THREE.Scene) {
  return new Stars(scene);
}
