import * as THREE from "three";
import starsData from "./bright-stars.json";
import type { StarEntry } from "./stars/types";
import { parseCatalog } from "./stars/catalog";
import { populateLocalStars } from "./stars/populateLocalStars";

export default class Stars {
  starPoints?: THREE.Points;
  starGroup: THREE.Group = new THREE.Group();
  interiorMesh?: THREE.Mesh;
  static RADIUS = 1e9; // keep a sensible default

  constructor(scene?: THREE.Scene) {
    if (scene) scene.add(this.starGroup);
  }
}

export function AllStars(scene: THREE.Scene) {
  return LocalStars(scene);
}

export function LocalStars(scene: THREE.Scene) {
  const instance = new Stars(scene);
  const stars = starsData as StarEntry[];
  return populateLocalStars(instance, stars);
}

export function LocalStarsFromCatalog(scene: THREE.Scene, catalogText: string) {
  const instance = new Stars(scene);
  const stars = parseCatalog(catalogText);
  return populateLocalStars(instance, stars);
}

export function DistantStars(scene: THREE.Scene) {
  return LocalStars(scene);
}
