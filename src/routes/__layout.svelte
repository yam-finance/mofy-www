<!-- src/routes/__layout.svelte -->
<script context="module">
	export const load = ({ page }) => {
		const path = page.path;

		return {
			props: {
				path: path
			}
		};
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header/index.svelte';

	export let path;

	onMount(async () => {
		// @todo Test with netlify adapter
		// goto(path)
		goto(window.location.href);
	});
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
</style>
