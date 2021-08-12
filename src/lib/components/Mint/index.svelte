<!-- src/lib/components/Mint/index.svelte -->
<script lang="ts">
	import DepositModal from '$lib/components/DepositModal/index.svelte';
	import { syncWallet, syncProvider } from '$lib/stores/web3-store';
	import { NFTStorage, File } from 'nft.storage';
	import CID from 'cids';
	import { ethers } from 'ethers';

	let txFee;
	let amount;
	let attributeName = '';
	let propertyValues = {};
	let attributes = {};
	let files;
	let description;
	let name;
	let recipientAddress = $syncWallet.address();
	let showModal = false;
	let loading = false;
	let imageFile;

	$: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		// console.log(files);

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`);
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
			showModal = true;
			return 1;
		}

		if (!(await $syncWallet.isSigningKeySet())) {
			if ((await $syncWallet.getAccountId()) == undefined) {
				throw new Error('Unknown account');
			}

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
		const receipt = await nft.awaitReceipt();

		console.log('Fee', fee);
		console.log('NFT', nft);
		console.log('TxReceipt', receipt);
		console.log(nft.txHash.substring(8));
		loading = false;
	};
</script>

<!-- @todo Move address to second input
	 @todo make attribute name editable
     @todo modal should close after depositing and loading finishing
	 @todo Page not found when pasting the wrong address
	 @todo Create order endpoints -->

<!-- TODO Pass txFee to Modal as a prop -->
<div class="relative bg-white">
	<div class="absolute inset-0">
		<div class="absolute inset-y-0 left-0 w-1/2 bg-gray-50" />
	</div>
	<div class="relative max-w-7xl mx-auto lg:grid lg:grid-cols-5">
		<div class="bg-gray-50 py-16 px-4 sm:px-6 lg:col-span-2 lg:px-8 lg:py-16 xl:pr-8">
			<div class="max-w-lg mx-auto">
				<div class="grid grid-cols-1 gap-y-6">
					<img class="w-full rounded-md" src={imageFile ? imageFile : '/empty-nft.png'} />
					<input
						type="file"
						accept="image/png, image/jpg, video/mp4, video/x-m4v, video/*"
						bind:files
						on:change={(e) => updateImage(e)}
						class="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-5 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
					/>
				</div>
			</div>
		</div>
		<div class="bg-white py-16 px-4 sm:px-6 lg:col-span-3 lg:py-16 lg:px-8 xl:pl-8">
			<div class="max-w-lg mx-auto lg:max-w-none">
				<form on:submit|preventDefault={mint} class="grid grid-cols-1 gap-y-6">
					<div>
						<label for="full-name" class="sr-only">Name of the art piece</label>
						<input
							required
							type="text"
							bind:value={name}
							name="full-name"
							id="full-name"
							autocomplete="name"
							class="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500 border-gray-300 rounded-md"
							placeholder="Name of the art piece"
						/>
					</div>
					<div>
						<label for="recipient-address" class="sr-only">Recipient address of the art piece</label
						>
						<input
							required
							type="text"
							bind:value={recipientAddress}
							name="recipient-address"
							id="recipient-address"
							autocomplete="address"
							class="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500 border-gray-300 rounded-md"
							placeholder="Recipient address of the art piece"
						/>
					</div>
					<div>
						<label for="description" class="sr-only">Description</label>
						<textarea
							required
							bind:value={description}
							id="description"
							name="description"
							rows="4"
							class="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500 border border-gray-300 rounded-md"
							placeholder="Description"
						/>
					</div>
					<div>
						<label for="mint-amount" class="sr-only">Mint amount</label>
						<input
							required
							type="number"
							bind:value={amount}
							min="1"
							max="1"
							name="mint-amount"
							id="mint-amount"
							autocomplete="amount"
							class="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500 border-gray-300 rounded-md"
							placeholder="Mint amount"
						/>
					</div>
					<div>
						<form on:submit|preventDefault={addAttribute}>
							<label for="attribute-name" class="block text-sm font-medium text-gray-700"
								>Attributes</label
							>
							<div class="mt-1 flex rounded-md shadow-sm">
								<div class="relative flex items-stretch flex-grow focus-within:z-10">
									<input
										required
										type="text"
										bind:value={attributeName}
										name="attribute-name"
										id="attribute-name"
										class="block w-full shadow-sm py-3 px-4 rounded-none rounded-l-md placeholder-gray-500 focus:ring-gray-500 focus:border-gray-500 border-gray-300"
										placeholder="Name of the attribute"
									/>
								</div>
								<button
									type="submit"
									class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
								>
									<!-- Heroicon name: solid/sort-ascending -->
									<svg
										class="h-5 w-5 text-gray-400"
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
						<dl class="grid grid-cols-2 gap-x-4 gap-y-8">
							{#each Object.keys(attributes) as attributeName}
								<div
									class="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-gray-600 focus-within:border-gray-600"
								>
									<label
										for="name"
										class="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-900"
										>{attributeName}</label
									>
									<input
										required
										type="text"
										on:keyup={() => updateAttribute(attributeName)}
										bind:value={propertyValues[attributeName]}
										name="name"
										id="name"
										class="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
										placeholder="Value"
									/>
									<div
										class="absolute right-2 top-2 cursor-pointer "
										on:click={() => removeAttribute(attributeName)}
									>
										<!--  -->
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5 text-gray-400"
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
							class="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
</div>
