<!-- src/lib/components/Protected/index.svelte -->
<script lang="ts">
	import { connected } from '$lib/web3-store';

	$: auth = $connected;
</script>

{#if auth}
	<slot />
{:else}
	<slot name="unauthorized">
		<div>Please connect to see your nfts</div>
	</slot>
{/if}
