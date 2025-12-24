import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Game } from './server/game.js';
import { Player } from './server/player.js';
import { buildInitPacket } from './server/network.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const game = new Game(io);
export { game };

io.on('connection', (socket) => {
    console.log("socket connected", socket.id);

    // create the new player
    game.newEntity('PLAYERS', new Player(socket.id));

    // send other clients an add packet
    socket.broadcast.emit('add', {
        type: 'PLAYERS',
        id: socket.id
    });

    socket.emit('init', buildInitPacket()); // send new client game data

    socket.on("disconnect", () => {
        game.deleteEntity('PLAYERS', socket.id);

        // send other clients a delete packet
        socket.broadcast.emit('delete', {
            type: 'PLAYERS',
            id: socket.id
        })
    });

    socket.on("keyInput", (d) => {
        game.ENTITIES.PLAYERS[socket.id].keys[d.key] = d.state;
    });
});

// update loop
function update() {
    // client update
    const clientUpdate = {
        PLAYERS: {}
    };
    
    // update and add players to clientUpdate if they actually changed
    for (const player of Object.values(game.ENTITIES.PLAYERS)) {
        player.move(); // NOTE: only moves if players have any velocity.
        if (player.changed) clientUpdate.PLAYERS[player.id] = {
            id: player.id,
            pos: player.pos
        };
        player.changed = false;
    }
    
    // send update packet to clients
    if (Object.keys(clientUpdate.PLAYERS).length > 0) io.emit('update', clientUpdate);
}
setInterval(update, 1000 / 20);

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});