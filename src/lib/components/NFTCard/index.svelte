<!-- src/lib/components/NFTCard/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ethers } from 'ethers';
	import CID from 'cids';
	import Loading from '$lib/components/Loading/index.svelte';

	export let nft;
	let metadata;
	let nftImage;

	// @todo Check for a more suitable solution
	onMount(async () => {
		const contentHash = nft.contentHash;
		const ipfsHash = new CID(
			ethers.utils.arrayify('0x01711220' + contentHash.substring(2))
		).toString('base32');
		const ipfsLink = `https://ipfs.io/ipfs/${ipfsHash}/metadata.json`;
		const res = await fetch(ipfsLink);

		metadata = await res.json();
		nftImage = 'https://ipfs.io/ipfs/' + metadata.image.slice(7);
	});
</script>

<li class="relative">
	<div
		class="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-gray-500 overflow-hidden"
	>
		{#if !nftImage}
            <div class="flex justify-center">
                <Loading />
            </div>
		{:else}
			<img
				src={nftImage}
				alt="NFT"
				class="object-cover pointer-events-none group-hover:opacity-75"
			/>
		{/if}
		<button
			type="button"
			on:click={() => goto(`/nft/${nft.id}`)}
			class="absolute inset-0 focus:outline-none"
		>
			<span class="sr-only">View details for {nft.id}</span>
		</button>
	</div>
	{#if !metadata}
		<p class="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
			loading Name ...
		</p>
	{:else}
		<p class="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
			{metadata.name}
		</p>
	{/if}

	<a
		href={`/gallery/${ethers.utils.getAddress(nft.creatorAddress)}`}
		class="block text-sm font-medium text-gray-500"
		>{ethers.utils.getAddress(nft.creatorAddress).substring(0, 8)}</a
	>
</li>
