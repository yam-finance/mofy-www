<!-- src/routes/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	let visible = false;

	onMount(async () => {
		visible = true;
	});

	function typewriter(node, { speed = 40 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length * speed;

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

{#if visible}
	<main class="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
		<div class="text-center">
			<h1 class="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
				<span in:typewriter class="block xl:inline">Welcome to MOFY, the museum of fine Yams!</span>
			</h1>
			<p
				class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
			>
				This dapp is in beta version and should act as a base for the yam metaverse exhibitions as well
				as future yam nft projects.
			</p>
			<div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
				<div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
					<a
						href="/explore"
						class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
					>
						Explore our artists
					</a>
				</div>
			</div>
		</div>
	</main>
{/if}

<!-- 
<iframe
	src="https://museum-of-fine-yams.webflow.io/"
	title="Mofy Webflow site"
	style="
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 100%;
    border: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100%;
	z-index: -1;
  "
/> -->
