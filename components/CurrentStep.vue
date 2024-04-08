<template>
	<div class="flex justify-center">
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

		if (
			!gameState.currPlayer.value?.role ||
			!gameState.currPlayer.value?.team
		) {
			return 'Bitte trete einem Team bei'
		}

		if (gameState.status.value !== 'playing') {
			return 'Spiel starten'
		}

		if (!currUserIsInTeam) {
			return 'Warte auf das andere Team'
		}

		if (gameState.round.value.role === 'spymaster') {
			if (currUserIsSpymaster) {
				return 'Gib deinen Ermittlern einen Hinweis'
			} else {
				return 'Warte auf den Hinweis deines Geheimdienstchefs'
			}
		} else if (gameState.round.value.role === 'operative') {
			if (currUserIsSpymaster) {
				return 'Warte auf deine Ermittler'
			} else {
				return 'Ratet die Wörter'
			}
		}
	})
</script>
