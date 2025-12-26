import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Game } from './server/game.js';
import { Player } from './server/player.js';
import { Projectile } from './server/projectile.js';
import { buildInitPacket } from './server/network.js';
import { checkParseCommand } from './server/network.js';

const app = express();
const server = http.createServer(app);
export const io = new Server(server);

app.use(express.static('public'));

let adminPassword = "";
const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
for (let i = 0; i < 30; i++) {
    adminPassword += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
};
console.log("ADMIN PASSWORD:", adminPassword);

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

    socket.on("setAngle", (angle) => {
        game.ENTITIES.PLAYERS[socket.id].setAngle(Math.round(angle));
    });

    socket.on("chat", (d) => {
        if (d.message.length > 50) return;
        checkParseCommand(d.message, socket);
        game.ENTITIES.PLAYERS[socket.id].setChat(d.message);
    });

    socket.on("mouseLeft", () => {
        let player = game.ENTITIES.PLAYERS[socket.id];
        let id = Math.random().toString();
        let projectile = new Projectile(id, { ... player.pos} , player.angle, 'bullet', socket.id);
        game.ENTITIES.PROJECTILES[id] = projectile;
        io.emit('add', {
            type: 'PROJECTILES',
            id: id,
            entity: projectile
        });
    })

    socket.on(adminPassword, (d) => {
        if (d === 'self') { 
            game.ENTITIES.PLAYERS[socket.id].isAdmin = true 
            console.log("player", socket.id, "is now admin");
        } else {
            game.ENTITIES.PLAYERS[d].isAdmin = true;
            console.log("player", d, "is now admin");
        }
    })
});

// update loop
function update() {
    // client update
    const clientUpdate = {
        PLAYERS: {},
        STRUCTURES: {},
        XP_POINTS: {},
        PROJECTILES: {}
    };
    
    // update and add players to clientUpdate if they actually changed
    for (const player of Object.values(game.ENTITIES.PLAYERS)) {
        player.handleCollisions();
        player.move(); // NOTE: only moves if players have any velocity.
        if (player.changed) clientUpdate.PLAYERS[player.id] = {
            id: player.id,
            pos: player.pos,
            chatMessage: player.chatMessage,
            score: player.score,
            radius: player.radius,
            angle: player.angle
        };
        player.changed = false;
    }

    // make xps handle collisions
    for (const xp of Object.values(game.ENTITIES.XP_POINTS)) {
        xp.handleCollisions();
        xp.changed = false;
    }

    // move projectiles
    for (const projectile of Object.values(game.ENTITIES.PROJECTILES)) {
        projectile.move();
        clientUpdate.PROJECTILES[projectile.id] = projectile;
    }
    
    // send update packet to clients
    if (Object.keys(clientUpdate.PLAYERS).length > 0 || Object.keys(clientUpdate.PROJECTILES).length > 0) io.emit('update', clientUpdate);
}
setInterval(update, 1000 / 20);

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});