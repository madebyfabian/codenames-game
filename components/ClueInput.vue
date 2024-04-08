<template>
	<form
		@submit.prevent="handleGiveClue"
		v-if="
			gameState.round.value.team === gameState.currPlayer.value?.team &&
			gameState.round.value.role === gameState.currPlayer.value.role &&
			gameState.currPlayer.value.role === 'spymaster'
		"
		class="flex items-center justify-center gap-2"
	>
		<input type="text" v-model="word" placeholder="Dein Hinweis" required />
		<input type="number" v-model.number="number" class="max-w-20" />
		<button class="py-3.5 px-5 primary ml-2" type="submit">
			Hinweis geben
		</button>
	</form>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()

	const word = ref('')
	const number = ref(0)

	const handleGiveClue = () => {
		gameState.updateRound({
			clue: word.value,
			number: number.value,
		})

		word.value = ''
		number.value = 0
	}
</script>
