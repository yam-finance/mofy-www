<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { syncWallet, syncProvider, selectedAccount } from '$lib/stores/web3-store';
	import { zkSyncNfts } from '$lib/stores/nft-store';
	import { utils as zkUtils } from 'zksync';
	import { ethers } from 'ethers';
	import CID from 'cids';

	const id = Number($page.params.id);
	let nft;
	let metadata;
	let nftImage;
	let order;
	let loading = true;

	// @todo Check for a more suitable solution
	onMount(async () => {
		loading = true;
		const mofyNFTs = [...$zkSyncNfts.whitelistedNFTs, ...$zkSyncNfts.nfts];

		// @todo Check why this object is empty sometimes
		console.log($zkSyncNfts.nfts)
		console.log($zkSyncNfts.whitelistedNFTs)
		console.log(mofyNFTs)

		if (mofyNFTs.length == 0) {
			nft = await $syncWallet.getNFT(id, 'committed');
		} else {
			const nftPosition = binarySearch(mofyNFTs, id);
			console.log(nftPosition)
			nft = await mofyNFTs[nftPosition];
		}

		console.log(nft);

		const contentHash = nft.contentHash;
		const ipfsHash = new CID(
			ethers.utils.arrayify('0x01711220' + contentHash.substring(2))
		).toString('base32');
		const ipfsLink = `https://ipfs.io/ipfs/${ipfsHash}/metadata.json`;
		console.log(ipfsLink)
		const res = await fetch(ipfsLink);

		metadata = await res.json();
		nftImage = 'https://ipfs.io/ipfs/' + metadata.image.slice(7);

		const orderRes = await fetch(`https://api.yam.finance/museum/orders/${id}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(`https://api.yam.finance/museum/orders/${id}`)

		const data = await orderRes.json();
		order = data.order == undefined ? false : data.order;

		loading = false;
	});

	const setSellOrder = async () => {
		const _order = {
			tokenBuy: 'ETH',
			tokenSell: parseInt(nft.id),
			amount: 1,
			ratio: zkUtils.tokenRatio({
				ETH: 0.0003,
				[parseInt(nft.id)]: 1
			})
		};

		const sellOrder = await $syncWallet.getOrder(_order);
		console.log(sellOrder);

		const res = await fetch(`https://api.yam.finance/museum/orders/${id}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(sellOrder)
		});

		order = JSON.stringify(sellOrder);

		console.log(await res.json());
	};

	const setBuyOrder = async () => {
		console.log(order.ratio[String(order.tokenBuy)])

		const _order = {
			tokenSell: 'ETH',
			tokenBuy: parseInt(nft.id),
			amount: $syncProvider.tokenSet.parseToken(
				'ETH',
				String(0.0003)
			),
			ratio: zkUtils.tokenRatio({
				ETH: 0.0003,
				[parseInt(nft.id)]: 1
			})
		};

		const buyOrder = await $syncWallet.getOrder(_order);

		const swap = await $syncWallet.syncSwap({
			orders: [buyOrder, order],
			feeToken: 'ETH'
		});

		const receipt = await swap.awaitReceipt();
		console.log(receipt);

		await cancelOrder();
	};

	const cancelOrder = async () => {
		await fetch(`https://api.yam.finance/museum/orders/${id}`, {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			}
		});

		order = undefined;
	};

	// @todo Move to utils
	export function binarySearch(array: object[], target: number) {
		return binarySearchHelper(array, target, 0, array.length - 1);
	}

	function binarySearchHelper(
		array: object[],
		target: number,
		left: number,
		right: number
	): number {
		if (left > right) return -1;

		const middle = Math.floor((left + right) / 2);
		const potentialMatch = array[middle]['id'];

		if (target === potentialMatch) {
			return middle;
		} else if (target < potentialMatch) {
			return binarySearchHelper(array, target, left, middle - 1);
		} else {
			return binarySearchHelper(array, target, middle + 1, right);
		}
	}
</script>

