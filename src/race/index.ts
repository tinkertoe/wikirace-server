import { Room, Client, ServerError } from 'colyseus'
import { RaceState, PlayerState } from './state'
import http from 'http'

export class RaceRoom extends Room<RaceState> {
    // When room is initialized
    onCreate (options: any) {
        this.setState(new RaceState())
        this.setPrivate(true)

        this.onMessage('owner', (client: Client, data: any) => {
            if (client.sessionId === this.state.owner) {
                if (data && data.owner && typeof(data.owner) === 'string') {
                    this.state.owner = data.owner
                }
            }
        })

        this.onMessage('article', (client: Client, data: any) => {
            // Message need to come from owner and be valid
            // Room also needs to be unlocked (in lobby/setup phase)
            if (client.sessionId === this.state.owner && data && data.slot && data.article && !this.locked) {
                switch (data.slot) {
                    case 'from': this.state.fromArticle = data.article
                    case 'to': this.state.toArticle = data.article
                }
            }
        })

        this.onMessage('start', (client: Client, data: any) => {
            if (client.sessionId === this.state.owner) {
                this.lock()
                this.broadcast('start', {})
                // If this is not the first round of the room we need to clear the path data of every player from last round
                // Doing this on gameover (win) will remove it from state as soon as smb. wins
                // This means, that there won't be enough time for the client to display it
                // So we just keep it until the next game starts
                this.state.players.forEach((player: PlayerState) => {
                  player.path.clear()
                })
            }
        })

        this.onMessage('nav', (client: Client, data: any) => {
            if (data && data.article) {
                this.state.players.get(client.sessionId).path.push(data.article)
                
                if (data.article === this.state.toArticle) {
                    // bitch, we won
                    this.broadcast('win', { winner: client.sessionId })
                    this.unlock()
                }
            }
        })
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: any, request: http.IncomingMessage): boolean {
        // Only let him in, if he supplies a username in the options
        if (options && options.name) {
            return true
        } else {
            throw new ServerError(400, 'Missing name')
        }
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        // Add him to state
        this.state.players.set(client.sessionId, new PlayerState())
        this.state.players.get(client.sessionId).name = options.name
        // If there is no owner, make him
        // When the room is created and owner is unset, first client (creator) will be owner
        if (!this.state.owner) {
            this.state.owner = client.sessionId
        }
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        // Remove him from state
        this.state.players.delete(client.sessionId)

        // If there is anyone left make someone else owner
        // Otherwise room will get disposed
        if (client.sessionId === this.state.owner && this.clients.length > 0) {
            this.state.owner = this.clients[0].sessionId
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}