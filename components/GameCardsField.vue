<template>
	<div class="flex flex-col gap-3">
		<div
			v-for="(group, groupKey) in groupedGameCards"
			:key="groupKey"
			class="flex gap-3 justify-center"
		>
			<GameCard
				v-for="(gameCard, key) in group"
				:key="key"
				:gameCard="gameCard"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()

	const groupedGameCards = computed(() => {
		const groupedGameCards = []
		const gameCards = gameState.gameWords.value

		// Group so it is a 5x5. Respect the position.x and .y
		for (let i = 0; i < 5; i++) {
			const group = gameCards.filter(gameCard => gameCard.position.y === i)
			groupedGameCards.push(group)
		}

		return groupedGameCards
	})
</script>
