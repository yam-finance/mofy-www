<!-- src/lib/components/Gallery/index.svelte -->
<script lang="ts">
	import {
		syncWallet,
		syncProvider,
		web3,
		connected,
		chainId,
		chainData
	} from '$lib/stores/web3-store';
	import { zkSyncNfts } from '$lib/stores/nft-store';
	import NFTCard from '$lib/components/NFTCard/index.svelte';

	export let accounts;
	let searchTerm = '';
	let filteredNFT = [];

	$: balanceL1 = $connected ? $web3.eth.getBalance(accounts[0]) : '';
	$: balanceL2 = $connected ? $syncWallet.getBalance('ETH') : '';
	$: {
		if (accounts) {
			getZkSyncNfts();
		}
	}
	$: {
		// @todo Check if term is equal to address and link to artist gallery
		if (searchTerm) {
			// @todo Update search after meeting
			filteredNFT = $zkSyncNfts.nfts.filter((nft) =>
				String(nft.id).toLowerCase().includes(searchTerm.toLowerCase())
			);
		} else {
			filteredNFT = [...$zkSyncNfts.nfts];
		}
	}

	/**
	 * @todo Check how this function behaves with a bigger gallery
	 * and add $zkSyncNfts.nfts.length == 0 check if necessary.
	 * @todo Add check so explore and personal galleries don't overwrite themselves
	 */
	export const getZkSyncNfts = async () => {
		zkSyncNfts.update((previous) => ({
			...previous,
			loading: true
		}));

		let committedNFT;

		for (const account of accounts) {
			const state = await $syncProvider.getState(account);
			committedNFT = { ...committedNFT, ...state.committed.nfts };
			// verifiedNFT = {...verifiedNFT, ...state.verified.nfts};
		}

		zkSyncNfts.update(() => ({
			loading: false,
			nfts: Object.values(committedNFT)
		}));
	};
</script>

<!-- <p>
	Connected chain: chainId = {$chainId}
</p>
<p>
	Selected account: {accounts[0] || 'not defined'}
</p>

<p>
	Balance on Ethereum {$chainData.network}:
	{#await balanceL1}
		<span>waiting...</span>
	{:then value}
		<span>{value}</span>
	{/await}
	{$chainData.nativeCurrency?.symbol}
</p>
<p>
	Balance on zkSync {$chainData.network}:
	{#await balanceL2}
		<span>waiting...</span>
	{:then value}
		<span>{value}</span>
	{/await}
	{$chainData.nativeCurrency?.symbol}
</p> -->

<input type="text" bind:value={searchTerm} placeholder="Searh for a specific nft id" />

<ul
	role="list"
	class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
>
	{#if $zkSyncNfts.loading && filteredNFT.length == 0}
		<p>loading ...</p>
	{:else}
		{#each filteredNFT as nft}
			<NFTCard {nft} />
		{/each}
	{/if}
</ul>
