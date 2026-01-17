import * as THREE from "three";

// Module augmentation so we can dispatch typed `enter` / `exit` events on Object3D
declare module "three" {
  interface Object3DEventMap {
    enter: { type: "enter" };
    exit: { type: "exit" };
  }
}
