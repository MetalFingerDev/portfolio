import * as THREE from "three";
import { addStar } from "./addStar";
import { createJeff } from "./createJeff";
import { createMoon } from "./createMoon";

export function initScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.setZ(30);
  camera.position.setX(-3);

  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(5, 5, 5);
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(pointLight, ambientLight);

  Array.from({ length: 200 }).forEach(() => addStar(scene));

  const spaceTexture = new THREE.TextureLoader().load("space.jpg");
  scene.background = spaceTexture;

  const jeff = createJeff();
  scene.add(jeff);

  const moon = createMoon();
  scene.add(moon);

  let raf = 0;

  function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    moon.rotation.x += 0.05;
    moon.rotation.y += 0.075;
    moon.rotation.z += 0.05;

    jeff.rotation.y += 0.01;
    jeff.rotation.z += 0.01;

    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    raf = requestAnimationFrame(animate);

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;

    moon.rotation.x += 0.005;

    renderer.render(scene, camera);
  }

  function start() {
    window.addEventListener("scroll", moveCamera);
    window.addEventListener("resize", onWindowResize);
    moveCamera();
    animate();
  }

  function stop() {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", moveCamera);
    window.removeEventListener("resize", onWindowResize);
  }

  function dispose() {
    // Traverse scene and dispose geometries/materials/textures where applicable
    scene.traverse((obj: THREE.Object3D) => {
      // Mesh-like objects may have geometry/material
      const mesh = obj as THREE.Mesh;
      if (
        mesh.geometry &&
        typeof (mesh.geometry as THREE.BufferGeometry).dispose === "function"
      ) {
        (mesh.geometry as THREE.BufferGeometry).dispose();
      }
      if (mesh.material) {
        const m = mesh.material;
        if (Array.isArray(m))
          m.forEach((mat) => (mat as THREE.Material).dispose?.());
        else (m as THREE.Material).dispose?.();
      }
      // some objects may expose textures directly
      const anyObj = obj as unknown as { texture?: { dispose?: () => void } };
      if (anyObj.texture) anyObj.texture.dispose?.();
    });
    renderer.dispose();
  }

  return { start, stop, dispose };
}
