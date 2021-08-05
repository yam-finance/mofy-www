<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
	import { selectedAccount } from '$lib/stores/web3-store';
	// @todo Add types for artists.json
	import Artists from '$lib/config/artists';

</script>

<svelte:head>
	<title>Explore</title>
</svelte:head>

<Protected>
	<!-- @todo Replace with artists address array -->
	<Gallery accounts={Artists.addresses} />
</Protected>
