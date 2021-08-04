<!-- src/lib/components/NFTCard/index.svelte -->
<script lang="ts">
	export let nft;
</script>

<p>
	<a href={`/nft/${nft.id}`}>
		{nft.id}
	</a>
</p>
