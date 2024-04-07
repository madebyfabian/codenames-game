<template>
	<div>
		<pre>{{ roomSlug }}</pre>
		<button @click="sendMessage">Send message</button>
	</div>
</template>

<script setup lang="ts">
	const supabase = useSupabaseClient()

	const route = useRoute()
	const roomSlug = ref(String(route.params.roomSlug))

	/** @temp */
	const player = ref<'A' | 'B'>(String(route.query.player) as any)
	if (!['A', 'B'].includes(player.value)) {
		throw createError({
			statusCode: 500,
			message: 'Invalid player query, param, must be A or B',
			fatal: true,
		})
	}

	// ---

	// Join a room/topic.
	const channel = supabase.channel(`room:${roomSlug.value}`)

	// Simple function to log any messages we receive
	function messageReceived(payload: any) {
		console.log(payload)
	}

	// Subscribe to the Channel
	channel
		.on('presence', { event: 'sync' }, () => {
			const newState = channel.presenceState()
			console.log('sync', newState)
		})
		.on('presence', { event: 'join' }, ({ key, newPresences }) => {
			console.log('join', key, newPresences)
		})
		.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
			console.log('leave', key, leftPresences)
		})
		.on('broadcast', { event: 'test' }, payload => messageReceived(payload))
		.subscribe()

	if (player.value === 'A') {
	} else if (player.value === 'B') {
	}

	const sendMessage = () => {
		channel.send({
			type: 'broadcast',
			event: 'test',
			payload: { message: 'hello, world' },
		})
	}
</script>
