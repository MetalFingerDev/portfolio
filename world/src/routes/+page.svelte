<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { initScene } from '$lib';

	// `bind:this={canvas}` below gives us a reference to the real
	// <canvas> DOM element; we pass that element into `initScene` so
	// Three.js can render into it directly. We keep a small handle
	// (`sceneHandle`) so we can start/stop the loop and fully dispose
	// resources when the component is destroyed.
	let canvas: HTMLCanvasElement | null = null;
	let sceneHandle: {
		start: () => void;
		stop: () => void;
		dispose: () => void;
	} | null = null;

	// Initialize Three.js only on the client after the DOM is mounted.
	// `onMount` does not run during server-side rendering.

	// Create an attachment that observes element visibility and calls `onChange`.
	function createObserveAttachment(onChange: (visible: boolean) => void, threshold = 0.1) {
		return (node: HTMLElement) => {
			if (!('IntersectionObserver' in window)) {
				// Immediately notify visible if no IntersectionObserver support
				onChange(true);
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					const entry = entries[0];
					onChange(entry.isIntersecting);
				},
				{ threshold }
			);

			observer.observe(node);
			return () => observer.disconnect();
		};
	}

	function createCanvasRefAttachment() {
		return (node: HTMLCanvasElement) => {
			// Save the canvas reference and initialize Three.js here because
			// attachments run inside an effect and will run after `onMount`.
			canvas = node;

			// Initialize the scene and start the animation loop immediately
			// when the element is attached. Keep the handle so we can clean up
			// when the element is removed.
			sceneHandle = initScene(node);
			sceneHandle.start();

			return () => {
				// Stop and fully dispose the scene when the canvas is detached
				sceneHandle?.stop();
				sceneHandle?.dispose();
				if (canvas === node) canvas = null;
			};
		};
	}

	onMount(() => {
		// Initialization is handled by the {@attach} attachment so nothing
		// needs to run here. We keep `onMount` to make the lifecycle explicit.
	});

	// Clean up when the component is removed so WebGL contexts and
	// GPU resources are released.
	onDestroy(() => {
		sceneHandle?.stop();
		sceneHandle?.dispose();
	});
</script>

<main class="relative h-[200vh]">
	<div class="absolute z-10 h-screen w-screen bg-amber-300">hero</div>
	<canvas class="sticky z-0 top-0 h-full w-full" {@attach createCanvasRefAttachment()}></canvas>
</main>
