<script lang="ts">
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
	// @todo Add types for artists.json
	import Artists from '$lib/config/artists.json';

	let searchTerm;

	function handleKeydown(event) {
		if (event.metaKey && event.keyCode === 75) {
			document.getElementById('search').focus();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>Explore</title>
</svelte:head>

<Protected>
	<div class="bg-white">
		<div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
			<div class="max-w-xl">
				<h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
					Mofy Gallery
				</h2>
				<p class="mt-5 text-xl text-gray-500">A currated list of mofy nft artists.</p>
			</div>
			<div class="mt-10 w-full max-w-xs">
				<label for="search" class="block text-base font-medium text-gray-500"
					>Filter for nft id or creator address</label
				>
				<div class="mt-1 relative flex items-center">
					<input
						type="text"
						bind:value={searchTerm}
						name="search"
						id="search"
						class="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
					/>
					<div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
						<kbd
							class="inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400"
						>
							⌘K
						</kbd>
					</div>
				</div>
			</div>
		</div>
	</div>

	<Gallery accounts={Artists.addresses} {searchTerm} />
</Protected>