<div class="relative bg-white py-16 sm:py-24">
	<div class="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:gap-24 lg:items-start">
		<div class="relative sm:py-16 lg:py-0">
			<div
				class="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0 lg:max-w-none lg:py-20"
			>
				<!-- Testimonial card-->
				<div class="relative pt-64 pb-10 rounded-2xl shadow-xl overflow-hidden">
					{#if loading}
						<img class="absolute inset-0 h-full w-full object-cover" src="" alt="loading NFT ..." />
					{:else}
						<img class="absolute inset-0 h-full w-full object-cover" src={nftImage} alt="NFT" />
					{/if}
					<div class="absolute inset-0 bg-gray-500 mix-blend-multiply" />
					<div class="absolute inset-0 bg-gradient-to-t from-gray-600 via-gray-600 opacity-90" />
					<div class="relative px-8">
						<blockquote class="mt-8">
							<footer class="mt-4">
								{#if loading}
									<p class="text-base font-semibold text-gray-200">loading ...</p>
								{:else}
									<p class="text-base font-semibold text-gray-200">{nft.id}</p>
								{/if}
							</footer>
						</blockquote>
					</div>
				</div>
			</div>
		</div>

		<div class="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0">
			<!-- Content area -->
			<div class="pt-12 sm:pt-16 lg:pt-20">
				{#if loading}
					<h2 class="text-3xl text-gray-900 font-extrabold tracking-tight sm:text-4xl">
						loading ...
					</h2>
				{:else}
					<h2 class="text-3xl text-gray-900 font-extrabold tracking-tight sm:text-4xl">
						{metadata.name}
					</h2>
				{/if}
				<div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-8">
					<div class="mt-2 flex items-center text-sm text-gray-500">
						<!-- Heroicon name: solid/briefcase -->
						<svg
							class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
								clip-rule="evenodd"
							/>
							<path
								d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"
							/>
						</svg>
						{#if loading}
							loading ...
						{:else}
							{nft.creatorAddress.substring(0, 8)}
						{/if}
					</div>
					<div class="mt-2 flex items-center text-sm text-gray-500">
						<!-- Heroicon name: solid/location-marker -->
						<svg
							class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
								clip-rule="evenodd"
							/>
						</svg>
						<!-- @todo Check which address this is -->
						{#if loading}
							loading ...
						{:else}
							{nft.address.substring(0, 8)}
						{/if}
					</div>
				</div>
				<div class="mt-6 text-gray-500 space-y-6">
					{#if loading}
						<p class="text-lg">loading ...</p>
					{:else}
						<p class="text-lg">{metadata.description}</p>
					{/if}
				</div>
			</div>

			<!-- Attributes section -->
			<div class="mt-10">
				<dl class="grid grid-cols-2 gap-x-4 gap-y-8">
					{#if !loading}
						{#each Object.keys(metadata.properties) as attribute}
							<div class="sm:col-span-1">
								<dt class="text-sm font-medium text-gray-500">{attribute}</dt>
								<dd class="mt-1 text-sm text-gray-900">{metadata.properties[attribute]}</dd>
							</div>
						{/each}
					{/if}
				</dl>
				<!-- <div class="mt-10">
			<a href="#" class="text-base font-medium text-gray-600">Visit our metaverse space to <span aria-hidden="true">&rarr;</span> </a>
		  </div> -->
			</div>

			<div class="mt-10">
				<span class="relative z-0 inline-flex shadow-sm rounded-md">
					{#if !loading}
						{#if ethers.utils.getAddress(nft.creatorAddress) == $selectedAccount}
							{#if !order}
								<!-- set price -->
								<button
									type="button"
									class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
								>
									currently not for sale
								</button>
								<button
									type="button"
									on:click={setSellOrder}
									class="-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
								>
									set price
								</button>
							{:else}
								<!-- cancel order -->
								<button
									type="button"
									on:click={cancelOrder}
									class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
								>
									cancel order
								</button>
								<button
									type="button"
									class="-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
								>
									{order.ratio[String(order.tokenBuy)] + ethers.constants.EtherSymbol}
								</button>
							{/if}
						{:else if !order}
							<!-- not for sale -->
							<p>not for sale</p>
						{:else}
							<!-- show price -->
							<button
								type="button"
								on:click={setBuyOrder}
								class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
							>
								buy for
							</button>
							<button
								type="button"
								class="-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
							>
								{order.ratio[String(order.tokenBuy)] + ethers.constants.EtherSymbol}
							</button>
						{/if}
					{/if}
				</span>
			</div>
		</div>
	</div>
</div>
