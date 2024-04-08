<template>
	<div class="flex justify-center -mt-4 mb-8">
		<div
			class="px-3 py-1 bg-white border-2 border-gray-300 text-lg text-center rounded-full font-semibold"
			:class="!currentStep && 'opacity-0'"
		>
			<p>👉 {{ currentStep }}&nbsp;</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()

	const currentStep = computed(() => {
		const currTeam = gameState.round.value.team
		const currUserIsInTeam = gameState.currPlayer.value?.team === currTeam
		const currUserIsSpymaster = gameState.currPlayer.value?.role === 'spymaster'

		if (gameState.status.value !== 'playing') {
			if (
				!gameState.currPlayer.value?.role ||
				!gameState.currPlayer.value?.team
			) {
				return 'Join a team'
			}
			return 'Start the game'
		}

		if (!currUserIsInTeam) {
			return 'Wait for the other team'
		}

		if (gameState.round.value.role === 'spymaster') {
			if (currUserIsSpymaster) {
				return 'Give your operatives a clue'
			} else {
				return 'Wait for your spymaster to give a clue'
			}
		} else if (gameState.round.value.role === 'operative') {
			if (currUserIsSpymaster) {
				return 'Wait for your operatives to guess'
			} else {
				return 'Guess the words'
			}
		}
	})
</script>
