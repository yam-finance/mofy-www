<script lang="ts">
	import { page } from '$app/stores';
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
</script>

<svelte:head>
	<title>Gallery</title>
</svelte:head>

<Protected>
	<div class="bg-white">
		<div class="max-w-7xl mx-auto py-16 px-4 sm:py-16 sm:px-6 lg:px-8">
			<div>
				<span class="text-base font-semibold text-gray-600 tracking-wide">
					Your Personal Gallery
				</span>

				<span class="max-w-xl mt-5 mx-auto text-md text-gray-500">
					- A list of the museum nfts that you own.
				</span>
			</div>
		</div>
	</div>

	<Gallery accounts={[$page.params.address]} />
</Protected>
