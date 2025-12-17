// place files you want to import through the `$lib` alias in this folder.

// A small helper that initializes a Three.js scene using an existing
// <canvas> element provided by the caller. This keeps DOM access out of
// the library and lets Svelte (or any other framework) supply the canvas.
//
// Usage: call `initScene(canvas)` (client-only, e.g. inside `onMount`) and
// call the returned `start()` to begin animation. When the component is
// unmounted call `stop()` and `dispose()` to free GPU resources and
// remove event listeners.

import * as THREE from 'three';

export function initScene(canvas: HTMLCanvasElement) {
	// The Three.js scene graph root
	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	// Create a WebGL renderer that uses the provided canvas element. We
	// intentionally reuse the canvas instead of creating a new one so the
	// element remains fully controlled by the Svelte component markup.
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	// Match device pixel ratio for crisper rendering on high-dpi screens
	renderer.setPixelRatio(window.devicePixelRatio);

	// Resize handler keeps the renderer and camera in sync with the
	// browser window. It uses the displayed size (window size here); if
	// your canvas lives inside a smaller container you might want to use
	// its bounding rect instead.
	const resize = () => {
		// Use the canvas displayed size so the renderer matches the container
		const width = window.innerWidth;
		const height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	resize();

	// Create a single cube so the scene has something to render. In a real
	// app you'd probably expose accessors to add / remove meshes.
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	// Use a standard material so lighting affects the cube
	const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	camera.position.z = 5;

	// Lighting - a point light to create shading and highlights on meshes.
	// You can add an AmbientLight for softer overall illumination if needed.
	const pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(5, 5, 5);
	scene.add(pointLight);

	// Load a background texture from the static assets folder. Files in
	// `static/` are served at the site root so `/space.jpg` works in dev
	// and production. Note: TextureLoader loads asynchronously; for this
	// simple example we don't handle the loading lifecycle explicitly.
	const bgTexture = new THREE.TextureLoader().load('/space.jpg');
	scene.background = bgTexture;

	// Keep the canvas responsive. The listener is removed in `dispose()`
	// to avoid leaking event handlers when the component is unmounted.
	window.addEventListener('resize', resize);

	// Animation and lifecycle state
	const clock = new THREE.Clock();
	let animationId: number | null = null; // `requestAnimationFrame` id
	let disposed = false; // set to true after full cleanup

	// Main animation loop. Uses `clock` so motion is framerate-independent.
	function animate() {
		if (disposed) return;
		animationId = requestAnimationFrame(animate);

		const delta = clock.getDelta();
		const t = clock.getElapsedTime();

		cube.rotation.x += delta * 0.8;
		cube.rotation.y += delta * 1.1;

		// Move the point light to create dynamic highlights
		pointLight.position.x = Math.sin(t * 0.8) * 2.5;
		pointLight.position.y = Math.cos(t * 0.7) * 1.5;

		renderer.render(scene, camera);
	}

	// Start the animation loop. No-op if already running or disposed.
	function start() {
		if (animationId != null || disposed) return;
		resize();
		animate();
	}

	// Stop the animation loop (keeps objects in memory).
	function stop() {
		if (animationId == null) return;
		cancelAnimationFrame(animationId);
		animationId = null;
	}

	// Full cleanup: stop the loop, remove listeners and free GPU resources.
	// It's important to dispose WebGL resources to avoid memory leaks and
	// running out of GPU contexts when mounting/unmounting the component
	// repeatedly during development or SPA navigation.
	function dispose() {
		if (disposed) return;
		stop();
		window.removeEventListener('resize', resize);

		// Dispose of geometry, material and textures
		geometry.dispose();
		if (material && typeof (material as THREE.Material).dispose === 'function') {
			(material as THREE.Material).dispose();
		}
		if (bgTexture && typeof (bgTexture as THREE.Texture).dispose === 'function') {
			(bgTexture as THREE.Texture).dispose();
		}
		renderer.dispose();

		disposed = true;
	}

	return { start, stop, dispose };
}
