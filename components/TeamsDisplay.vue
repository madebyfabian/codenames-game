<template>
	<div class="flex max-w-3xl mx-auto gap-6">
		<section
			v-for="(team, type) in gameState.teams.value"
			:key="type"
			class="w-full flex gap-8 items-start p-4 rounded-xl ring-2 ring-offset-2 ring-transparent relative"
			:class="{
				'bg-blue-100': type === 'blue',
				'bg-red-100': type === 'red',
				'!ring-blue-300':
					type === 'blue' &&
					gameState.status.value === 'playing' &&
					gameState.round.value.team === type,
				'!ring-red-300':
					type === 'red' &&
					gameState.status.value === 'playing' &&
					gameState.round.value.team === type,
			}"
		>
			<p
				v-if="gameState.status.value === 'playing'"
				class="absolute right-4 top-4"
			>
				<strong class="text-2xl">
					{{ team.cardsLeft }}
				</strong>
			</p>

			<div>
				<h3>Ermittler</h3>

				<ul v-if="team.operativePlayers?.length" class="flex flex-col gap-2">
					<li v-for="player of team.operativePlayers" :key="player.username">
						<PlayerDisplay v-if="player" :player="player" />
					</li>
				</ul>
				<p v-else>&mdash;</p>

				<button
					class="mt-2"
					v-if="
						(gameState.currPlayer.value?.team !== type ||
							gameState.currPlayer.value?.role !== 'operative') &&
						allowChange
					"
					@click="
						gameState.changePlayerTeamOrRole({
							team: type,
							role: 'operative',
						})
					"
				>
					{{ gameState.currPlayer.value?.team ? 'Wechseln' : 'Beitreten' }}
				</button>
			</div>

			<div>
				<h3>Geheimdienstchef</h3>

				<PlayerDisplay
					v-if="team.spymasterPlayer"
					:player="team.spymasterPlayer"
				/>
				<p v-else>&mdash;</p>

				<button
					class="mt-2"
					v-if="
						(gameState.currPlayer.value?.team !== type ||
							gameState.currPlayer.value?.role !== 'spymaster') &&
						allowChange
					"
					@click="
						gameState.changePlayerTeamOrRole({
							team: type,
							role: 'spymaster',
						})
					"
				>
					{{ gameState.currPlayer.value?.team ? 'Wechseln' : 'Beitreten' }}
				</button>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()

	const allowChange = computed(() => {
		if (gameState.status.value === 'idle') {
			return true
		}

		// If already playing, check if the player does not have a team yet
		if (!gameState.currPlayer.value?.team) {
			return true
		}

		if (gameState.debugMode.value) {
			return true
		}

		return false
	})
</script>
