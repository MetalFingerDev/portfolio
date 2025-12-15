<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";

  let canvas: HTMLCanvasElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let animationId = 0;
  const objects: THREE.Mesh[] = [];
  const COUNT = 8;
  const SPACING = 18;

  onMount(() => {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(10, 10, 10);
    scene.add(dir);

    // Create several meshes spaced along -Z
    for (let i = 0; i < COUNT; i++) {
      const geo = new THREE.TorusKnotGeometry(4, 1.2, 128, 32);
      const mat = new THREE.MeshStandardMaterial({
        metalness: 0.2,
        roughness: 0.4,
        color: new THREE.Color().setHSL(i / COUNT, 0.6, 0.5),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -i * SPACING);
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(mesh);
      objects.push(mesh);
    }

    function resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }

    function onScroll() {
      const maxScroll = document.body.scrollHeight - innerHeight;
      const t = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      // Move camera through the scene based on scroll
      camera.position.z = 30 - t * (COUNT - 1) * SPACING;
      // Small parallax effect
      camera.position.x = (window.scrollX / Math.max(1, innerWidth)) * 4 - 2;
    }

    // Mouse parallax
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      camera.rotation.y = nx * 0.05;
      camera.rotation.x = ny * 0.03;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);

    onScroll();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const t = performance.now() * 0.0005;
      objects.forEach((o, i) => {
        o.rotation.x += 0.005 + i * 0.0005;
        o.rotation.y += 0.003 + i * 0.0003;
        o.position.y = Math.sin(t + i) * 2;
      });
      renderer.render(scene, camera);
    }
    animate();

    onDestroy(() => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
    });
  });
</script>

<canvas bind:this={canvas} class="fixed inset-0 w-full h-full z-0" aria-hidden="true"></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    position: fixed;
    inset: 0;
    z-index: 0;
    touch-action: none;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(10, 10, 20, 0.6), rgba(2, 6, 23, 0.95));
  }
</style>
