import * as THREE from "three";

export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material))
        child.material.forEach((m: any) => m.dispose());
      else child.material.dispose();
    }
    if (child instanceof THREE.Light && child.parent)
      child.parent.remove(child);
  });
}
