
<script lang="ts">
	import ThreeScroll from "$lib/ThreeScroll.svelte";
</script>

<ThreeScroll />

<main class="relative z-10 text-white">
	<section class="min-h-screen flex items-center justify-center">
		<div class="max-w-2xl text-center p-8 bg-black/40 rounded-lg backdrop-blur">
			<h1 class="text-5xl font-bold mb-4">Welcome — 3D Scroll</h1>
			<p class="text-lg opacity-90">Scroll down to move through a 3D scene powered by Three.js.</p>
		</div>
	</section>

	{#each Array.from({ length: 6 }) as _, i}
		<section class="min-h-screen flex items-center justify-center">
			<div class="max-w-2xl text-center p-8 bg-black/30 rounded-lg backdrop-blur">
				<h2 class="text-3xl font-semibold mb-2">Section {i + 1}</h2>
				<p class="opacity-90">Some content here — the camera will move as you scroll.</p>
			</div>
		</section>
	{/each}

	<section class="min-h-screen flex items-center justify-center">
		<div class="max-w-2xl text-center p-8 bg-black/40 rounded-lg backdrop-blur">
			<h2 class="text-3xl font-semibold mb-2">That's it</h2>
			<p class="opacity-90">Thanks for scrolling — want something different? Tell me what you want to tweak.</p>
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #05060a;
		color: white;
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
	}

	main { position: relative; z-index: 2; }

	section { padding: 6vh 1rem; }

	.backdrop-blur { backdrop-filter: blur(6px); }
</style>
