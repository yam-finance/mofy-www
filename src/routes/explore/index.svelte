<script lang="ts">
	import type { IArtists } from '$lib/types';
	import Protected from '$lib/components/Protected/index.svelte';
	import Gallery from '$lib/components/Gallery/index.svelte';
	import Artists from '$lib/config/artists.json';

	const artists: IArtists = Artists;
	let searchTerm;

	function handleKeydown(event) {
		if ((event.metaKey && event.keyCode === 75) || (event.ctrlKey && event.keyCode === 75)) {
			event.preventDefault();
			document.getElementById('search').focus();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>Explore</title>
</svelte:head>

<div>
	<div class="px-16 sm:px-4 py-8 flex justify-between items-end md:block">
		<div class="max-w-xl">
			<h2 class="text-black dark:text-white font-extrabold text-6xl sm:text-2xl">Yam Museum</h2>
			<p class="mt-2 text-2xl sm:text-lg opacity-50 text-black dark:text-white">
				A curated list of yam museum artists
			</p>
		</div>
		<div class="mt-8 w-full max-w-xs md:max-w-none">
			<div class="mt-1 relative flex items-center">
				<input
					type="text"
					bind:value={searchTerm}
					name="search"
					id="search"
					placeholder="Search by addresses or ids"
					class="focus:ring-black dark:focus:ring-white text-lg h-12 focus:border-none block w-full pr-12 pl-6 placeholder-black dark:placeholder-white placeholder-opacity-50 bg-gray bg-opacity-20 sm:text-sm border-none"
				/>
				<div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
					<kbd
						class="inline-flex items-center px-3 bg-gray bg-opacity-10 text-sm font-sans font-medium text-black dark:text-white"
					>
						⌘+K
					</kbd>
				</div>
			</div>
		</div>
	</div>
</div>

<Gallery accounts={artists.addresses} {searchTerm} />
