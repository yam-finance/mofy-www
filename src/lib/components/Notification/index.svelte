<!-- src/lib/components/DepositModal/index.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	export let visible;
	export let message;
	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	// @todo Move to utils
	export function clickOutside(node, onEventFunction) {
		const handleClick = (event) => {
			var path = event.composedPath();

			if (!path.includes(node)) {
				onEventFunction();
			}
		};

		document.addEventListener('click', handleClick);

		return {
			destroy() {
				document.removeEventListener('click', handleClick);
			}
		};
	}
</script>

{#if visible}
	<!-- Global notification live region, render this permanently at the end of the document -->
	<div
		aria-live="assertive"
		class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
	>
		<div class="w-full flex flex-col items-center space-y-4 sm:items-end">
			<div
				transition:fade
				use:clickOutside={close}
				class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
			>
				<div class="p-4">
					<div class="flex items-start">
						<div class="flex-shrink-0">
							<!-- Heroicon name: outline/exclamation -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 text-green-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<div class="ml-3 w-0 flex-1 pt-0.5">
							<p class="text-sm font-medium text-gray-900">Notification</p>
							<p class="mt-1 text-sm text-gray-500 break-words">
								{message}
							</p>
						</div>
						<div class="ml-4 flex-shrink-0 flex">
							<button
								on:click={close}
								class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								<span class="sr-only">Close</span>
								<!-- Heroicon name: solid/x -->
								<svg
									class="h-5 w-5"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
