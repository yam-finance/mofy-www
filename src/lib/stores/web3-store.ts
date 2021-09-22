import chains from '../config/chains.json';
import { derived, writable } from 'svelte/store';
import * as zksync from 'zksync';
import { ethers } from 'ethers';
import { zkSyncNfts } from '$lib/stores/nft-store';
import KeyDidResolver from 'key-did-resolver';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { DID } from 'dids';
import { IDX } from '@ceramicstudio/idx';

const CERAMIC_API_URL = 'https://ipfs-ceramic-elp.yam.finance';

const getGlobalObject = () => {
	if (typeof globalThis !== 'undefined') {
		return globalThis;
	}
	if (typeof self !== 'undefined') {
		return self;
	}
	if (typeof window !== 'undefined') {
		return window;
	}
	if (typeof global !== 'undefined') {
		return global;
	}
	throw new Error('cannot find the global object');
};

export let Web3 = {};

export const loadWeb3 = () => {
	if (Web3.version) return;
	try {
		Web3 = getGlobalObject().Web3 || {};
	} catch (err) {
		console.error('no globalThis.Web3 object');
	}
};

const getWindowEthereum = () => {
	try {
		if (getGlobalObject().ethereum) return getGlobalObject().ethereum;
	} catch (err) {
		console.error('no globalThis.ethereum object');
	}
};

export const createStore = () => {
	const { subscribe, update, set } = writable({
		connected: false,
		accounts: []
	});

	const init = () => {
		loadWeb3();
		if (!Web3.version) throw new Error('Cannot find Web3');
		if (getWindowEthereum()) getWindowEthereum().autoRefreshOnNetworkChange = false;
	};

	const setProvider = async (provider, callback?) => {
		init();
		const instance = new Web3(provider);
		const chainId = await instance.eth.getChainId();
		/// @dev Derive zksync.Signer from ethereum wallet.
		const chainData = getData(chainId);
		const ethersProvider = new ethers.providers.Web3Provider(provider);
		const signer = ethersProvider.getSigner();
		const syncProvider = await zksync.getDefaultProvider(chainData.network);
		const syncWallet = await zksync.Wallet.fromEthSigner(signer, syncProvider);
		// no account with ganache
		const accounts = /127/.test(provider) ? [] : await instance.eth.getAccounts();
		if (callback) {
			instance._provider.removeListener('accountsChanged', () => setProvider(provider, true));
			instance._provider.removeListener('chainChanged', () => setProvider(provider, true));
		} else {
			if (instance._provider && instance._provider.on) {
				instance._provider.on('accountsChanged', () => setProvider(provider, true));
				instance._provider.on('chainChanged', () => setProvider(provider, true));
			}
		}

		zkSyncNfts.update((previous) => ({
			...previous,
			loading: false,
			nfts: []
		}));

		const { ThreeIdConnect, EthereumAuthProvider } = await import('@3id/connect');
		const CeramicClient = (await import('@ceramicnetwork/http-client')).default;
		const threeIdConnect = new ThreeIdConnect();
		/// @dev Ceramic uses @eip155:1
		const authProvider = new EthereumAuthProvider(provider, accounts[0].toLowerCase());
		await threeIdConnect.connect(authProvider);
		const didProvider = await threeIdConnect.getDidProvider();
		const ceramic = new CeramicClient(CERAMIC_API_URL);
		const resolver = { ...KeyDidResolver.getResolver(), ...ThreeIdResolver.getResolver(ceramic) };
		const did = new DID({ resolver });
		ceramic.did = did;
		ceramic.did.setProvider(didProvider);
		await ceramic.did.authenticate();
		const idx = new IDX({ ceramic });

		// console.log(`${accounts[0].toLowerCase()}@eip155:1`);
		// const { Caip10Link } = (await import('@ceramicnetwork/stream-caip10-link'));
		// const caip10 = await Caip10Link.fromAccount(ceramic, `${accounts[0].toLowerCase()}@eip155:1`);
		// const accountDid = caip10.did;
		// console.log(accountDid);

		update(() => ({
			idx,
			signer,
			syncWallet,
			ethersProvider,
			syncProvider,
			provider,
			providerType: 'String',
			connected: true,
			chainId,
			accounts,
			instance
		}));
	};

	// const setBrowserProvider = async () => {
	// 	init();
	// 	if (!getWindowEthereum())
	// 		throw new Error('Please autorized browser extension (Metamask or similar)');
	// 	const res = await getWindowEthereum().request({ method: 'eth_requestAccounts' });
	// 	getWindowEthereum().on('accountsChanged', setBrowserProvider);
	// 	getWindowEthereum().on('chainChanged', setBrowserProvider);
	// 	update(() => ({
	// 		provider: getWindowEthereum(),
	// 		providerType: 'Browser',
	// 		connected: true,
	// 		chainId: getWindowEthereum().chainId,
	// 		accounts: res,
	// 		instance: new Web3(getWindowEthereum())
	// 	}));
	// };

	const disconnect = async (provider) => {
		if (provider && provider.disconnect) {
			await provider.disconnect();
		}

		zkSyncNfts.update(() => ({
			loading: false,
			nfts: [],
			whitelistedNFTs: []
		}));

		update(() => ({
			connected: false,
			accounts: []
		}));
	};

	return {
		// setBrowserProvider,
		setProvider,
		disconnect,
		subscribe
	};
};

