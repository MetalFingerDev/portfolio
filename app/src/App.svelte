<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

  onMount(() => {

    
    // Types for Three.js objects
    const scene: THREE.Scene = new THREE.Scene();
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#bg") as HTMLCanvasElement,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(30);

    renderer.render(scene, camera);

    const geometry: THREE.TorusGeometry = new THREE.TorusGeometry(
      10,
      3,
      16,
      100
    );
    // Use MeshPhongMaterial (clear specular highlights) so point light is visible
    const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6347,
      specular: 0xffffff,
      shininess: 80,
    });
    const torus: THREE.Mesh = new THREE.Mesh(geometry, material);
    scene.add(torus);
    // ensure material updates
    (material as THREE.MeshPhongMaterial).needsUpdate = true;

    // Add lighting
    const pointLight: THREE.PointLight = new THREE.PointLight(0xffffff, 4);
    // moved the point light to a brighter offset
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Helper to visualize the light position
    const pointLightHelper: THREE.PointLightHelper = new THREE.PointLightHelper(
      pointLight,
      1
    );

    const gridHelper = new THREE.GridHelper(200,50)
    scene.add(pointLightHelper);
    scene.add(gridHelper)


    // Add a directional light for clearer contrast
    const dirLight: THREE.DirectionalLight = new THREE.DirectionalLight(
      0xffffff,
      2
    );
    dirLight.position.set(-5, 5, 5);
    scene.add(dirLight);

    // Handle window resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const controls = new OrbitControls(camera,renderer.domElement);

    function addStar(){

      const geometry = new THREE.SphereGeometry(0.25,24,24)
      const material = new THREE.MeshStandardMaterial({color:0xffffff})
      const star = new THREE.Mesh(geometry,material);

      const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

      star.position
    }
    function animate() {
      requestAnimationFrame(animate);
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      torus.rotation.z += 0.01;


      controls.update();
      // update helper to follow the light
      pointLightHelper.update();
      renderer.render(scene, camera);
    }
    animate();
  });
</script>

<canvas id="bg" class="fixed top-0 left-0"></canvas>
