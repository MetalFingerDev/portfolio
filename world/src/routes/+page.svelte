<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { initScene } from '$lib';

	let canvas: HTMLCanvasElement | null = null;
	let sceneHandle: {
		start: () => void;
		stop: () => void;
		dispose: () => void;
	} | null = null;

	onMount(() => {
		if (!canvas) return;
		sceneHandle = initScene(canvas!);
		sceneHandle?.start();
	});

	onDestroy(() => {
		sceneHandle?.stop();
		sceneHandle?.dispose();
	});
</script>

<main>
	<div class="h-screen bg-yellow-500">hero</div>
	<canvas bind:this={canvas}></canvas>
</main>
