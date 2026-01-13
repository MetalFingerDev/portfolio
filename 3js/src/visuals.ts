import * as THREE from "three";
import { AU_SCENE } from "./conversions";

export interface OrbitOptions {
  distanceAU: number;
  eccentricity: number;
  angleDeg: number;
  ratio: number;
  color?: number;
  opacity?: number;
  segments?: number;
}

export function addOrbit(
  parent: THREE.Group,
  opts: OrbitOptions
): { orbit: THREE.Line; position: THREE.Vector3 } {
  const a = opts.distanceAU * AU_SCENE * opts.ratio;
  const e = opts.eccentricity;
  const b = a * Math.sqrt(1 - e * e);
  const focusOffset = a * e;

  const curve = new THREE.EllipseCurve(
    -focusOffset,
    0,
    a,
    b,
    0,
    2 * Math.PI,
    false,
    0
  );

  const points = curve.getPoints(opts.segments ?? 128);
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
  orbitGeo.rotateX(Math.PI / 2);

  const mat = new THREE.LineBasicMaterial({
    color: opts.color ?? 0x4444ff,
    transparent: true,
    opacity: opts.opacity ?? 0.15,
    blending: THREE.AdditiveBlending,
  });
  const orbit = new THREE.Line(orbitGeo, mat);
  parent.add(orbit);

  const angleRad = THREE.MathUtils.degToRad(opts.angleDeg);
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
  const posX = r * Math.cos(angleRad);
  const posZ = r * Math.sin(angleRad);

  return { orbit, position: new THREE.Vector3(posX, 0, posZ) };
}

export function addAxis(mesh: THREE.Mesh, length: number, color = 0xcccccc) {
  const axisLen = length;
  const points = [
    new THREE.Vector3(0, axisLen / 2, 0),
    new THREE.Vector3(0, -axisLen / 2, 0),
  ];
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
  });
  const line = new THREE.Line(geom, mat);
  mesh.add(line);
  return line;
}
