<!-- src/lib/components/Mint/index.svelte -->
<script lang="ts">
	import { syncWallet, syncProvider, selectedAccount } from '$lib/stores/web3-store';

	const mint = async () => {
		const feeToken = 'ETH';
		const { totalFee: fee } = await $syncProvider.getTransactionFee(
			'MintNFT',
			$syncWallet.address(),
			feeToken
		);
		// @todo Replace the content hash with the ipfs hash represented by a 32-byte hex string
		const contentHash = '0xbd7289936758c562235a3a42ba2c4a56cbb23a263bb8f8d27aead80d74d9d996';
		const nft = await $syncWallet.mintNFT({
			recipient: $syncWallet.address(),
			contentHash,
			feeToken: feeToken,
			fee
		});
		const receipt = await nft.awaitReceipt();

		console.log('Fee', fee);
		console.log('NFT', nft);
		console.log('TxReceipt', receipt);
		console.log(nft.txHash.substring(8));
	};
</script>

<button on:click={mint}>Mint NFT</button>
