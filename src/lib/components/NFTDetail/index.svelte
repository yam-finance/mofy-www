<!-- src/lib/components/NFTDetail/index.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { syncWallet, syncProvider, selectedAccount } from '$lib/stores/web3-store';
	import { zkSyncNfts } from '$lib/stores/nft-store';
	import { binarySearch } from '$lib/utils';
	import { utils as zkUtils } from 'zksync';
	import { ethers } from 'ethers';
	import CID from 'cids';
	import Notification from '$lib/components/Notification/index.svelte';

	const id = Number($page.params.id);
	let nft;
	let metadata;
	let nftImage;
	let order;
	let loading = true;
	let owner;
	let sellAmount;
	let showNotification = false;
	let message = '';
	let verified;

	/**
	 * @notice These subscribers react on any changes related to the referenced variable
	 */
	$: {
		if ($selectedAccount) {
			getNFTInfo();
		}
	}

	/**
	 * @notice Get all information from the nft that we need
	 */
	const getNFTInfo = async () => {
		loading = true;
		owner = false;

		// @todo Move to store
		const state = await $syncProvider.getState($selectedAccount);
		const committedNFT = state.committed.nfts;

		zkSyncNfts.update((previous) => ({
			...previous,
			loading: false,
			nfts: Object.values(committedNFT)
		}));

		const mofyNFTs = [...$zkSyncNfts.whitelistedNFTs, ...$zkSyncNfts.nfts];

		// @todo Check why this object is empty sometimes
		console.log($zkSyncNfts.nfts);
		console.log($zkSyncNfts.whitelistedNFTs);
		console.log(mofyNFTs);

		const nftPosition = binarySearch(mofyNFTs, id);
		console.log(nftPosition);
		nft = await mofyNFTs[nftPosition];

		if (nft == undefined) {
			nft = await $syncProvider.getNFT(id);
		}

		console.log(nft);

		const contentHash = nft.contentHash;
		const ipfsHash = new CID(
			ethers.utils.arrayify('0x01711220' + contentHash.substring(2))
		).toString('base32');
		const ipfsLink = `https://ipfs.io/ipfs/${ipfsHash}/metadata.json`;
		console.log(ipfsLink);
		const res = await fetch(ipfsLink);

		metadata = await res.json();
		nftImage = 'https://ipfs.io/ipfs/' + metadata.image.slice(7);

		const orderRes = await fetch(`https://api.yam.finance/museum/orders/${id}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(`https://api.yam.finance/museum/orders/${id}`);

		const data = await orderRes.json();
		order = data.order == undefined ? false : data.order;

		// Check if selected address is the owner of the current nft
		for (const _nft in $zkSyncNfts.nfts) {
			if ($zkSyncNfts.nfts[_nft].id == nft.id) {
				owner = true;
				verified = await $syncWallet.getNFT(id, 'verified');
				if (verified == undefined) {
					message =
						"Your nft is not yet verified on the zkSync network, therefore you won't be able to publicly share this nft or sell / transfer it.";
					showNotification = true;
				}
			}
		}

		loading = false;
	};

	/**
	 * @notice Create a sell order in our db
	 */
	const setSellOrder = async () => {
		// @todo Move
		if (!(await $syncWallet.isSigningKeySet())) {
			if ((await $syncWallet.getAccountId()) == undefined) {
				throw new Error('Unknown account');
			}

			message = 'You need to register your account on zkSync first.';
			showNotification = true;

			// As any other kind of transaction, `ChangePubKey` transaction requires fee.
			// User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
			// the lowest possible amount.
			const changePubkey = await $syncWallet.setSigningKey({
				feeToken: 'ETH',
				ethAuthType: 'ECDSA'
			});

			// Wait until the tx is committed
			await changePubkey.awaitReceipt();
		}

		const _order = {
			tokenBuy: 'ETH',
			tokenSell: parseInt(nft.id),
			amount: 1,
			ratio: zkUtils.tokenRatio({
				ETH: sellAmount,
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

		const orderRes = await fetch(`https://api.yam.finance/museum/orders/${id}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		const data = await orderRes.json();
		order = data.order == undefined ? false : data.order;

		console.log(await res.json());
	};

	/**
	 * @notice Create a buy order in our db and execute the trade
	 */
	const setBuyOrder = async () => {
		// @todo Add loader when buying the nft
		// @todo Move
		if (!(await $syncWallet.isSigningKeySet())) {
			if ((await $syncWallet.getAccountId()) == undefined) {
				throw new Error('Unknown account');
			}

			message = 'You need to register your account on zkSync first.';
			showNotification = true;

			// As any other kind of transaction, `ChangePubKey` transaction requires fee.
			// User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
			// the lowest possible amount.
			const changePubkey = await $syncWallet.setSigningKey({
				feeToken: 'ETH',
				ethAuthType: 'ECDSA'
			});

			// Wait until the tx is committed
			await changePubkey.awaitReceipt();
		}

		const _order = {
			tokenSell: 'ETH',
			tokenBuy: parseInt(nft.id),
			amount: $syncProvider.tokenSet.parseToken('ETH', String(0.0003)),
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

	/**
	 * @notice Cancel a sell order by removing the db entry
	 */
	const cancelOrder = async () => {
		await fetch(`https://api.yam.finance/museum/orders/${id}`, {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			}
		});

		order = undefined;
	};
</script>

<!-- // @todo Add message that we only show verified messages on the explore page and you can also only share verified nft links with others -->

<div class="relative py-16 sm:py-24">
	<div class="mx-auto max-w-7xl px-16 grid grid-cols-2 gap-24 items-start lg:block">
		<div class="relative">
			<div class="relative mx-auto lg:mx-0 max-w-3xl">
				<!-- Testimonial card-->
				<div class="relative pb-10 overflow-hidden">
					{#if !loading}
						<img class="inset-0 w-full" src={nftImage} alt="NFT" />
					{/if}
					<div class="relative mt-4">
						<div class="mt-1 mx-0 flex items-center text-sm text-black dark:text-white opacity-50">
							<!-- @todo Check which address this is -->
							{#if loading}
								loading ...
							{:else}
								{nft.address.substring(0, 8)}
							{/if}
						</div>
						{#if loading}
							<p class="text-base text-md text-black dark:text-white">loading ...</p>
						{:else}
							<p class="text-base font-semibold text-md text-black dark:text-white">{nft.id}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="relative mx-auto lg:mx-0 lg:px-0 max-w-md px-4 sm:max-w-3xl">
			{#if loading}
				<h2 class="text-3xl text-black dark:text-white font-extrabold tracking-tight sm:text-4xl">
					loading ...
				</h2>
			{:else}
				<h2 class="text-4xl text-black dark:text-white font-bold md:text-3xl">
					{metadata.name}
				</h2>
			{/if}
			<div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-8">
				<div
					on:click={() => {
						if (!loading) goto(`/gallery/${nft.creatorAddress}`);
					}}
					class="flex items-center text-sm text-black dark:text-white opacity-50 cursor-pointer"
				>
					<!-- Heroicon name: solid/briefcase -->
					{#if loading}
						loading ...
					{:else}
						by {nft.creatorAddress}
					{/if}
				</div>
			</div>
			<div class="mt-6 space-y-6">
				{#if loading}
					<p class="text-lg text-black dark:text-white">loading ...</p>
				{:else}
					<p class="text-lg text-black dark:text-white">{metadata.description}</p>
				{/if}
			</div>

			<!-- Attributes section -->
			<div class="mt-10">
				<dl class="grid grid-cols-2 gap-x-4 gap-y-8">
					{#if !loading}
						{#each Object.keys(metadata.properties) as attribute}
							<div class="sm:col-span-1">
								<dt class="text-sm font-medium text-black dark:text-white opacity-50">
									{attribute}
								</dt>
								<dd class="mt-1 text-black dark:text-white">{metadata.properties[attribute]}</dd>
							</div>
						{/each}
					{/if}
				</dl>
				<!-- <div class="mt-10">
			<a href="#" class="text-base font-medium text-gray-600">Visit our metaverse space to <span aria-hidden="true">&rarr;</span> </a>
		  </div> -->
			</div>

			<div class="mt-10">
				<span class="relative z-0 inline-flex">
					{#if !loading}
						<!-- @todo check if nft.id exists in $zkSyncNfts.nfts -->
						{#if owner}
							{#if !order}
								{#if verified}
									<!-- set price -->
									<div>
										<label for="">Set a price</label>
										<div class="mt-1 mb-2 relative">
											<div
												class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
											>
												<span class="text-black dark:text-white sm:text-sm">
													{ethers.constants.EtherSymbol}
												</span>
											</div>
											<input
												type="text"
												bind:value={sellAmount}
												name="price"
												id="price"
												class="focus:ring-black dark:focus:ring-white placeholder-black dark:placeholder-white placeholder-opacity-30  focus:border-white block w-full pl-7 pr-12 sm:text-sm border-none bg-gray bg-opacity-20"
												placeholder="0.00"
											/>
											<div class="absolute inset-y-0 right-0 flex items-center">
												<label for="currency" class="sr-only">Currency</label>
												<select
													id="currency"
													name="currency"
													class="focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white block w-full sm:text-sm border-none bg-gray bg-opacity-0"
												>
													<option>ETH</option>
												</select>
											</div>
										</div>
										<button
											type="button"
											on:click|once={setSellOrder}
											class="items-center text-center px-8 py-4 w-full border border-transparent font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-white"
										>
											Set price
										</button>
									</div>
								{/if}
							{:else}
								<!-- cancel order -->
								<button
									type="button"
									on:click|once={cancelOrder}
									class="items-center text-center px-8 py-4 w-full border border-transparent font-medium shadow-sm dark:text-black text-white bg-black dark:bg-white hover:bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-white"
								>
									Cancel order {ethers.utils.formatEther(order['ratio'][1]) +
										ethers.constants.EtherSymbol}
								</button>
							{/if}
						{:else if !order}
							<!-- not for sale -->
							<p class="text-black dark:text-white">Not for sale</p>
						{:else}
							<!-- show price -->
							<button
								type="button"
								on:click|once={setBuyOrder}
								class="items-center text-center px-8 py-4 w-full border border-transparent font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-white"
							>
								Buy for {ethers.utils.formatEther(order['ratio'][1]) + ethers.constants.EtherSymbol}
							</button>
						{/if}
					{/if}
				</span>
			</div>
		</div>
	</div>
	<Notification on:close={() => (showNotification = false)} visible={showNotification} {message} />
</div>
