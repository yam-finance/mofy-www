<!-- src/routes/__layout.svelte -->
<script lang="ts">
	import Header from '$lib/components/Header/index.svelte';
</script>

<Header />

<main>
	<slot />
</main>

<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	body {
		background-color: white;
		text-color: black;
	}

	@media (prefers-color-scheme: dark) {
		body {
			background-color: black;
			text-color: white;
		}
	}

	* {
		transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
		-webkit-transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	p {
		@apply text-white;
	}
</style>
