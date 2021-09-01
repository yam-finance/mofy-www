<!-- src/lib/components/Mint/index.svelte -->
<script lang="ts">
	import DepositModal from '$lib/components/DepositModal/index.svelte';
	import Notification from '$lib/components/Notification/index.svelte';
	import { syncWallet, syncProvider, chainId } from '$lib/stores/web3-store';
	import { NFTStorage, File } from 'nft.storage';
	import CID from 'cids';
	import { ethers } from 'ethers';
	import Placeholder from "../../../../static/empty-nft.png"

	let txFee;
	let amount;
	let attributeName = '';
	let propertyValues = {};
	let attributes = {};
	let files;
	let description = '';
	let name = '';
	let recipientAddress = $syncWallet.address();
	let showModal = false;
	let showNotification = false;
	let message = '';
	let loading = false;
	let imageFile;

	/**
	 * @notice These subscribers react on any changes related to the referenced variable
	 */
	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		// console.log(files);

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`);
		}
	}

	/// @todo Move to utils
	async function zkExplorer(_networkId: number) {
		if (_networkId === 1) {
			return 'https://zkscan.io/explorer/transactions/';
		} else if (_networkId === 4) {
			return 'https://rinkeby.zkscan.io/explorer/transactions/';
		}
	}

	const updateImage = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			imageFile = e.target.result;
		};
	};

	const addAttribute = async () => {
		if (!attributes[attributeName]) {
			attributes = { ...attributes, [attributeName]: '' };
		}

		attributeName = '';
	};

	const updateAttribute = async (_attributeName: string) => {
		if (_attributeName != undefined) {
			attributes[_attributeName] = propertyValues[_attributeName];
		}
	};

	const removeAttribute = async (_attributeName: string) => {
		if (_attributeName != undefined) {
			delete attributes[_attributeName];
			attributes = attributes;
		}
	};

	// @todo Move partly to modal component
	const mint = async () => {
		let customError = '';

		if (!files) {
			customError = 'Please upload a photo to your nft';
		}

		try {
			loading = true;
			const feeToken = 'ETH';
			const { totalFee: fee } = await $syncProvider.getTransactionFee(
				'MintNFT',
				recipientAddress,
				feeToken
			);

			txFee = fee;

			const accountETHBalance = await $syncWallet.getBalance('ETH');

			// @todo Open modal to onboard the user
			if (txFee.gte(accountETHBalance)) {
				customError = 'You have to register your account on zkSync first in order to mint.';
			}

			if (!(await $syncWallet.isSigningKeySet())) {
				if ((await $syncWallet.getAccountId()) == undefined) {
					customError = 'Unknown account';
				}

				message = 'You need to register your account on zkSync first.';
				showNotification = true;

				// @todo Open Modal to tell the user what to do and continue on the modal

				// As any other kind of transaction, `ChangePubKey` transaction requires fee.
				// User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
				// the lowest possible amount.
				const changePubkey = await $syncWallet.setSigningKey({
					feeToken: 'ETH',
					ethAuthType: 'ECDSA'
				});

				// Wait until the tx is committed
				await changePubkey.awaitReceipt();

				showNotification = false;
			}

			const client = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE_API_KEY as string });

			const metadata = await client.store({
				name,
				description,
				image: new File([files[0]], files[0].name, { type: 'image/png' }),
				properties: attributes
			});

			const array = new CID(metadata.ipnft).bytes;
			const contentHash = '0x' + ethers.utils.hexlify(array).substring(10);
			const nft = await $syncWallet.mintNFT({
				recipient: recipientAddress,
				contentHash,
				feeToken: feeToken,
				fee
			});

			const zkScanURL = await zkExplorer($chainId);
			message = `${zkScanURL}${nft.txHash.substring(8)}`;
			showNotification = true;

			const receipt = await nft.awaitReceipt();

			console.log('Fee', fee);
			console.log('NFT', nft);
			console.log('TxReceipt', receipt);
			console.log(nft.txHash.substring(8));
			loading = false;
			amount = null;
			attributeName = '';
			propertyValues = {};
			attributes = {};
			files = null;
			description = '';
			name = '';
		} catch (err) {
			message = `${customError} ${err}`;
			showNotification = true;
			loading = false;
			amount = null;
			attributeName = '';
			propertyValues = {};
			attributes = {};
			files = null;
			description = '';
			name = '';
		}
	};
</script>

<!-- @todo make attribute name editable
     @todo modal should close after depositing and loading finishing
	 @todo Page not found when pasting the wrong address
	 @todo Create order endpoints -->

<!-- TODO Pass txFee to Modal as a prop -->
<div class="relative px-8 sm:px-0">
	<div class="absolute inset-0">
		<div class="absolute inset-y-0 left-0 w-1/2" />
	</div>
	<div class="relative max-w-7xl mx-auto grid grid-cols-2">
		<div class="py-16 sm:py-4 px-4 sm:px-4 lg:col-span-2">
			<div class="max-w-lg mx-auto">
				<div class="grid grid-cols-1 gap-y-6">
					<img alt="placeholder" class="w-full" src={imageFile ? imageFile : Placeholder} />
					<input
						type="file"
						accept="image/png, image/jpg, video/mp4, video/x-m4v, video/*"
						bind:files
						on:change={(e) => updateImage(e)}
						class="relative block w-full border border-black text-black dark:text-white dark:border-white border-dashed p-5 text-center hover:border-opacity-50 focus:outline-none focus:border-opacity-50"
					/>
				</div>
			</div>
		</div>
		<div class="py-16 px-4 lg:col-span-3 lg:py-16">
			<div class="max-w-lg mx-auto lg:max-w-none">
				<form on:submit|preventDefault={mint} class="grid grid-cols-1 gap-y-6">
					<div>
						<label class="text-black dark:text-white" for="full-name">Name of the art piece</label>
						<input
							required
							type="text"
							bind:value={name}
							name="full-name"
							id="full-name"
							autocomplete="name"
							class="focus:ring-white text-lg mt-1 focus:border-none block w-full text-black placeholder-black dark:text-white dark:placeholder-white placeholder-opacity-50 bg-gray bg-opacity-20 border-none"
						/>
					</div>
					<div>
						<label class="text-black dark:text-white" for="recipient-address"
							>Recipient address of the art piece</label
						>
						<input
							required
							type="text"
							bind:value={recipientAddress}
							name="recipient-address"
							id="recipient-address"
							autocomplete="address"
							class="focus:ring-white text-lg mt-1 focus:border-none block w-full text-black placeholder-black dark:text-white dark:placeholder-white placeholder-opacity-50 bg-gray bg-opacity-20 border-none"
						/>
					</div>
					<div>
						<label class="text-black dark:text-white" for="description">Description</label>
						<textarea
							required
							bind:value={description}
							id="description"
							name="description"
							rows="4"
							class="focus:ring-white text-lg mt-1 focus:border-none block w-full text-black placeholder-black dark:text-white dark:placeholder-white placeholder-opacity-50 bg-gray bg-opacity-20 border-none"
						/>
					</div>
					<div>
						<label class="text-black dark:text-white" for="mint-amount"
							>How many should be minted?</label
						>
						<input
							required
							type="number"
							bind:value={amount}
							min="1"
							max="1"
							name="mint-amount"
							id="mint-amount"
							autocomplete="amount"
							class="focus:ring-white text-lg mt-1 focus:border-none block w-full text-black placeholder-black dark:text-white dark:placeholder-white placeholder-opacity-50 bg-gray bg-opacity-20 border-none"
							placeholder="0"
						/>
					</div>
					<div>
						<form on:submit|preventDefault={addAttribute}>
							<label class="text-black dark:text-white" for="attribute-name">Attributes</label>
							<div class="mt-1 flex">
								<div class="relative flex items-stretch flex-grow focus-within:z-10">
									<input
										required
										type="text"
										bind:value={attributeName}
										name="attribute-name"
										id="attribute-name"
										class="focus:ring-white text-lg focus:border-none block w-full text-black placeholder-gray dark:text-white bg-gray bg-opacity-20 border-none"
										placeholder="Name of the attribute"
									/>
								</div>
								<button
									type="submit"
									class="relative inline-flex items-center space-x-2 px-4 py-2 border-white border-opacity-0 text-sm font-medium text-black dark:text-white bg-gray bg-opacity-30 hover:bg-opacity-40 focus:outline-none focus:ring-1 focus:border-opacity-100"
								>
									<!-- Heroicon name: solid/sort-ascending -->
									<svg
										class="h-5 w-5 text-black dark:text-white opacity-50"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z"
										/>
									</svg>
									<span>Add</span>
								</button>
							</div>
						</form>
					</div>
					<div>
						<dl>
							{#each Object.keys(attributes) as attributeName}
								<div
									class="relative border w-full flex items-stretch border-white border-opacity-0 my-2 focus-within:ring-1 focus-within:ring-white focus-within:white"
								>
									<label
										class="relative block items-center py-3 px-4 border-white border-opacity-0 font-medium h-full text-black dark:text-white bg-gray bg-opacity-20"
										for="name">{attributeName}</label
									>
									<input
										required
										type="text"
										on:keyup={() => updateAttribute(attributeName)}
										bind:value={propertyValues[attributeName]}
										name="name"
										id="name"
										class="text-lg block flex-grow border-transparent focus:outline-none focus:border-transparent focus:ring-transparent text-black dark:text-white placeholder-gray placeholder-opacity-50 bg-gray bg-opacity-20"
										placeholder="Enter value"
									/>
									<div
										class="absolute right-2 top-2 cursor-pointer "
										on:click={() => removeAttribute(attributeName)}
									>
										<!--  -->
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5 text-black dark:text-white mt-1.5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
								</div>
							{/each}
						</dl>
					</div>
					<div>
						<button
							type="submit"
							class="inline-flex justify-center py-4 px-8 border border-transparent text-base font-medium  text-white bg-black dark:text-black dark:bg-white dark:white hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
						>
							{#if !loading}
								Mint NFT
							{:else}
								loading ...
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
	<DepositModal on:close={() => (showModal = false)} visible={showModal} />
	<Notification on:close={() => (showNotification = false)} visible={showNotification} {message} />
</div>
