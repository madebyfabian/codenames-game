<template>
	<div class="flex items-center gap-2" :class="{ 'font-bold': isCurrPlayer }">
		<span
			class="size-6 rounded-full flex items-center justify-center font-bold text-sm"
			:class="{
				'bg-opacity-25': !isCurrPlayer,
				'bg-blue-400 text-blue-800': player?.team === 'blue',
				'bg-red-400 text-red-800': player?.team === 'red',
			}"
		>
			{{ firstLetter }}
		</span>
		<span>
			{{ player.username }}
			<span v-if="isCurrPlayer" class="font-normal">(du)</span>
		</span>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	import type { Player } from '@/types'

	const props = defineProps<{
		player: Player
	}>()

	const { currPlayer } = useGameState()

	const isCurrPlayer = computed(() => {
		return currPlayer.value?.username === props.player.username
	})

	const firstLetter = computed(() => {
		return props.player.username[0].toUpperCase()
	})
</script>
