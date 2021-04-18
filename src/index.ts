import dotenv from 'dotenv'
import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import basicAuth from 'express-basic-auth'
import chalk from 'chalk'
import figlet from 'figlet'

import { log, warn } from './console'
import { RaceRoom } from './race'

dotenv.config()
const env = process.env

// Display header graphic
console.log(figlet.textSync('wikirace-server', 'Big'))
console.log(chalk.yellow('>> by tinkertoe'))


// Express setup
const port = Number(env.PORT || 34611)
const app = express()

app.use(cors({
    origin: '*',
}))
app.use(express.json())
app.set('trust proxy', 1)


// Setup colyseus server
const gameServer = new Server({ server: http.createServer(app) })


// Register room handlers
gameServer.define('race', RaceRoom).enableRealtimeListing()

// Setup server monitor
if (env.MONITOR_PW) {
    const monitorAuth = basicAuth({
        users: { 'admin': env.MONITOR_PW },
        challenge: true,
    })
    app.use('/monitor',
        monitorAuth,
        monitor(),
    )
}else {
    warn('Skipping monitor setup, no password in env')
}

// Start listening
gameServer.listen(port)

// Feedback
log('Listening on ' + chalk.cyan('ws://localhost:' + port))
if (env.MONITOR_PW) { log('Monitor on ' + chalk.cyan('http://localhost:' + port + '/monitor')) }

export { gameServer }