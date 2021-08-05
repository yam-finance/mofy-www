<!-- src/lib/components/NFTCard/index.svelte -->
<script lang="ts">
	import { utils } from "ethers";

	export let nft;
</script>

<p>
	<a href={`/nft/${nft.id}`}>
		{nft.id}
	</a>
	<a href={`/gallery/${utils.getAddress(nft.creatorAddress)}`}>
		{utils.getAddress(nft.creatorAddress)}
	</a>
</p>
