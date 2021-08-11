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
		<div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
			<div class="text-center">
				<h2 class="text-base font-semibold text-gray-600 tracking-wide uppercase">
					Personal Gallery
				</h2>

				<p class="max-w-xl mt-5 mx-auto text-xl text-gray-500">
					The following is a list of the mofy nfts you own.
				</p>
			</div>
		</div>
	</div>

	<Gallery accounts={[$page.params.address]} />
</Protected>
