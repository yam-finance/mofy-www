<!-- src/lib/components/NFTGallery/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import {
		syncWallet,
		web3,
		connected,
		selectedAccount,
		chainId,
		chainData
	} from '$lib/web3-store';

	$: checkAccountL1 = $selectedAccount || '0x0000000000000000000000000000000000000000';
	$: balanceL1 = $connected ? $web3.eth.getBalance(checkAccountL1) : '';
	$: balanceL2 = $connected ? $syncWallet.getBalance('ETH', 'verified') : '';
	$: committedNFTList = '';
	$: verifiedNFTList = '';
	
	onMount(async () => {
		const state = await syncWallet.getAccountState(checkAccountL1);
		committedNFTList = state.committed.nfts
		verifiedNFTList = state.verified.nfts;
	});
</script>

<p>
	Connected chain: chainId = {$chainId}
</p>
<p>
	Selected account: {$selectedAccount || 'not defined'}
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
</p>
