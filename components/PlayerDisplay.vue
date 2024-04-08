<template>
	<div class="flex items-center gap-2">
		<span
			class="size-6 rounded-full flex items-center justify-center font-bold"
			:class="{
				'bg-blue-300 text-blue-500': player?.team === 'blue',
				'bg-red-300 text-red-500': player?.team === 'red',
			}"
		>
			{{ firstLetter }}
		</span>
		{{ player.username }}
		<template v-if="isCurrPlayer">(du)</template>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	import type { Player } from '@/types'

	const props = defineProps<{
		player: Player
	}>()

	const { currPlayerUsername } = useGameState()

	const isCurrPlayer = computed(() => {
		return currPlayerUsername.value === props.player.username
	})

	const firstLetter = computed(() => {
		return props.player.username[0].toUpperCase()
	})
</script>
