import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const cache = new Map<string, THREE.Group>();

export async function getModel(path: string): Promise<THREE.Group> {
  if (cache.has(path)) {
    return cache.get(path)!.clone(); // Return a clone, not the original!
  }
  const gltf = await loader.loadAsync(path);
  cache.set(path, gltf.scene);
  return gltf.scene.clone();
}
