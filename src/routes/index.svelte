<!-- src/routes/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	let visible = false;

	onMount(async () => {
		visible = true;
	});

	function typewriter(node, { speed = 50 }) {
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

<!-- {#if visible}
	<p in:typewriter>Welcome to Mofy - the Museum of fine Yams</p>
{/if} -->

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
/>
