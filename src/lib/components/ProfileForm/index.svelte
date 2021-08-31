<script lang="ts">
	import { onMount } from 'svelte';
	import {
		selectedAccount,
		idx,
		chainData,
		syncWallet,
		web3,
		connected
	} from '$lib/stores/web3-store';
	import { ethers } from 'ethers';

	let profileRecord = {};
	$: committedETHBalanceL2 = $connected ? $syncWallet.getBalance('ETH') : '';
	$: ETHBalanceL1 = $connected ? $web3.eth.getBalance($selectedAccount) : '';

	onMount(async () => {
		profileRecord = await $idx.get('basicProfile');
	});

	const updateProfile = async () => {
		await $idx.set('basicProfile', {
			name: 'Test'
		});
	};
</script>

<div>
	<div class="px-16 py-8 sm:py-16 sm:px-4 ">
		<div>
			<h3 class="text-3xl font-bold text-black dark:text-white mb-2 text-bold">
				Your Profile Settings
			</h3>
			<span class="text-black dark:text-white opacity-50">
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
				<p class="text-black dark:text-white opacity-50">
					Name: {profileRecord['name']}
				</p>
			</span>
		</div>
	</div>
</div>
