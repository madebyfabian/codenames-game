<template>
	<div>
		<NuxtPage />
	</div>
</template>

<style lang="postcss">
	html {
		/** Scaling */
		font-size: 14px;
	}

	button {
		@apply bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg font-semibold hover:opacity-75;

		&.primary {
			@apply bg-gray-700 text-white border-transparent;
		}
	}

	h2 {
		@apply font-bold text-2xl my-4 first:mt-0 last:mb-0;
	}

	h3 {
		@apply font-semibold opacity-75 uppercase tracking-wide text-sm my-2 first:mt-0 last:mb-0;
	}

	pre {
		@apply my-5 max-h-96 overflow-y-scroll bg-gray-50 text-sm p-2;
	}
</style>
