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

  // Torus
  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  // Lights
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(5, 5, 5);
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(pointLight, ambientLight);

  // Stars
  Array.from({ length: 200 }).forEach(() => addStar(scene));

  // Background
  const spaceTexture = new THREE.TextureLoader().load("space.jpg");
  scene.background = spaceTexture;

  // Jeff & Moon
  const jeff = createJeff();
  scene.add(jeff);

  const moon = createMoon();
  scene.add(moon);

  // Animation state
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
    scene.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose?.();
      if (obj.material) {
        const m = obj.material;
        if (Array.isArray(m)) m.forEach((mat) => mat.dispose?.());
        else m.dispose?.();
      }
      if (obj.texture) obj.texture.dispose?.();
    });
    renderer.dispose();
  }

  return { start, stop, dispose };
}
