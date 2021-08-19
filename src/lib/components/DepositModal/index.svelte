<!-- src/lib/components/DepositModal/index.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { syncWallet, connected } from '$lib/stores/web3-store';
	import { fade } from 'svelte/transition';
	import { ethers } from 'ethers';

	export let visible;
	let amount;
	let loading = false;
	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	$: balanceL2 = $connected ? $syncWallet.getBalance('ETH') : '';

	const deposit = async () => {
		loading = true;
		const deposit = await $syncWallet.depositToSyncFromEthereum({
			depositTo: $syncWallet.address(),
			token: 'ETH',
			amount: ethers.utils.parseEther(amount)
		});

		const depositReceipt = await deposit.awaitReceipt();
		console.log(depositReceipt);

		if (!(await $syncWallet.isSigningKeySet())) {
			if ((await $syncWallet.getAccountId()) == undefined) {
				throw new Error('Unknown account');
			}

			// As any other kind of transaction, `ChangePubKey` transaction requires fee.
			// User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
			// the lowest possible amount.
			const changePubkey = await $syncWallet.setSigningKey({
				feeToken: 'ETH',
				ethAuthType: 'ECDSA'
			});

			// Wait until the tx is committed
			await changePubkey.awaitReceipt();
		}

		loading = false;
		close();
	};

	// @todo Move to utils
	export function clickOutside(node, onEventFunction) {
		const handleClick = (event) => {
			var path = event.composedPath();

			if (!path.includes(node)) {
				onEventFunction();
			}
		};

		document.addEventListener('click', handleClick);

		return {
			destroy() {
				document.removeEventListener('click', handleClick);
			}
		};
	}
</script>

{#if visible}
	<div
		class="fixed z-10 inset-0 overflow-y-auto modal"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<div class="sm:flex sm:justify-center sm:items-end min-h-screen p-4 text-center block">
			{#if visible}
				<div
					transition:fade
					class="fixed inset-0 bg-gray bg-opacity-60 transition-opacity"
					aria-hidden="true"
				/>
			{/if}

			<!-- This element is to trick the browser into centering the modal contents. -->
			<span class="inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>

			{#if visible}
				<div
					use:clickOutside={close}
					transition:fade
					class="inline-block sm:align-bottom bg-white dark:bg-black p-16 sm:p-8 pt-12 text-left overflow-hidden shadow-xl transform transition-all my-8 align-middle max-w-sm w-full"
				>
					<form on:submit|preventDefault={deposit}>
						<div>
							<div class="mt-3 text-center">
								<h3
									class="text-lg leading-6 font-medium text-black dark:text-white"
									id="modal-title"
								>
									Deposit ETH from L1 into L2
								</h3>
								<div class="mt-2">
									<p class="text-sm text-black dark:text-white opacity-50 mb-8">
										To mint or buy an nft over the mofy app you need to have some ETH on zkSync L2.
									</p>
									<p class="mt-2 text-sm text-black dark:text-white">
										{#await balanceL2}
											<span>waiting...</span>
										{:then value}
											<span
												>Current L2 balance: {`${ethers.utils.formatEther(value)} ${
													ethers.constants.EtherSymbol
												}`}</span
											>
										{/await}
									</p>
								</div>

								<div>
									<div class="mt-4 relative">
										<div
											class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
										>
											<span class="text-black dark:text-white sm:text-sm">
												{ethers.constants.EtherSymbol}
											</span>
										</div>
										<input
											required
											type="text"
											bind:value={amount}
											name="price"
											id="price"
											class="focus:ring-white text-black dark:text-white placeholder-black dark:placeholder-white placeholder-opacity-30 focus:border-white block w-full pl-7 pr-12 sm:text-sm border-transparent bg-gray bg-opacity-20"
											placeholder="0.01"
										/>
										<div class="absolute inset-y-0 right-0 flex items-center">
											<label for="currency" class="sr-only">Currency</label>
											<select
												id="currency"
												name="currency"
												class="focus:ring-black dark:focus:ring-white dark:focus:border-white focus:border-black h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-black dark:text-white opacity-50 sm:text-sm"
											>
												<option>ETH</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="mt-5 sm:mt-6">
							<button
								type="submit"
								class="inline-flex justify-center w-full py-4 px-8 border border-transparent bg-black dark:bg-white text-base font-bold text-white dark:text-black hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white sm:text-sm"
							>
								{#if !loading}
									Deposit
								{:else}
									loading ..
								{/if}
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal {
		backdrop-filter: blur(16px);
	}
</style>
