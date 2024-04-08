import type { GameWord, Player, Round } from '@/types'

type Game = {
	status: 'playing' | 'idle'
	round: Round
	players: Player[]
	gameWords: GameWord[]
}

type BroadcastEvents = 'gameStateSync' | 'requestInitialGameState'

type BroadcastPayloads = {
	gameStateSync: {
		newGame: Partial<Game>
	}
	requestInitialGameState: {
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
	const gameStateWatcherEnabled = useState<boolean>(
		'gameState:gameStateWatcherEnabled',
		() => false
	)

	const gameInitialState: Game = {
		status: 'idle',
		round: {
			team: 'red',
			role: 'spymaster',
		},
		players: [],
		gameWords: [],
	}

	// --- Game State ---
	const _game = useState<Game>('gameState', () =>
		JSON.parse(JSON.stringify(gameInitialState))
	)

	const { status, round, players, gameWords } = toRefs(_game.value)

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
			async ({ payload }: { payload: BroadcastPayloads['gameStateSync'] }) => {
				// Make sure the watcher is disabled
				await new Promise(resolve => setTimeout(resolve, 50))
				gameStateWatcherEnabled.value = false

				// Update the game state
				if (payload.newGame.status !== undefined) {
					status.value = payload.newGame.status
				}
				if (payload.newGame.round !== undefined) {
					round.value = payload.newGame.round
				}
				if (payload.newGame.players !== undefined) {
					players.value = payload.newGame.players
				}
				if (payload.newGame.gameWords !== undefined) {
					gameWords.value = payload.newGame.gameWords
				}

				// Re-enable the watcher
				await new Promise(resolve => setTimeout(resolve, 50))
				gameStateWatcherEnabled.value = true

				if (!initialized.value) {
					initialized.value = true
				}

				if (!gameStateWatcherEnabled.value) {
					gameStateWatcherEnabled.value = true
				}
			}
		)

		// Listen to requestInitialGameState broadcast event
		channel.on(
			'broadcast',
			{ event: 'requestInitialGameState' satisfies BroadcastEvents },
			({
				payload,
			}: {
				payload: BroadcastPayloads['requestInitialGameState']
			}) => {
				// Sync the game state
				// - Players Locally
				const playersUpdated = players.value
				const foundPlayer = playersUpdated.find(
					p => p.username === payload.newPlayer.username
				)
				if (!foundPlayer) {
					playersUpdated.push(payload.newPlayer)
				} else {
					Object.assign(foundPlayer, payload.newPlayer)
				}
				players.value = playersUpdated

				// - For all
				channel.send({
					type: 'broadcast',
					event: 'gameStateSync' satisfies BroadcastEvents,
					payload: {
						newGame: _game.value,
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
					event: 'requestInitialGameState' satisfies BroadcastEvents,
					payload: {
						newPlayer: newPlayer,
					} satisfies BroadcastPayloads['requestInitialGameState'],
				})
			}
		})

		channel.on(
			'presence',
			{ event: 'leave' },
			async ({ leftPresences }: { leftPresences: Player[] }) => {
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

	watch([status], newVals => {
		if (!gameStateWatcherEnabled.value) {
			return
		}
		channel.value.send({
			type: 'broadcast',
			event: 'gameStateSync' satisfies BroadcastEvents,
			payload: {
				newGame: {
					status: status.value,
				},
			} satisfies BroadcastPayloads['gameStateSync'],
		})
	})

	watch([round], () => {
		if (!gameStateWatcherEnabled.value) {
			return
		}
		channel.value.send({
			type: 'broadcast',
			event: 'gameStateSync' satisfies BroadcastEvents,
			payload: {
				newGame: {
					round: round.value,
				},
			} satisfies BroadcastPayloads['gameStateSync'],
		})
	})

	watch(
		[players],
		newVals => {
			if (!gameStateWatcherEnabled.value) {
				return
			}
			channel.value.send({
				type: 'broadcast',
				event: 'gameStateSync' satisfies BroadcastEvents,
				payload: {
					newGame: {
						players: players.value,
					},
				} satisfies BroadcastPayloads['gameStateSync'],
			})
		},
		{ deep: true }
	)

	watch(
		[gameWords],
		() => {
			if (!gameStateWatcherEnabled.value) {
				return
			}
			channel.value.send({
				type: 'broadcast',
				event: 'gameStateSync' satisfies BroadcastEvents,
				payload: {
					newGame: {
						gameWords: gameWords.value,
					},
				} satisfies BroadcastPayloads['gameStateSync'],
			})
		},
		{ deep: true }
	)

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
					newGame: {
						players: players.value,
					},
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

	const guessCard = (wordPosition: { x: number; y: number }) => {
		const word = gameWords.value.find(
			w => w.position.x === wordPosition.x && w.position.y === wordPosition.y
		)
		if (!word) {
			console.error('Word not found', wordPosition)
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
			endGame()
			alert('Game over, you chose the assassin!')
			return
		}

		word.status = 'revealed'

		if (word.type !== round.value.team) {
			endRound()
			return
		}

		// Check if one of the teams has no cards left
		if (teams.value.blue.cardsLeft === 0) {
			endGame()
			alert('Game over, blue wins!')
			return
		}
		if (teams.value.red.cardsLeft === 0) {
			endGame()
			alert('Game over, red wins!')
			return
		}
	}

	/** @internal */
	const endGame = () => {
		status.value = gameInitialState.status
		round.value = gameInitialState.round
		players.value = gameInitialState.players
		gameWords.value = gameInitialState.gameWords
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
		// State
		status: readonly(status),
		round: readonly(round),
		players: readonly(players),
		gameWords: readonly(gameWords),

		// Computeds
		teams: readonly(teams),
		currPlayer: readonly(currPlayer),

		// Methods
		startGame,
		changePlayerTeamOrRole,
		updateRound,
		endRound,
		guessCard,
	}
}
