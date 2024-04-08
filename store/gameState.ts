import type { GameWord, Player, PlayerBase, Round } from '@/types'

type BroadcastEvents = 'gameStateSync' | 'requestGameState'

type BroadcastPayloads = {
	gameStateSync: {
		playersUpdated?: Player[]
	}
	requestGameState: {
		newPlayer: Player
	}
}

export const useGameState = () => {
	const supabase = useSupabaseClient()
	const route = useRoute()

	// --- URL State ---
	const roomSlug = computed(() => route.params.roomSlug)
	const currPlayerUsername = computed(() => String(route.query.player))
	if (!currPlayerUsername) {
		throw createError({
			statusCode: 500,
			message: 'Invalid player query',
			fatal: true,
		})
	}

	// --- Internal State ---
	const initialized = useState<boolean>('gameState:initialized', () => false)

	// --- Game State ---
	const status = useState<'playing' | 'idle'>('gameState:status', () => 'idle')
	const round = useState<Round>('gameState:round', () => ({
		team: 'red',
		role: 'spymaster',
	}))
	const players = useState<Player[]>('gameState:players', () => [])
	const gameWords = useState<GameWord[]>('gameState:gameWords', () => [])

	// --- Realtime ---
	// Join a room/topic.
	const channel = useState('gameState:channel', () => {
		const channel = supabase.channel(`room:${roomSlug.value}`, {
			config: {
				presence: {
					key: currPlayerUsername.value,
				},
			},
		})

		// Listen to gameStateSync broadcast event
		channel.on(
			'broadcast',
			{ event: 'gameStateSync' satisfies BroadcastEvents },
			({ payload }: { payload: BroadcastPayloads['gameStateSync'] }) => {
				// Update the players list
				if (payload.playersUpdated) {
					players.value = payload.playersUpdated
				}

				if (!initialized.value) {
					initialized.value = true
				}
			}
		)

		// Listen to requestGameState broadcast event
		channel.on(
			'broadcast',
			{ event: 'requestGameState' satisfies BroadcastEvents },
			({ payload }: { payload: BroadcastPayloads['requestGameState'] }) => {
				// Sync the game state
				// - Locally
				const playersUpdated = [...players.value]
				if (
					!playersUpdated.find(p => p.username === payload.newPlayer.username)
				) {
					playersUpdated.push(payload.newPlayer)
				} else {
					console.warn('player already exists')
				}
				players.value = playersUpdated

				// - For all
				channel.send({
					type: 'broadcast',
					event: 'gameStateSync' satisfies BroadcastEvents,
					payload: {
						playersUpdated,
					} satisfies BroadcastPayloads['gameStateSync'],
				})
			}
		)

		channel.on('presence', { event: 'join' }, () => {
			if (initialized.value) {
				return
			}

			const amountOfPlayers = Object.keys(channel.presenceState()).length
			if (amountOfPlayers === 0) {
				return // Somehow the first time this runs, it's 0
			}

			const newPlayer = { username: currPlayerUsername.value }

			if (amountOfPlayers === 1) {
				// If already initialized, skip
				if (initialized.value) {
					return
				}

				// Update the players list
				players.value = [newPlayer]

				// Finished initializing
				initialized.value = true
			} else {
				// Request game state from other (will get it back only from host)
				channel.send({
					type: 'broadcast',
					event: 'requestGameState' satisfies BroadcastEvents,
					payload: {
						newPlayer: newPlayer,
					} satisfies BroadcastPayloads['requestGameState'],
				})
			}
		})

		channel.on(
			'presence',
			{ event: 'leave' },
			async ({ leftPresences }: { leftPresences: Player[] }) => {
				console.log('leave', leftPresences)
				await new Promise(resolve => setTimeout(resolve, 3000))

				const currentPlayers = Object.keys(channel.presenceState())

				const playersReallyLeft: Player[] = []

				for (const leftPresence of leftPresences) {
					// Check if the player has really left, or if it was just a change in the game state that causes a quick leave + instant connect
					const isStillPresent = currentPlayers.includes(leftPresence.username)
					if (isStillPresent) {
						continue
					}

					// Play has really left
					playersReallyLeft.push(leftPresence)
				}

				if (playersReallyLeft.length === 0) {
					return
				}

				const playersUpdated = players.value.filter(p => {
					return !playersReallyLeft.find(lp => lp.username === p.username)
				})

				console.warn('Removing players', playersReallyLeft)
				players.value = playersUpdated
			}
		)

		// Subscribe to the Channel
		channel.subscribe(status => {
			if (status !== 'SUBSCRIBED') {
				return
			}

			channel.track({
				username: currPlayerUsername.value,
			})
		})

		return channel
	})

	// --- Methods ---

	const getPlayerByUsername = (username: string | undefined) => {
		return players.value.find(player => player.username === username)
	}

	const changePlayerTeamOrRole = ({ team, role }: Omit<Player, 'username'>) => {
		const player = getPlayerByUsername(currPlayerUsername.value)
		if (player) {
			// Check if there is a player in the same team that is already a spymaster
			const teamSpymasters = players.value.filter(
				p => p.team === team && p.role === 'spymaster'
			)
			if (role === 'spymaster' && teamSpymasters.length > 0) {
				alert('There is already a spymaster in this team')
				return
			}

			// Update local state
			if (team) {
				player.team = team
			}
			if (role) {
				player.role = role
			}

			channel.value.send({
				type: 'broadcast',
				event: 'gameStateSync' satisfies BroadcastEvents,
				payload: {
					playersUpdated: players.value,
				} satisfies BroadcastPayloads['gameStateSync'],
			})
		}
	}

	const updateRound = (_round: Pick<Round, 'clue' | 'number'>) => {
		const newRound = {
			...round.value,
			..._round,
			role: 'operative',
		} satisfies Round
		round.value = newRound
	}

	const guessCard = (word: GameWord) => {
		if (status.value !== 'playing') {
			return
		}
		const player = getPlayerByUsername(currPlayerUsername.value)
		if (!player) {
			return
		}

		if (player.role !== 'operative') {
			return
		}

		if (word.status === 'revealed') {
			return
		}
		if (word.type === 'assassin') {
			status.value = 'idle'
			alert('Game over')
			return
		}

		word.status = 'revealed'

		if (word.type !== round.value.team) {
			endRound()
		}

		// Check if all cards are revealed
		if (gameWords.value.every(w => w.status === 'revealed')) {
			status.value = 'idle'
			alert('Game over')
		}
	}

	const endRound = () => {
		const newRound = {
			team: round.value.team === 'blue' ? 'red' : 'blue',
			role: 'spymaster',
		} satisfies Round
		round.value = newRound
	}

	/** @internal */
	const fetchWords = async () => {
		const limit = 5 * 5

		// First get amount of rows
		const { count } = await supabase
			.from('dictionary')
			.select('*', { count: 'exact', head: true })
			.throwOnError()
		if (count === null) {
			throw new Error('Count is null')
		}

		// between 0 and count - limit
		const randomOffset = Math.floor(Math.random() * (count - limit))

		// Get the data
		const { data } = await supabase
			.from('dictionary')
			.select('id, word')
			.range(randomOffset, randomOffset + limit - 1)
			.order('id')
			.throwOnError()

		return data
	}

	/** @internal */
	const randomBetween = (min: number, max: number) =>
		Math.floor(Math.random() * (max - min + 1)) + min

	const startGame = async () => {
		// Get random 25 words
		const words = await fetchWords()

		let blueCardsToUse = 8 // 1 lower because this is the starting team
		let redCardsToUse = 9
		let neutralCardsToUse = 7
		let assassinCardToUse = 1

		const generateAllPossiblePositions = () => {
			const positions = []
			for (let x = 0; x < 5; x++) {
				for (let y = 0; y < 5; y++) {
					positions.push({ x, y })
				}
			}
			return positions
		}
		let positionsToUse = generateAllPossiblePositions()

		gameWords.value =
			words?.map(w => {
				const getType = () => {
					if (blueCardsToUse > 0) {
						blueCardsToUse--
						return 'blue'
					}
					if (redCardsToUse > 0) {
						redCardsToUse--
						return 'red'
					}
					if (neutralCardsToUse > 0) {
						neutralCardsToUse--
						return 'neutral'
					}
					if (assassinCardToUse > 0) {
						assassinCardToUse--
						return 'assassin'
					}
					// only for typesafety
					return 'neutral'
				}

				// Get random position
				const randomIndex = randomBetween(0, positionsToUse.length - 1)
				const position = positionsToUse[randomIndex]
				positionsToUse.splice(randomIndex, 1)

				return {
					word: w.word,
					position: position,
					type: getType(),
					status: 'hidden',
				}
			}) ?? []

		if (gameWords.value.length !== 25) {
			throw new Error('Expected 25 words')
		}

		// Set status to playing
		status.value = 'playing'
	}

	// --- Computeds ---

	const teams = computed(() => ({
		blue: {
			spymasterPlayer: players.value.find(
				p => p.team === 'blue' && p.role === 'spymaster'
			),
			operativePlayers: players.value.filter(
				p => p.team === 'blue' && p.role === 'operative'
			),
			cardsLeft: gameWords.value.filter(
				w => w.type === 'blue' && w.status !== 'revealed'
			).length,
		},
		red: {
			spymasterPlayer: players.value.find(
				p => p.team === 'red' && p.role === 'spymaster'
			),
			operativePlayers: players.value.filter(
				p => p.team === 'red' && p.role === 'operative'
			),
			cardsLeft: gameWords.value.filter(
				w => w.type === 'red' && w.status !== 'revealed'
			).length,
		},
	}))

	const currPlayer = computed(() => {
		return getPlayerByUsername(currPlayerUsername.value)
	})

	return {
		roomSlug: readonly(roomSlug),
		currPlayer: readonly(currPlayer),
		round: readonly(round),
		status: readonly(status),
		teams: teams,
		players,
		gameWords,

		// Methods
		startGame,
		changePlayerTeamOrRole,
		updateRound,
		endRound,
		guessCard,
	}
}
