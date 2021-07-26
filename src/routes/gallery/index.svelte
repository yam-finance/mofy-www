<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import NFTGallery from '$lib/components/NFTGallery/index.svelte';
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<NFTGallery />
</Protected>
