<script lang="ts">
	import { page } from '$app/stores';
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
	import { selectedAccount, chainData, syncWallet, web3, connected } from '$lib/stores/web3-store';
	import { ethers } from 'ethers';

	const address = ethers.utils.getAddress($page.params.address)

	$: committedETHBalanceL2 = $connected ? $syncWallet.getBalance("ETH") : '';
	$: ETHBalanceL1 = $connected ? $web3.eth.getBalance($selectedAccount) : '';
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<div>
		<div class="px-16 py-8 sm:py-16 sm:px-4 ">
			<div>
				<h3 class="text-3xl font-bold text-black dark:text-white mb-2 text-bold">
					{#if address == $selectedAccount}
						Your Personal Gallery
					{:else}
						Artist Gallery
					{/if}
				</h3>
				<span class="text-black dark:text-white opacity-50">
					{#if address == $selectedAccount}
						<p class="text-black dark:text-white opacity-50">
							Balance on Ethereum {$chainData.network}:
							{#await ETHBalanceL1}
								<span>waiting...</span>
							{:then value}
								<span>{ethers.utils.formatEther(value).substring(0, 8)}</span>
							{/await}
							{$chainData.nativeCurrency?.symbol}
						</p>
						<p class="text-black dark:text-white opacity-50">
							Balance on zkSync {$chainData.network}:
							{#await committedETHBalanceL2}
								<span>waiting...</span>
							{:then value}
								<span>{ethers.utils.formatEther(value).substring(0, 8)}</span>
							{/await}
							{$chainData.nativeCurrency?.symbol}
						</p>
					{:else}
						The MoFY NFTs of the artists wallet
					{/if}
				</span>
			</div>
		</div>
	</div>

	<div class="px-8 py-8 sm:py-16 sm:px-4">
		<Gallery accounts={[address]} />
	</div>
</Protected>
