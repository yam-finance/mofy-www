<script lang="ts">
	import { page } from '$app/stores'
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
	import { selectedAccount } from '$lib/stores/web3-store';

	const address = $page.params.address || $selectedAccount;
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<Gallery accounts={[address]} />
</Protected>
