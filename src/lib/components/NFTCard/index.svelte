<!-- src/lib/components/NFTCard/index.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { ethers } from 'ethers';
	import CID from 'cids';
	import Loading from '$lib/components/Loading/index.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let nft;
	let metadata;
	let nftImage;

	/**
	 * @notice These subscribers react on any changes related to the referenced variable
	 */
	$: {
		if (nft) {
			getNFTInfo();
		}
	}

	function dispatchLoaded() {
		dispatch('imgLoaded');
	}

	const getNFTInfo = async () => {
		const contentHash = nft.contentHash;
		const ipfsHash = new CID(
			ethers.utils.arrayify('0x01711220' + contentHash.substring(2))
		).toString('base32');
		const ipfsLink = `https://ipfs.io/ipfs/${ipfsHash}/metadata.json`;
		const res = await fetch(ipfsLink);

		metadata = await res.json();

		nftImage = 'https://ipfs.io/ipfs/' + metadata.image.slice(7);
	};
</script>

<div class="colc-item hover:bg-gray hover:bg-opacity-20">
	<a href={`/nft/${nft.id}`} class="block p-8 sm:px-0">
		<div
			class="group block w-full focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-gray-500 overflow-hidden"
		>
			{#if !nftImage}
				<div class="flex justify-center">
					<Loading />
				</div>
			{:else}
				<img src={nftImage} alt="NFT" class="pointer-events-none w-full" on:load={dispatchLoaded} />
			{/if}

			<button
				type="button"
				on:click={() => goto(`/nft/${nft.id}`)}
				class="text-black dark:text-white absolute inset-0 focus:outline-none"
			>
				<span class="sr-only">View details for {nft.id}</span>
			</button>
		</div>
		<div class="flex items-start border-b border-dashed border-black dark:border-white mt-2 py-2">
			<div class="line leading-tight flex-grow">
				{#if !metadata}
					<p class="my-0 block text-black dark:text-white opacity-50 truncate pointer-events-none">
						loading ipfs data ...
					</p>
				{:else}
					<p class="my-0 block text-black dark:text-white truncate pointer-events-none">
						{metadata.name}
					</p>
				{/if}
				<p class="block text-xs mb-2 font-medium text-black dark:text-white opacity-50">
					By {ethers.utils.getAddress(nft.creatorAddress).substring(0, 8)}
				</p>
			</div>
			<div class="w-5 h-5 border-r-2 border-t-2 border-black dark:border-white flex-shrink-0">
				<div class="ml-0.5 -mt-0.5">
					<div
						class="w-5 border-t border-b border-black dark:border-white -rotate-45 translate-y-2"
					/>
				</div>
			</div>
		</div>
	</a>
</div>
