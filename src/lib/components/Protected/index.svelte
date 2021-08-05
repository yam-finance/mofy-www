<!-- src/lib/components/Protected/index.svelte -->
<script lang="ts">
	import { connected } from '$lib/stores/web3-store';

	$: auth = $connected;
</script>

{#if auth}
	<slot />
{:else}
	<slot name="unauthorized">
		<div>Please connect your wallet</div>
	</slot>
{/if}