const allStores = {};

const noData = { rpc: [], faucets: [], nativeCurrency: {} };

const getData = (id) => {
	if (!id || !Web3.utils) return noData;
	if (Web3.utils.isHexStrict(id)) id = Web3.utils.hexToNumber(id);
	for (const data of chains) {
		if (data.chainId === id) return data;
	}
	return noData;
};

export const makeChainStore = (name) => {
	const ethStore = (allStores[name] = createStore());

	allStores[name].connected = derived(ethStore, ($ethStore) => $ethStore.connected);
	allStores[name].chainId = derived(ethStore, ($ethStore) => $ethStore.chainId);
	allStores[name].providerType = derived(ethStore, ($ethStore) => $ethStore.providerType);
	allStores[name].syncWallet = derived(ethStore, ($ethStore) => $ethStore.syncWallet);
	allStores[name].syncProvider = derived(ethStore, ($ethStore) => $ethStore.syncProvider);
	allStores[name].ethersProvider = derived(ethStore, ($ethStore) => $ethStore.ethersProvider);
	allStores[name].signer = derived(ethStore, ($ethStore) => $ethStore.signer);
	allStores[name].idx = derived(ethStore, ($ethStore) => $ethStore.idx);
	allStores[name].selectedAccount = derived(ethStore, ($ethStore) => {
		if ($ethStore.connected) return $ethStore.accounts.length ? $ethStore.accounts[0] : null;
		return null;
	});

	allStores[name].walletType = derived(ethStore, ($ethStore) => {
		if (!$ethStore.provider) return null;
		if (typeof $ethStore.provider === 'string') return $ethStore.provider;
		if ($ethStore.provider.isMetaMask) return 'MetaMask (or compatible)';
		if ($ethStore.provider.isNiftyWallet) return 'Nifty';
		if ($ethStore.provider.isTrust) return 'Trust';
		return 'Unknown';
	});

	allStores[name].web3 = derived(ethStore, ($ethStore) => {
		if (!$ethStore.instance) return { utils: Web3.utils, version: Web3.version };
		return $ethStore.instance;
	});

	allStores[name].chainData = derived(ethStore, ($ethStore) =>
		$ethStore.chainId ? getData($ethStore.chainId) : {}
	);

	return allStores[name];
};

export const getChainStore = (name) => {
	if (!allStores[name]) throw new Error(`chain store ${name} does not exist`);
	return allStores[name];
};

export const makeContractStore = (abi, address, defaults = {}) =>
	derived([web3, connected], ([$web3, $connected]) => {
		if ($connected && $web3.eth) {
			return new $web3.eth.Contract(abi, address, defaults);
		}
		return null;
	});

loadWeb3();

export const defaultChainStore = makeChainStore('default');
export const connected = allStores.default.connected;
export const chainId = allStores.default.chainId;
export const providerType = allStores.default.providerType;
export const syncWallet = allStores.default.syncWallet;
export const syncProvider = allStores.default.syncProvider;
export const ethersProvider = allStores.default.ethersProvider;
export const signer = allStores.default.signer;
export const selectedAccount = allStores.default.selectedAccount;
export const walletType = allStores.default.walletType;
export const web3 = allStores.default.web3;
export const chainData = allStores.default.chainData;
export const idx = allStores.default.idx;
