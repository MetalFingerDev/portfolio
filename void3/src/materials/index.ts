import { Material, MeshStandardMaterial } from "three";
import type { MeshStandardMaterialParameters } from "three";

export default class MaterialFactory {
  public createStandard(params?: MeshStandardMaterialParameters): Material {
    return new MeshStandardMaterial(params as any);
  }
}
