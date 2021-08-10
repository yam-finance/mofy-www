<!-- src/lib/components/DepositModal/index.svelte -->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { syncWallet, connected } from '$lib/stores/web3-store';
	import { fade } from 'svelte/transition';
	import { ethers } from 'ethers';

	export let visible;
	let amount;
	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	$: balanceL2 = $connected ? $syncWallet.getBalance('ETH') : '';

	onMount(async () => {});

	const deposit = async () => {
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
		class="fixed z-10 inset-0 overflow-y-auto"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
		>
			{#if visible}
				<div
					transition:fade
					class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					aria-hidden="true"
				/>
			{/if}

			<!-- This element is to trick the browser into centering the modal contents. -->
			<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
				>&#8203;</span
			>

			{#if visible}
				<div
					use:clickOutside={close}
					transition:fade
					class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
				>
					<form on:submit|preventDefault={deposit}>
						<div>
							<div class="mt-3 text-center sm:mt-5">
								<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
									Deposit ETH from L1 into L2
								</h3>
								<div class="mt-2">
									<p class="text-sm text-gray-500">
										To mint or buy an nft over the mofy app you need to have some ETH on zkSync L2.
									</p>
									<p class="mt-2 text-sm text-gray-500">
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
									<div class="mt-4 relative rounded-md shadow-sm">
										<div
											class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
										>
											<span class="text-gray-500 sm:text-sm">
												{ethers.constants.EtherSymbol}
											</span>
										</div>
										<input
											required
											type="text"
											bind:value={amount}
											name="price"
											id="price"
											class="focus:ring-gray-500 focus:border-gray-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
											placeholder="0.01"
										/>
										<div class="absolute inset-y-0 right-0 flex items-center">
											<label for="currency" class="sr-only">Currency</label>
											<select
												id="currency"
												name="currency"
												class="focus:ring-gray-500 focus:border-gray-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
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
								class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
							>
								Deposit
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}
