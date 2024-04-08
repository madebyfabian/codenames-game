<template>
	<div
		class="h-screen overflow-y-scroll"
		:class="[
			gameState.status.value === 'playing' && {
				'bg-blue-50': gameState.round.value.team === 'blue',
				'bg-red-50': gameState.round.value.team === 'red',
			},
		]"
	>
		<button
			v-if="gameState.status.value === 'playing'"
			class="absolute right-2 top-2"
			@click="handleEndGame"
		>
			Spiel beenden
		</button>

		<div class="container py-8">
			<CurrentStep class="mb-8" />

			<div v-if="gameState.status.value === 'idle'" class="flex justify-center">
				<button @click="() => gameState.startGame()" class="primary scale-125">
					Spiel starten
				</button>
			</div>

			<div v-else>
				<GameCardsField />
				<ClueInput class="mt-8" />
				<ClueDisplay class="mt-8" />
			</div>

			<TeamsDisplay class="mt-16" />

			<details v-if="gameState.debugMode.value" class="mt-8">
				<summary>Game State</summary>
				<pre>{{ gameState }}</pre>
			</details>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()

	const handleEndGame = () => {
		gameState.endGame()
	}
</script>
