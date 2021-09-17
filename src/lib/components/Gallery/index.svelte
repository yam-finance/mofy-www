<script lang="ts">
	import { page } from '$app/stores';
	import { connected, syncProvider } from '$lib/stores/web3-store';
	import { zkSyncNfts } from '$lib/stores/nft-store';
	import Masonry from '$lib/components/Masonry/index.svelte';
	import Loading from '$lib/components/Loading/index.svelte';
	import * as zksync from 'zksync';

	export let accounts;
	export let searchTerm = '';
	let filteredNFT = [];

	/**
	 * @notice These subscribers react on any changes related to the referenced variable
	 */
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

		/// @notice Display nfts randomly
		filteredNFT.sort(() => Math.random() - 0.5);

		/// @notice Remove certain nft ids
		filteredNFT = filteredNFT.filter(
			(nft) => ![99337, 99357, 99382, 99387, 99393, 99398, 99406, 115226].includes(nft.id)
		);
	}

	/**
	 * @todo Check how this function behaves with a bigger gallery
	 * and add $zkSyncNfts.nfts.length == 0 check if necessary.
	 */
	export const getZkSyncNfts = async () => {
		if (nfts.length == 0) {
			zkSyncNfts.update((previous) => ({
				...previous,
				loading: true
			}));
		}

		const provider = $connected ? $syncProvider : await zksync.getDefaultProvider('mainnet');
		let committedNFT;

		/**
		 * @dev The tx of a verified NFT has already been mined on L1, while committed means that it has not yet been mined
		 */
		for (const account of accounts) {
			const state = await provider.getState(account);
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
			zkSyncNfts.update((previous) => ({
				...previous,
				loading: false,
				nfts: Object.values(committedNFT)
			}));
		}
	};
</script>

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
