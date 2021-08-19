<!-- src/lib/components/Protected/index.svelte -->
<script lang="ts">
	import { connected } from '$lib/stores/web3-store';

	$: auth = $connected;
</script>

{#if auth}
	<slot />
{:else}
	<slot name="unauthorized">
		<div class="flex justify-center">
			<h2 class="bg-gray bg-opacity-20 m-16 p-10 w-full text-center text-black dark:text-white">
				Please connect your wallet
			</h2>
		</div>
	</slot>
{/if}
