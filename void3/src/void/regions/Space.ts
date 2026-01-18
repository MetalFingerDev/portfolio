import * as THREE from "three";

export interface SpaceParams {
  background?: THREE.Color | string | number;
  fog?: THREE.Fog | null;
  name?: string;
}

/**
 * Space is the single Scene for the entire universe.
 * Example usage: const space = new Space({ background: 0x000000 });
 */
export default class Space extends THREE.Scene {
  constructor(params?: SpaceParams) {
    super();
    if (params?.background !== undefined) {
      this.background =
        params.background instanceof THREE.Color
          ? params.background
          : new THREE.Color(params.background as any);
    }
    if (params?.fog !== undefined) {
      this.fog = params.fog || null;
    }
    if (params?.name) {
      this.name = params.name;
    }
  }
}
