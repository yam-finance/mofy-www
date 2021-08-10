<!-- src/lib/components/NFTCard/index.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { utils } from 'ethers';

	export let nft;
</script>

<li class="relative">
	<div
		class="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-gray-500 overflow-hidden"
	>
		<img src="" alt="" class="object-cover pointer-events-none group-hover:opacity-75" />
		<button
			type="button"
			on:click={() => goto(`/nft/${nft.id}`)}
			class="absolute inset-0 focus:outline-none"
		>
			<span class="sr-only">View details for {nft.id}</span>
		</button>
	</div>
	<p class="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
		YAM-PUNK.JPG
	</p>
	<a
		href={`/gallery/${utils.getAddress(nft.creatorAddress)}`}
		class="block text-sm font-medium text-gray-500"
		>{utils.getAddress(nft.creatorAddress).substring(0, 8)}</a
	>
</li>
