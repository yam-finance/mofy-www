<script lang="ts">
	import { page } from '$app/stores';
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<Gallery accounts={[$page.params.address]} />
</Protected>
