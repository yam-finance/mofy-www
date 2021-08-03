<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
</script>

<svelte:head>
	<title>Explore</title>
</svelte:head>

<Protected>
	<Gallery />
</Protected>
