<!-- src/lib/components/Header/index.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { defaultChainStore, web3, connected, selectedAccount } from '$lib/stores/web3-store';
	import Banner from '$lib/components/Banner/index.svelte';

	let Web3Modal;
	let WalletConnectProvider;
	let connecting = false;
	let mobileMenu = { open: false };
	let dynamicClass = {
		desktop: {
			current: 'opacity-40',
			default: 'text-black dark:text-white hover:opacity-70 hover:opacity-70'
		},
		mobile: {
			current: 'opacity-40',
			default: 'text-black dark:text-white hover:opacity-70 hover:italic hover:pl-2'
		}
	};

	onMount(async () => {
		Web3Modal = window.Web3Modal.default;
		WalletConnectProvider = window.WalletConnectProvider.default;
	});

	function toggle() {
		mobileMenu.open = !mobileMenu.open;
	}

	/**
	 * @notice Use web3Modal to connect a user wallet
	 */
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

		connecting = true;

		await defaultChainStore.setProvider(provider);

		connecting = false;
	};

	/**
	 * @notice Disconnect the user wallet and clear the account state
	 */
	const disconnect = async () => {
		await defaultChainStore.disconnect();
		goto('/');
	};
</script>

<nav>
	<Banner />
	<div class="mx-16 py-8 border-b sm:mx-4 sm:py-4">
		<div class="flex justify-between">
			<div class="flex">
				<div class="flex-shrink-0 mr-8 sm:mr-2 flex items-center cursor-pointer">
					<img
						src="/yam.png"
						on:click={() => goto('/')}
						class="w-8 sm:w-6 mr-2 hover:opacity-70"
						alt="Yam Museum"
					/>
					<img
						src="/mofy-blk.svg"
						on:click={() => goto('/')}
						class="w-10 sm:w-8 hover:opacity-70 dark:hidden"
						alt="Yam Museum"
					/>
					<img
						src="/mofy-wht.svg"
						on:click={() => goto('/')}
						class="w-10 sm:w-8 hover:opacity-70 hidden dark:block"
						alt="Yam Museum"
					/>
				</div>
				<div class="items-center hidden md:flex">
					<!-- Mobile menu button -->
					<button
						on:click={toggle}
						type="button"
						class="inline-flex items-center justify-center p-2 text-white hover:opacity-70 focus:outline-none"
						aria-controls="mobile-menu"
						aria-expanded="false"
					>
						<span class="sr-only">Open mobile menu</span>
						<div>
							<div
								class="h-0.5 w-10 mb-1.5 bg-black dark:bg-white"
								class:open={mobileMenu.open}
							/>
							<div
								class="h-0.5 w-10 bg-black dark:bg-white"
								class:openN={mobileMenu.open}
							/>
						</div>
					</button>
				</div>
			</div>
			<div class="flex items-center">
				<div class="flex flex-shrink-0 items-center text-black dark:text-white">
					<a
						href="/explore"
						class="{$page.path == '/explore'
							? dynamicClass.desktop.current
							: dynamicClass.desktop
									.default} md:hidden rounded-md py-2 px-3 items-center text-base font-medium"
					>
						Explore
					</a>
					{#if $connected}
						<a
							href="/gallery/{$selectedAccount}"
							class="{$page.path == `/gallery/${$selectedAccount}`
								? dynamicClass.desktop.current
								: dynamicClass.desktop
										.default} md:hidden rounded-md py-2 px-3 items-center text-base font-medium"
						>
							Your Gallery
						</a>
						<a
							href="/mint"
							class="md:hidden {$page.path == '/mint'
								? dynamicClass.desktop.current
								: dynamicClass.desktop
										.default} md:hidden rounded-md py-2 px-3 items-center text-base font-medium"
						>
							Mint
						</a>
						<a
							href="https://mofy.yam.xyz/"
							target="_blank"
							class="{dynamicClass.desktop
								.default} md:hidden rounded-md py-2 px-3 items-center text-base font-medium"
						>
							Magazine
						</a>
						<a
							href="https://docs.yam.finance/projects/museum"
							target="_blank"
							class="{dynamicClass.desktop
								.default} md:hidden rounded-md py-2 px-3 items-center text-base font-medium mr-5"
						>
							FAQ
						</a>
					{/if}
					{#if $web3.version}
						{#if !$connected && !connecting}
							<button
								on:click={enable}
								type="button"
								class="relative inline-flex items-center px-8 py-4 sm:px-2 sm:py-1 border border-transparent text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-800"
							>
								<span>Connect Account</span>
							</button>
						{:else if connecting}
							<button
								type="button"
								class="relative inline-flex items-center px-8 py-4 sm:px-2 sm:py-1 border border-transparent text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								<span>connecting ...</span>
							</button>
						{:else}
							<!-- on:click={() => goto('/profile')} -->
							<button
								type="button"
								class="mr-2 text-black dark:text-white flex items-center hover:opacity-70"
							>
								<span class="font-medium sm:text-xs">{$selectedAccount.substring(0, 6)}</span>
								<div
									class="ml-2 w-6 h-6 rounded-full border-black dark:border-white border-2 flex flex-col items-center overflow-hidden"
								>
									<div
										class="w-2 h-2 mb-0.5 mt-1 flex-shrink-0 border-black dark:border-white rounded-full border-2"
									/>
									<div
										class="w-4 h-4 rounded-full flex-shrink-0 border-black dark:border-white border-2"
									/>
								</div>
							</button>
							<button
								on:click={disconnect}
								type="button"
								class="text-black dark:text-white flex items-center hover:opacity-70"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
							</button>
						{/if}
					{:else}
						<button
							type="button"
							class="relative inline-flex items-center px-8 py-4 sm:px-2 sm:py-1 border border-transparent text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							<span>. . .</span>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if mobileMenu.open}
		<div class="hidden md:block mx-16 border-b sm:mx-4" id="mobile-menu">
			<div class="pt-2">
				<a
					href="/explore"
					class="{$page.path == '/explore'
						? dynamicClass.mobile.current
						: dynamicClass.mobile
								.default} block py-2 text-lg text-black dark:text-white font-medium">Explore</a
				>
				{#if $connected}
					<a
						href="/gallery/{$selectedAccount}"
						class="{$page.path == `/gallery/${$selectedAccount}`
							? dynamicClass.mobile.current
							: dynamicClass.mobile
									.default} block py-2 text-lg text-black dark:text-white font-medium"
						>Your Gallery</a
					>
					<a
						href="/mint"
						class="{$page.path == '/mint'
							? dynamicClass.mobile.current
							: dynamicClass.mobile
									.default} block py-2 text-lg text-black dark:text-white font-medium">Mint</a
					>
					<a
						href="https://mofy.yam.xyz/"
						target="_blank"
						class="{dynamicClass.mobile
							.default} block py-2 text-lg text-black dark:text-white font-medium">Magazine</a
					>
					<a
						href="https://docs.yam.finance/projects/museum"
						target="_blank"
						class="{dynamicClass.mobile
							.default} block py-2 text-lg text-black dark:text-white font-medium">FAQ</a
					>
				{/if}
			</div>
			<div class="pb-3">
				<div class="mt-3 space-y-1">
					<a
						href="https://yam.finance/"
						target="_blank"
						class="block py-2 text-base text-black dark:text-white font-medium opacity-60 hover:opacity-30"
						>Built by Yam</a
					>
				</div>
			</div>
		</div>
	{/if}
</nav>

<style>
	.open {
		@apply rotate-45 translate-y-1 w-10 ml-0;
	}
	.openN {
		@apply -rotate-45 -translate-y-1 w-10 ml-0;
	}
</style>
