import "./style.css";
import * as THREE from "three";

// --- Planet options interface ---
interface PlanetOptions {
  radius?: number;
  axialTilt?: number;
  color?: number;
  wireframe?: boolean;
}

// --- Planets class ---
class Planets extends THREE.Group {
  public mesh: THREE.Mesh<
    THREE.IcosahedronGeometry,
    THREE.MeshStandardMaterial,
    THREE.Object3DEventMap
  >;
  public axialTilt: number;

  constructor({
    radius = 1,
    axialTilt = 0,
    color = 0xff6347,
    wireframe = true,
  }: PlanetOptions = {}) {
    super();

    const geometry: THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry(
      radius,
      2
    );
    const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial(
      {
        color,
        wireframe,
      }
    );

    this.mesh = new THREE.Mesh(geometry, material);
    this.axialTilt = axialTilt;

    // Apply axial tilt once
    this.mesh.rotation.z = THREE.MathUtils.degToRad(axialTilt);

    this.add(this.mesh);
  }

  // Spin around the tilted local Y-axis
  public spin(speed: number = 0.01): void {
    this.mesh.rotation.y += speed;
  }
}

function main(): void {
  // --- Window and canvas setup ---
  const width: number = window.innerWidth;
  const height: number = window.innerHeight;
  const canvas: HTMLCanvasElement = document.querySelector(
    "#stage"
  ) as HTMLCanvasElement;

  // --- Scene, light, camera, renderer ---
  const scene: THREE.Scene = new THREE.Scene();

  const light: THREE.HemisphereLight = new THREE.HemisphereLight(0xffffff);
  scene.add(light);

  const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    99
  );
  camera.position.z = 5;

  const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.render(scene, camera);

  // --- planets ---
  const earth: Planets = new Planets({
    radius: 1,
    axialTilt: 23.44,
    color: 0x3366ff,
  });
  scene.add(earth);

  const mars: Planets = new Planets({
    radius: 0.53,
    axialTilt: 25.19,
    color: 0xff3300,
  });
  scene.add(mars);

  // --- Animation loop ---
  function animate(): void {
    requestAnimationFrame(animate);

    earth.spin(0.01);
    mars.spin(0.008);

    renderer.render(scene, camera);
  }

  animate();
}

main();
