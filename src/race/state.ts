import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema'

export class PlayerState extends Schema {
    @type('string')
    name: string

    @type(['string'])
    path = new ArraySchema<string>()
}

export class RaceState extends Schema {
    // List of players
    @type({ map: PlayerState })
    players = new MapSchema<PlayerState>()

    // sessionId of owner
    @type('string')
    owner: string

    // Title of article that is being raced from
    @type('string')
    fromArticle: string

    // Title of article that is being raced to
    @type('string')
    toArticle: string
}

export default RaceState