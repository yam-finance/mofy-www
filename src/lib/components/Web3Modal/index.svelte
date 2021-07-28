<!-- src/lib/components/Web3Modal/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { defaultChainStore, web3, connected } from '$lib/web3-store';

	let Web3Modal;
	let WalletConnectProvider;

	onMount(async () => {
		Web3Modal = window.Web3Modal.default;
		WalletConnectProvider = window.WalletConnectProvider.default;
	});

	const enable = async () => {
		let web3Modal = new Web3Modal({
			cacheProvider: false,
			providerOptions: {
				walletconnect: {
					package: WalletConnectProvider,
					options: {
						infuraId: '9aa3d95b3bc440fa88ea12eaa4456161'
					}
				}
			},
			disableInjectedProvider: false,
			theme: 'dark'
		});

		const provider = await web3Modal.connect();
		defaultChainStore.setProvider(provider);
	};

	const disconnect = async () => {
		defaultChainStore.disconnect();
	};
</script>

{#if $web3.version}
	<div class="buttons">
		{#if !$connected}
			<button class="button is-link is-light" on:click={enable}>connect using Web3Modal</button>
		{:else}
			<button class="button is-link is-light" on:click={disconnect}
				>disconnect using Web3Modal</button
			>
		{/if}
	</div>
{:else}
	<p>web3.js not found</p>
{/if}
