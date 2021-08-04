<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
	import { selectedAccount } from '$lib/stores/web3-store';
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<Gallery accounts={[$selectedAccount]} />
</Protected>
