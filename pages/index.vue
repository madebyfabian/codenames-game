<template>
	<div class="pb-12 h-screen flex flex-col">
		<GlobalHeader />

		<div
			class="max-w-lg mx-auto p-12 bg-gradient-to-br from-orange-600 to-yellow-400 text-white rounded-2xl"
		>
			<h1 class="text-center text-3xl font-bold">Spiele Codenames online.</h1>

			<section class="mt-8 text-center w-full">
				<div class="mt-6">
					<button
						@click="handleCreateGame"
						class="w-full mt-3 text-gray-700 h-16 !text-lg border-none bg-white"
					>
						Neues Spiel erstellen
					</button>
				</div>
			</section>
		</div>

		<footer class="mt-24 flex-1 flex items-end justify-center">
			<p class="mt-6 xl:mt-0 text-center">
				Copyright © 2024 All Rights belong to Czech Games Edition
				<br />
				By
				<a class="underline" href="https://twitter.com/@madebyfabian">
					@madebyfabian
				</a>
			</p>
		</footer>
	</div>
</template>

<script setup lang="ts">
	const generateRandomId = () =>
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)

	const handleCreateGame = () => {
		navigateTo({
			name: 'game-roomSlug',
			params: {
				roomSlug: generateRandomId(),
			},
		})
	}
</script>
