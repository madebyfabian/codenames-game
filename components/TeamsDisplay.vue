<template>
	<div
		class="flex max-w-5xl mx-auto"
		:class="[gameState.status.value === 'playing' ? 'gap-12' : 'gap-6']"
	>
		<section
			v-for="(team, type) in gameState.teams.value"
			:key="type"
			class="w-full flex gap-8 items-start p-4 rounded-xl ring-2 ring-offset-2 ring-transparent relative"
			:class="{
				'bg-blue-100': type === 'blue',
				'bg-red-100': type === 'red',
				'scale-110 -translate-y-2 shadow-md':
					gameState.status.value === 'playing' &&
					gameState.round.value.team === type,
				'!ring-blue-300':
					type === 'blue' && gameState.currPlayer.value?.team === type,
				'!ring-red-300':
					type === 'red' && gameState.currPlayer.value?.team === type,
			}"
		>
			<h2 class="capitalize">
				Team {{ type }}
				<span v-if="type === gameState.currPlayer.value?.team">
					<br />
					<span class="text-sm block">(Dein Team)</span>
				</span>
			</h2>

			<p
				v-if="gameState.status.value === 'playing'"
				class="absolute right-4 top-4"
			>
				<strong class="text-2xl">
					{{ team.cardsLeft }}
				</strong>
			</p>

			<div>
				<h3>Operative</h3>

				<ul v-if="team.operativePlayers?.length" class="flex flex-col gap-2">
					<li v-for="player of team.operativePlayers" :key="player.username">
						<PlayerDisplay v-if="player" :player="player" />
					</li>
				</ul>
				<p v-else>&mdash;</p>

				<button
					class="mt-2"
					v-if="
						gameState.currPlayer.value?.team !== type ||
						gameState.currPlayer.value?.role !== 'operative'
					"
					@click="
						gameState.changePlayerTeamOrRole({
							team: type,
							role: 'operative',
						})
					"
				>
					{{ gameState.currPlayer.value?.team ? 'Switch' : 'Join' }}
				</button>
			</div>

			<div>
				<h3>Spymaster</h3>

				<PlayerDisplay
					v-if="team.spymasterPlayer"
					:player="team.spymasterPlayer"
				/>
				<p v-else>&mdash;</p>

				<button
					class="mt-2"
					v-if="
						gameState.currPlayer.value?.team !== type ||
						gameState.currPlayer.value?.role !== 'spymaster'
					"
					@click="
						gameState.changePlayerTeamOrRole({
							team: type,
							role: 'spymaster',
						})
					"
				>
					{{ gameState.currPlayer.value?.team ? 'Switch' : 'Join' }}
				</button>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import { useGameState } from '@/store/gameState'
	const gameState = useGameState()
</script>
