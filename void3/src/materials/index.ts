import { Material, MeshStandardMaterial, MeshStandardMaterialParameters } from 'three';

export default class MaterialFactory {
  public createStandard(params?: MeshStandardMaterialParameters): Material {
    return new MeshStandardMaterial(params as any);
  }
}
