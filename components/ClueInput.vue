<template>
	<form
		@submit.prevent="handleGiveClue"
		v-if="
			gameState.round.value.team === gameState.currPlayer.value?.team &&
			gameState.round.value.role === gameState.currPlayer.value.role &&
			gameState.currPlayer.value.role === 'spymaster'
		"
		class="flex items-center justify-center gap-3"
	>
		<input type="text" v-model="word" placeholder="Your clue" required />
		<input type="number" v-model.number="number" />
		<button class="py-2 primary border-2" type="submit">Give clue</button>
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

<style lang="postcss" scoped>
	input {
		@apply border-2 bg-gray-100 border-gray-300 px-4 py-2 rounded-lg;
	}
</style>
