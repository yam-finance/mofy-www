<script>
    import { onMount } from 'svelte';
    import NFTCard from '$lib/components/NFTCard/index.svelte';

    export let filteredNFT;

    let Colcade;
    let colc;
    let instance, container;
    let imgLoaded = 0;
    const sizes = [
        { columns: 3, gutter: 0 },
        {}
    ]

    onMount(async () => {
        Colcade = (await import("colcade")).default;
        
        colc = new Colcade( '.colc', {
            columns: '.colc-col',
            items: '.colc-item'
        });
    })
</script>

<style>
@media (max-width: 767px) {
    .full-on-mobile {
        width: 100% !important;
    }
}
</style>

<div class="colc flex">
    <div class="colc-col w-1/3 lg:w-1/2 full-on-mobile"></div>
    <div class="colc-col w-1/3 lg:hidden"></div>
    <div class="colc-col w-1/3 lg:w-1/2 md:hidden"></div>

    {#each filteredNFT as nft}
        <NFTCard {nft} />
    {/each}
</div>