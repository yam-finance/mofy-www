<script lang="ts">
	import { page } from '$app/stores';
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<div>
		<div class="px-16 py-8 sm:py-16 sm:px-4 ">
			<div>
				<h3 class="text-3xl font-bold text-black dark:text-white mb-2 text-bold">
					Your Personal Gallery
				</h3>
				<span class="text-black dark:text-white opacity-50">The MoFY NFTs in your wallet</span>
			</div>
		</div>
	</div>

	<div class="px-8 py-8 sm:py-16 sm:px-4">
		<Gallery accounts={[$page.params.address]} />
	</div>
</Protected>
