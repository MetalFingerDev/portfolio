import * as THREE from 'three';

export function initScene(canvas: HTMLCanvasElement) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

	// Animation state
	let raf = 0;

	function moveCamera() {
		const t = document.body.getBoundingClientRect().top;

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

		renderer.render(scene, camera);
	}

	function start() {
		window.addEventListener('scroll', moveCamera);
		window.addEventListener('resize', onWindowResize);
		moveCamera();
		animate();
	}

	function stop() {
		cancelAnimationFrame(raf);
		window.removeEventListener('scroll', moveCamera);
		window.removeEventListener('resize', onWindowResize);
	}

	function dispose() {
		// Traverse scene and dispose geometries/materials/textures where applicable
		function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
			type MaybeIsMesh = { isMesh?: boolean };
			return (obj as MaybeIsMesh).isMesh === true || 'geometry' in obj || 'material' in obj;
		}

		scene.traverse((obj: THREE.Object3D) => {
			if (isMesh(obj)) {
				if (obj.geometry) obj.geometry.dispose?.();
				if (obj.material) {
					const m = obj.material;
					if (Array.isArray(m)) m.forEach((mat) => mat.dispose?.());
					else m.dispose?.();
				}
			}

			// Some objects may have textures attached in non-standard places; dispose safely if present.
			const tex = (obj as unknown as { texture?: THREE.Texture }).texture;
			if (tex) tex.dispose?.();
		});

		renderer.dispose();
	}

	return { start, stop, dispose };
}
