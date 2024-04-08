<template>
	<div
		class="group px-2 h-[10vh] rounded-lg font-bold w-full text-center relative"
		:class="
			currPlayerIsSpymaster || gameCard.status === 'revealed'
				? {
						'bg-red-300': gameCard.type === 'red',
						'bg-blue-300': gameCard.type === 'blue',
						'bg-orange-300': gameCard.type === 'neutral',
						'bg-gray-700 text-white': gameCard.type === 'assassin',
				  }
				: 'bg-orange-300'
		"
	>
		<p
			class="py-[12.5%] text-xl uppercase tracking-tight"
			:class="{
				'opacity-0': gameCard.status === 'revealed',
			}"
		>
			{{ gameCard.word }}
		</p>
		<div
			v-if="
				currPlayerIsOnRound &&
				!currPlayerIsSpymaster &&
				gameCard.status === 'hidden'
			"
			class="group-hover:visible invisible w-[calc(100%-1rem)] absolute inset-2 top-auto flex items-center justify-between"
		>
			<button>Markieren</button>
			<button class="primary" @click="handleClickChoose">Auswählen</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	import type { GameWord } from '@/types'

	const gameState = useGameState()

	const props = defineProps<{
		gameCard: GameWord
	}>()

	const currPlayerIsOnRound = computed(() => {
		return gameState.currPlayer.value?.team === gameState.round.value.team
	})

	const currPlayerIsSpymaster = computed(() => {
		return gameState.currPlayer.value?.role === 'spymaster'
	})

	const handleClickChoose = () => {
		gameState.guessCard(props.gameCard)
	}
</script>
