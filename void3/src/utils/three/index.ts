import * as THREE from "three";

export default class ThreeUtils {
  public static lookAt(object: THREE.Object3D, target: THREE.Vector3) {
    object.lookAt(target);
  }
}
