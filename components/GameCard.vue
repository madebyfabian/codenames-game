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
		<!-- Border overlay-->
		<div
			class="absolute pointer-events-none select-none inset-1 border-2 rounded-md"
			:class="
				(currPlayerIsSpymaster || gameCard.status === 'revealed') &&
				gameCard.type === 'assassin'
					? 'border-white/10'
					: 'border-black/10'
			"
		></div>

		<!-- Buttons hover overlay -->
		<div
			v-if="isInteractive"
			class="z-10 group-hover:visible invisible w-[calc(100%-1.5rem)] absolute inset-3 bottom-auto flex items-center justify-end"
		>
			<button class="primary" @click="handleClickChoose">✅ Choose</button>
		</div>

		<ul class="absolute inset-0 bottom-auto z-0 w-full p-4 flex gap-3">
			<li v-for="player of roundPlayerMarkings">
				<PlayerDisplay :player="player" />
			</li>
		</ul>

		<!-- Word -->
		<component
			:is="isInteractive ? 'button' : 'div'"
			@click="isInteractive ? handleClickMark() : undefined"
			class="group word py-0.5 absolute inset-2.5 top-auto rounded text-[2vmin] uppercase tracking-tight !border-none !text-gray-700 break-words !bg-white"
			:class="{
				'opacity-0': gameCard.status === 'revealed',
			}"
		>
			<span v-if="isInteractive" class="absolute hidden group-hover:block">
				👍
			</span>
			{{ gameCard.word }}
		</component>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	import type { GameWord } from '@/types'

	const gameState = useGameState()

	const props = defineProps<{
		gameCard: GameWord
	}>()

	const isInteractive = computed(() => {
		return (
			currPlayerIsOnRound.value &&
			!currPlayerIsSpymaster.value &&
			gameState.round.value.role === 'operative' &&
			props.gameCard.status === 'hidden'
		)
	})

	const roundPlayerMarkings = computed(() => {
		const usernames = props.gameCard.markedByUsernames
		const players = gameState.players.value.filter(player =>
			usernames.includes(player.username)
		)
		return players
	})

	const currPlayerIsOnRound = computed(() => {
		return gameState.currPlayer.value?.team === gameState.round.value.team
	})

	const currPlayerIsSpymaster = computed(() => {
		return gameState.currPlayer.value?.role === 'spymaster'
	})

	const handleClickChoose = () => {
		gameState.guessCard(props.gameCard.position)
	}

	const handleClickMark = () => {
		gameState.markCard(props.gameCard.position)
	}
</script>

<style lang="postcss" scoped>
	.word {
		font-family: Oswald, sans-serif;
	}
</style>
