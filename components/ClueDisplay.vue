<template>
	<div v-if="gameState.round.value.clue">
		<div class="flex items-center justify-center gap-1">
			<p
				class="text-xl px-3 py-1 bg-white border-2 border-gray-300 text-center rounded-full font-semibold"
			>
				{{ gameState.round.value.clue }}
			</p>
			<p
				class="text-xl px-3 py-1 bg-white border-2 border-gray-300 text-center rounded-full font-semibold"
			>
				{{ gameState.round.value.number }}
			</p>
		</div>

		<div
			v-if="gameState.round.value.role === gameState.currPlayer.value?.role"
			class="flex justify-center mt-4"
		>
			<button @click="handleEndGuessing" class="primary">Raten beenden</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()

	const handleEndGuessing = () => {
		gameState.endRound()
	}
</script>
