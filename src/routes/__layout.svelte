<!-- src/routes/__layout.svelte -->
<script lang="ts">
	import Header from '$lib/components/Header/index.svelte';
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
