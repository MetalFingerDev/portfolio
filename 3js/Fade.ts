import * as THREE from "three";
// @ts-ignore - examples modules sometimes lack types in some setups
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const canvas = document.getElementById("bg") as HTMLCanvasElement;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

// Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);
camera.position.set(0, 20, 80);
camera.lookAt(0, 0, 0);

// Scenes
const sceneSolar = new THREE.Scene();
const sceneGalaxy = new THREE.Scene();

// Lights
const solarLight = new THREE.PointLight(0xffffff, 2.0, 0, 2);
solarLight.position.set(0, 0, 0);
sceneSolar.add(solarLight);
sceneSolar.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6));
sceneSolar.add(new THREE.AmbientLight(0x222222, 0.6));
sceneGalaxy.add(new THREE.AmbientLight(0xffffff, 0.6));
sceneGalaxy.background = new THREE.Color(0x000012);
sceneSolar.background = new THREE.Color(0x000000);

// Solar system objects
const sunGeo = new THREE.SphereGeometry(8, 48, 48);
const sunMat = new THREE.MeshStandardMaterial({
  color: 0xffcc33,
  emissive: 0xffaa33,
  emissiveIntensity: 1.2,
  metalness: 0.0,
  roughness: 1.0,
});
const sun = new THREE.Mesh(sunGeo, sunMat);
// soft additive glow
const glowMat = new THREE.MeshBasicMaterial({
  color: 0xffcc33,
  transparent: true,
  opacity: 0.25,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(12, 32, 32), glowMat);
sunGlow.renderOrder = 0;
sun.renderOrder = 1;
sceneSolar.add(sun);
sceneSolar.add(sunGlow);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x3aa2ff })
);
earth.userData = { radius: 20, angle: 0, speed: 0.01 };
sceneSolar.add(earth);

// Galaxy (simple starfield)
const starCount = 2000;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 8000;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 8000;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 8000;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const starMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1.5 * Math.min(window.devicePixelRatio || 1, 2),
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.9,
});
const stars = new THREE.Points(starGeo, starMat);
sceneGalaxy.add(stars);

// Render targets
const rtSolar = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
);
const rtGalaxy = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
);

// Composite shader
const compositeScene = new THREE.Scene();
const compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const compositeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    texA: { value: rtSolar.texture },
    texB: { value: rtGalaxy.texture },
    mixRatio: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D texA;
    uniform sampler2D texB;
    uniform float mixRatio;
    varying vec2 vUv;
    void main() {
      vec4 colorA = texture2D(texA, vUv);
      vec4 colorB = texture2D(texB, vUv);
      gl_FragColor = mix(colorA, colorB, mixRatio);
    }
  `,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compositeMaterial);
compositeScene.add(quad);

// Resize handling
function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rtSolar.setSize(w, h);
  rtGalaxy.setSize(w, h);
}
window.addEventListener("resize", onWindowResize, { passive: true });

// Make canvas fill the screen and prevent scrollbars
canvas.style.display = "block";
canvas.style.width = "100%";
canvas.style.height = "100%";
document.body.style.margin = "0";
document.body.style.overflow = "hidden";

// Orbit controls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 30;
controls.maxDistance = 800;
controls.enablePan = false;
controls.minPolarAngle = 0; // don't go below horizon
controls.maxPolarAngle = Math.PI / 2 - 0.05; // limit to near horizon
controls.target.set(0, 0, 0);

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  earth.userData.angle += (earth.userData.speed || 0.01) * dt * 60;
  const r = earth.userData.radius;
  earth.position.set(
    Math.cos(earth.userData.angle) * r,
    0,
    Math.sin(earth.userData.angle) * r
  );
  earth.rotation.y += 0.01;

  // Update controls (damping)
  controls.update();

  // Smoothly blend between solar and galaxy based on camera distance to controls target
  const dist = camera.position.distanceTo(controls.target);
  const tTarget = THREE.MathUtils.clamp(
    (dist - controls.minDistance) /
      (controls.maxDistance - controls.minDistance),
    0,
    1
  );
  compositeMaterial.uniforms.mixRatio.value = THREE.MathUtils.lerp(
    compositeMaterial.uniforms.mixRatio.value,
    tTarget,
    0.08
  );

  // Render solar system
  renderer.setRenderTarget(rtSolar);
  renderer.render(sceneSolar, camera);

  // Render galaxy
  renderer.setRenderTarget(rtGalaxy);
  renderer.render(sceneGalaxy, camera);

  // Composite (final pass to canvas)
  renderer.setRenderTarget(null);
  renderer.render(compositeScene, compositeCamera);
}

onWindowResize();
animate();
