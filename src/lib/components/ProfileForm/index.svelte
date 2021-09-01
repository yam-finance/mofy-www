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

	let profileRecord = { name: '', description: '' };
	let saving = false;
	$: committedETHBalanceL2 = $connected ? $syncWallet.getBalance('ETH') : '';
	$: ETHBalanceL1 = $connected ? $web3.eth.getBalance($selectedAccount) : '';

	onMount(async () => {
		profileRecord = await $idx.get('basicProfile');
	});

	async function updateProfile() {
		saving = true;
		await $idx.set('basicProfile', {
			name: profileRecord.name,
			description: profileRecord.description
		});
		saving = false;
	}
</script>

<div class="px-16 py-8 sm:py-16 sm:px-4 ">
	<div class="space-y-6">
		<div class=" shadow px-4 py-5 sm:rounded-lg sm:p-6">
			<div class="md:grid md:grid-cols-3 md:gap-6">
				<div class="md:col-span-1">
					<h3 class="text-lg font-medium leading-6 dark:text-white text-gray">Profile</h3>
					<p class="mt-1 text-sm dark:text-white text-gray">
						This profile information will be stored on ceramic and can later be viewed by others.
					</p>
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
				</div>
				<div class="mt-5 md:mt-0 md:col-span-2">
					<form class="space-y-6" on:submit|preventDefault={updateProfile}>
						<div class="grid grid-cols-3 gap-6">
							<div class="col-span-3 sm:col-span-2">
								<label
									for="company-website"
									class="block text-sm font-medium text-gray dark:text-white"
								>
									Name
								</label>
								<div class="mt-1 flex rounded-md shadow-sm">
									<input
										bind:value={profileRecord.name}
										maxlength="150"
										type="text"
										name="company-website"
										id="company-website"
										class="focus:ring-white-500 focus:border-white-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
										placeholder="Artist Name"
									/>
								</div>
							</div>
						</div>

						<div>
							<label for="about" class="block text-sm font-medium text-gray dark:text-white">
								Description
							</label>
							<div class="mt-1">
								<textarea
									bind:value={profileRecord.description}
									maxlength="420"
									id="about"
									name="about"
									rows="3"
									class="shadow-sm focus:ring-white-500 focus:border-white-500 block w-full sm:text-sm border border-gray-300 rounded-md"
									placeholder="Description about yourself"
								/>
							</div>
						</div>

						<button
							type="submit"
							class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black dark:text-white hover:bg-white-700"
						>
							{#if !saving}
								Save
							{:else}
								Saving ...
							{/if}
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
