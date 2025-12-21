import * as THREE from 'three';

export function initScene(canvas: HTMLCanvasElement) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setSize(window.innerWidth, window.innerHeight);

	const gradientTexture = new THREE.Texture(generateGradientTexture());
	gradientTexture.needsUpdate = true;
	const gradientMaterial = new THREE.MeshBasicMaterial({
		map: gradientTexture,
		depthWrite: false
	});
	const gradientPlane = new THREE.PlaneGeometry(2, 2);
	const gradientQuad = new THREE.Mesh(gradientPlane, gradientMaterial);
	gradientQuad.position.z = -1000;
	scene.add(gradientQuad);

	const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
	const torusMaterial = new THREE.MeshPhongMaterial({
		color: 0x00ccff,
		specular: 0x555555,
		shininess: 30
	});
	const torus = new THREE.Mesh(torusGeometry, torusMaterial);
	scene.add(torus);

	const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0xffffff, 1, 100);
	pointLight.position.set(30, 20, 20);
	scene.add(pointLight);

	// Position camera
	camera.position.z = 30;

	let raf = 0;
	let disposed = false;

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
		if (disposed) return;
		stop();

		// remove main mesh from scene and dispose its resources
		if (torus) {
			scene.remove(torus);
			const mesh = torus as THREE.Mesh;
			if (mesh.geometry && typeof (mesh.geometry as THREE.BufferGeometry).dispose === 'function') {
				(mesh.geometry as THREE.BufferGeometry).dispose();
			}
			const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
			if (mat) {
				if (Array.isArray(mat)) {
					mat.forEach((m) => {
						if (m && typeof (m as THREE.Material).dispose === 'function')
							(m as THREE.Material).dispose();
					});
				} else if (typeof (mat as THREE.Material).dispose === 'function') {
					(mat as THREE.Material).dispose();
				}
			}
		}

		// dispose shared geometry/material if still present
		if (geometry && typeof (geometry as THREE.BufferGeometry).dispose === 'function')
			geometry.dispose();
		if (material && typeof (material as THREE.Material).dispose === 'function') {
			(material as THREE.Material).dispose();
		}

		// try to free GL resources coming from the renderer as well
		try {
			renderer.dispose();
			if (typeof (renderer as THREE.WebGLRenderer).forceContextLoss === 'function')
				(renderer as THREE.WebGLRenderer).forceContextLoss();
		} catch (e) {
			// ignore dispose errors
		}

		raf = 0;
		disposed = true;
	}

	return { start, stop, dispose };
}
