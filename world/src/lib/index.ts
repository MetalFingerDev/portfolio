// place files you want to import through the `$lib` alias in this folder.

import * as THREE from 'three';

export function initScene(canvas: HTMLCanvasElement) {
	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({ canvas });

	renderer.setPixelRatio(window.devicePixelRatio);
	const resize = () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	};
	resize();

	camera.position.setZ(30);
	camera.position.setX(-3);

	const pointLight = new THREE.PointLight(0xffffff);

	scene.add(pointLight);
	scene.background = new THREE.TextureLoader().load('space.jpg');

	window.addEventListener('resize', resize);

	function start() {}

	function stop() {}

	function dispose() {
		renderer.dispose();
	}

	return { start, stop, dispose };
}
