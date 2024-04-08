<template>
	<div
		class="h-screen"
		:class="[
			gameState.status.value === 'playing' && {
				'bg-blue-50': gameState.round.value.team === 'blue',
				'bg-red-50': gameState.round.value.team === 'red',
			},
		]"
	>
		<div class="container py-12">
			<CurrentStep />

			<TeamsDisplay />

			<div v-if="gameState.status.value === 'idle'" class="flex justify-center">
				<button
					@click="() => gameState.startGame()"
					class="mt-8 primary scale-125"
				>
					Start Game
				</button>
			</div>

			<div v-else class="mt-12">
				<GameCardsField />
				<ClueInput class="mt-8" />
				<ClueDisplay class="mt-8" />
			</div>

			<details class="mt-8">
				<summary>Game State</summary>
				<pre>{{ gameState }}</pre>
			</details>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()
</script>

<style lang="postcss">
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
