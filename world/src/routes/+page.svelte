<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { initScene } from '$lib';
	let canvas: HTMLCanvasElement | null = null;
	let sceneHandle: {
		start: () => void;
		stop: () => void;
		dispose: () => void;
	} | null = null;

	function createCanvasRefAttachment() {
		return (node: HTMLCanvasElement) => {
			canvas = node;
			sceneHandle = initScene(node);
			sceneHandle.start();

			return () => {
				sceneHandle?.stop();
				sceneHandle?.dispose();
				if (canvas === node) canvas = null;
			};
		};
	}

	onMount(() => {
	});
	onDestroy(() => {
		sceneHandle?.stop();
		sceneHandle?.dispose();
	});
</script>

<main class="relative h-[200vh]">
	<div class="absolute z-10 h-screen w-screen bg-amber-300">hero</div>
	<canvas class="sticky z-0 top-0" {@attach createCanvasRefAttachment()}></canvas>
</main>
