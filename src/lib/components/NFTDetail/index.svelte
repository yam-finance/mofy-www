<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { syncWallet } from '$lib/stores/web3-store';
	import { zkSyncNfts } from '$lib/stores/nft-store';

	const id = Number($page.params.id);
	let nft;

	// @todo Check for a more suitable solution
	onMount(async () => {
		if ($zkSyncNfts.nfts.length == 0) {
			nft = await $syncWallet.getNFT(id, 'committed');
		} else {
			const nftPosition = binarySearch($zkSyncNfts.nfts, id);
			nft = await $zkSyncNfts.nfts[nftPosition];
		}
	});

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
		const potentialMatch = array[middle].id;

		if (target === potentialMatch) {
			return middle;
		} else if (target < potentialMatch) {
			return binarySearchHelper(array, target, left, middle - 1);
		} else {
			return binarySearchHelper(array, target, middle + 1, right);
		}
	}
</script>

{#if !nft}
	<p>loading ...</p>
{:else}
	<p>{nft.id}</p>
{/if}
