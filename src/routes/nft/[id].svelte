<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import NFTDetail from '$lib/components/NFTDetail/index.svelte';
</script>

<svelte:head>
	<title>NFT Detail</title>
</svelte:head>

<Protected>
	<NFTDetail />
</Protected>
