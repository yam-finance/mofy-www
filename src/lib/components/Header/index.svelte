<!-- src/lib/components/Header/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { defaultChainStore, web3, connected, selectedAccount } from '$lib/stores/web3-store';

	export let currentSlug;

	let Web3Modal;
	let WalletConnectProvider;
	let mobileMenu = { open: false };
	let dynamicClass = {
		desktop: {
			current: 'bg-gray-100 text-gray-900',
			default: 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
		},
		mobile: {
			current: 'bg-gray-100 text-gray-900',
			default: 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
		}
	};

	onMount(async () => {
		Web3Modal = window.Web3Modal.default;
		WalletConnectProvider = window.WalletConnectProvider.default;
		// @todo Check better solution
		goto(window.location.href)
	});

	function toggle() {
		mobileMenu.open = !mobileMenu.open;
	}

	const enable = async () => {
		let web3Modal = new Web3Modal({
			cacheProvider: false,
			providerOptions: {
				walletconnect: {
					package: WalletConnectProvider,
					options: {
						infuraId: '9aa3d95b3bc440fa88ea12eaa4456161'
					}
				}
			},
			disableInjectedProvider: false,
			theme: 'dark'
		});

		const provider = await web3Modal.connect();
		await defaultChainStore.setProvider(provider);
	};

	const disconnect = async () => {
		defaultChainStore.disconnect();
	};
</script>

<nav class="bg-white shadow">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex">
				<div class="-ml-2 mr-2 flex items-center md:hidden">
					<!-- Mobile menu button -->
					<button
						on:click={toggle}
						type="button"
						class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
						aria-controls="mobile-menu"
						aria-expanded="false"
					>
						<span class="sr-only">Open mobile menu</span>
						{#if !mobileMenu.open}
							<svg
								class="block h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						{:else}
							<svg
								class="block h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						{/if}
					</button>
				</div>
				<div class="flex-shrink-0 flex items-center cursor-pointer">
					<!-- <img on:click={() => goto('/')} class="block lg:hidden h-8 w-auto" src="" alt="Yam Museum" /> -->
					<!-- <img on:click={() => goto('/')} class="hidden lg:block h-8 w-auto" src="" alt="Yam Museum" /> -->
					<div on:click={() => goto('/')}>Yam Museum</div>
				</div>
			</div>
			<div class="flex items-center">
				<div class="flex-shrink-0">
					{#if $connected}
						<a
							href="/explore"
							class="{$page.path == '/explore'
								? dynamicClass.desktop.current
								: dynamicClass.desktop
										.default} hidden rounded-md py-2 px-3 md:inline-flex items-center text-sm font-medium"
							aria-current="page"
						>
							Explore
						</a>
						<a
							href="/gallery/{$selectedAccount}"
							class="{$page.path == `/gallery/${$selectedAccount}`
								? dynamicClass.desktop.current
								: dynamicClass.desktop
										.default} hidden rounded-md py-2 px-3 md:inline-flex items-center text-sm font-medium"
						>
							Your Gallery
						</a>
						<a
							href="/mint"
							class="{$page.path == '/mint'
								? dynamicClass.desktop.current
								: dynamicClass.desktop
										.default} hidden rounded-md py-2 px-3 md:inline-flex items-center text-sm font-medium mr-5"
						>
							Mint
						</a>
					{/if}
					{#if $web3.version}
						{#if !$connected}
							<button
								on:click={enable}
								type="button"
								class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								<span>Connect Account</span>
							</button>
						{:else}
							<button
								on:click={disconnect}
								type="button"
								class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								<span>Disconnect {$selectedAccount.substring(0, 8)}</span>
							</button>
						{/if}
					{:else}
						<button
							type="button"
							class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							<span>. . .</span>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if mobileMenu.open}
		<div class="md:hidden" id="mobile-menu">
			{#if $connected}
				<div class="pt-2 pb-3 px-2 space-y-1">
					<a
						href="/explore"
						class="{$page.path == '/explore'
							? dynamicClass.mobile.current
							: dynamicClass.mobile.default} block rounded-md py-2 px-3 text-base font-medium"
						aria-current="page">Explore</a
					>
					<a
						href="/gallery/{$selectedAccount}"
						class="{$page.path == `/gallery/${$selectedAccount}`
							? dynamicClass.mobile.current
							: dynamicClass.mobile.default} block rounded-md py-2 px-3 text-base font-medium"
						>Your Gallery</a
					>
					<a
						href="/mint"
						class="{$page.path == '/mint'
							? dynamicClass.mobile.current
							: dynamicClass.mobile.default} block rounded-md py-2 px-3 text-base font-medium"
						>Mint</a
					>
				</div>
			{/if}
			<div class="pb-3 px-2 border-t border-gray-200">
				<div class="mt-3 space-y-1">
					<a
						href="https://yam.finance/"
						class="block rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 sm:px-6"
						>Built by Yam</a
					>
				</div>
			</div>
		</div>
	{/if}
</nav>
