<script lang="ts">
	import { page } from '$app/stores';
	import { syncWallet, syncProvider, web3, connected } from '$lib/stores/web3-store';
	import { zkSyncNfts } from '$lib/stores/nft-store';
	import Masonry from '$lib/components/Masonry/index.svelte';
	import Loading from '$lib/components/Loading/index.svelte';

	export let accounts;
	export let searchTerm = '';
	let filteredNFT = [];

	// $: balanceL1 = $connected ? $web3.eth.getBalance(accounts[0]) : '';
	// $: balanceL2 = $connected ? $syncWallet.getBalance('ETH') : '';
	$: nfts = $page.path == '/explore' ? $zkSyncNfts.whitelistedNFTs : $zkSyncNfts.nfts;
	$: {
		if (accounts) {
			getZkSyncNfts();
		}
	}
	$: {
		if (searchTerm) {
			if (searchTerm.lastIndexOf('x', 1)) {
				filteredNFT = nfts.filter((nft) =>
					String(nft.creatorAddress).toLowerCase().includes(searchTerm.toLowerCase())
				);
			} else {
				filteredNFT = nfts.filter((nft) =>
					String(nft.id).toLowerCase().includes(searchTerm.toLowerCase())
				);
			}
		} else {
			filteredNFT = [...nfts];
		}

		filteredNFT.sort((a, b) => a.creatorAddress.localeCompare(b.creatorAddress));

		filteredNFT = filteredNFT.filter(
			(nft) => ![99337, 99357, 99382, 99387, 99393, 99398, 99406].includes(nft.id)
		);
	}

	/**
	 * @todo Check how this function behaves with a bigger gallery
	 * and add $zkSyncNfts.nfts.length == 0 check if necessary.
	 */
	export const getZkSyncNfts = async () => {
		zkSyncNfts.update((previous) => ({
			loading: false,
			nfts: [],
			whitelistedNFTs: []
		}));

		let committedNFT;

		for (const account of accounts) {
			const state = await $syncProvider.getState(account);
			committedNFT = { ...committedNFT, ...state.committed.nfts };
			// verifiedNFT = {...verifiedNFT, ...state.verified.nfts};
		}

		if ($page.path == '/explore') {
			zkSyncNfts.update((previous) => ({
				...previous,
				loading: false,
				whitelistedNFTs: Object.values(committedNFT)
			}));
		} else {
			// @todo Move to store
			zkSyncNfts.update((previous) => ({
				...previous,
				loading: false,
				nfts: Object.values(committedNFT)
			}));
		}
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

<div class="px-8 sm:px-4">
	{#if $zkSyncNfts.loading && filteredNFT.length == 0}
		<div class="flex justify-center">
			<Loading />
		</div>
	{:else if filteredNFT.length > 0}
		<Masonry {filteredNFT} />
	{:else}
		<div class="flex justify-center">
			<div
				class="bg-gray bg-opacity-20 py-5 mx-0 w-full text-md text-center text-black dark:text-white"
			>
				Nothing found
			</div>
		</div>
	{/if}
</div>
