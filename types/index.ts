export type PlayerBase = {
	username: string
}

export type Player = PlayerBase & {
	team?: 'blue' | 'red'
	role?: 'spymaster' | 'operative'
}

export type GameWord = {
	word: string
	position: { x: number; y: number }
	type: 'red' | 'blue' | 'neutral' | 'assassin'
	status: 'hidden' | 'revealed'
}
