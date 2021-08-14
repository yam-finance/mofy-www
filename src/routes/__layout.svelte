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
		goto(path);
	});
</script>

<Header />

<main>
	<slot />
</main>

<style>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
