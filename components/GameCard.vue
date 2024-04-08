<template>
	<div
		class="group px-2 h-[10vh] rounded-lg font-bold flex-1 text-center relative shrink-0"
		:class="
			currPlayerIsSpymaster || gameCard.status === 'revealed'
				? {
						'bg-red-300': gameCard.type === 'red',
						'bg-blue-300': gameCard.type === 'blue',
						'bg-orange-200': gameCard.type === 'neutral',
						'bg-gray-700 text-white': gameCard.type === 'assassin',
				  }
				: 'bg-orange-200'
		"
	>
		<p
			class="word py-0.5 absolute inset-2.5 top-auto rounded text-[2vmin] uppercase tracking-tight text-gray-700 break-words bg-white"
			:class="{
				'opacity-0': gameCard.status === 'revealed',
			}"
		>
			{{ gameCard.word }}
		</p>
		<!-- Border overlay-->
		<div
			class="absolute pointer-events-none select-none inset-1 border-2 rounded-md"
			:class="
				gameCard.type === 'assassin' ? 'border-white/10' : 'border-black/10'
			"
		/>

		<div
			v-if="
				currPlayerIsOnRound &&
				!currPlayerIsSpymaster &&
				gameState.round.value.role === 'operative' &&
				gameCard.status === 'hidden'
			"
			class="group-hover:visible invisible w-[calc(100%-1.5rem)] absolute inset-3 bottom-auto flex items-center justify-between"
		>
			<button class="border-transparent bg-white/50">📍 Mark</button>
			<button class="primary" @click="handleClickChoose">👉 Choose</button>
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
		gameState.guessCard(props.gameCard.position)
	}
</script>

<style lang="postcss" scoped>
	.word {
		font-family: Oswald, sans-serif;
	}
</style>
