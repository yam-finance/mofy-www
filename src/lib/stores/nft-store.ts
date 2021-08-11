import { writable } from 'svelte/store';

export const zkSyncNfts = writable({
	loading: false,
	nfts: [],
	whitelistedNFTs: []
});
