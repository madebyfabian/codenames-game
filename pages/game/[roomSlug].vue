<template>
	<div>
		<ViewGame v-if="currPlayerUsernameCookie" />

		<template v-else>
			<div class="mt-12 max-w-lg mx-auto p-12 bg-gray-50 rounded-2xl">
				<h1 class="text-center text-3xl font-bold">Welcome!</h1>

				<p class="text-center mt-2">Enter a nickname to join the room</p>

				<form
					@submit.prevent="handleSubmit"
					class="mt-8 text-center flex flex-col gap-3 w-full"
				>
					<input
						type="text"
						placeholder="Your nickname"
						class="w-full text-center"
						v-model="playerInput"
					/>
					<button type="submit" class="primary w-full h-12">Join game</button>
				</form>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	const currPlayerUsernameCookie = useCookie('currPlayerUsername')
	const playerInput = ref('')

	const handleSubmit = () => {
		currPlayerUsernameCookie.value = playerInput.value
		location.reload()
	}
</script>
