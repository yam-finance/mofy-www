import { writable } from 'svelte/store';

export const createStore = () => {
	const { subscribe, update, set } = writable({
		loading: false,
		nfts: [],
		whitelistedNFTs: []
	});

	return {
		subscribe
	};
};

export const zkSyncNfts = writable({
	loading: false,
	nfts: [],
	whitelistedNFTs: []
});
