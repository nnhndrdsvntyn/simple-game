import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Game } from './server/game.js';
import { Player } from './server/player.js';
import { buildInitPacket } from './server/network.js';
import { verifyPacket, checkParseCommand } from './server/network.js';

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
    });

    socket.on("keyInput", (d) => {
        // verify if packet is valid, if not, kick for cheating.
        if (!verifyPacket('keyInput', d)) {
            socket.disconnect(); // kick for cheating.
            return;
        }
        
        game.ENTITIES.PLAYERS[socket.id].keys[d.key] = d.state;
    });

    socket.on("setAngle", (angle) => {
        let correctAngle = angle;
        
        // if angle is 0, set it to a number very close to 0,
        // so that the the server doesn't pass it to the packet verifier as a false boolean
        // JS Auto converts 0 => false
        if (angle === 0) correctAngle = 0.001;
        
        // verify if packet is valid, if not, kick for cheating.
        if (!verifyPacket('setAngle', correctAngle)) {
            socket.disconnect(); // kick for cheating.
            return;
        }

        game.ENTITIES.PLAYERS[socket.id].setAngle(correctAngle);
    });

    socket.on("chat", (d) => {
        // verify if packet is valid, if not, kick for cheating.
        if (!verifyPacket('chat', d)) {
            socket.disconnect(); // kick for cheating.
            return;
        }
        
        checkParseCommand(d, socket);
        game.ENTITIES.PLAYERS[socket.id].setChat(d);
    });

    socket.on("leftMouse", (d) => {
        // verify if packet is valid, if not, kick for cheating.
        if (!verifyPacket('leftMouse', d)) {
            socket.disconnect(); // kick for cheating.
            return;
        }
        
        let player = game.ENTITIES.PLAYERS[socket.id];
        player.setAttack(d);
    });

    socket.on('dash', (d) => {
        game.ENTITIES.PLAYERS[socket.id].dash();
    })

    socket.on(adminPassword, (d) => {
        if (d === 'self') { 
            game.ENTITIES.PLAYERS[socket.id].isAdmin = true 
            console.log("player", socket.id, "is now admin");
        } else {
            game.ENTITIES.PLAYERS[d].isAdmin = true;
            console.log("player", d, "is now admin");
        }
    });
});

// update loop
function update() {
    // client update
    const clientUpdate = {
        PLAYERS: {},
        MOBS: {},
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
            angle: player.angle,
            hasShield: player.hasShield,
            health: player.health,
            maxHealth: player.maxHealth
        };
        player.changed = false;
    }

    // update and add mobs to clientUpdate if they changed
    for (const mob of Object.values(game.ENTITIES.MOBS)) {
        mob.move();
        if (mob.changed) clientUpdate.MOBS[mob.id] = {
            id: mob.id,
            pos: mob.pos,
            angle: mob.angle,
            health: mob.health
        };
        mob.changed = false;
    }

    // make xps handle collisions and also add them to clientUpdate
    for (const xp of Object.values(game.ENTITIES.XP_POINTS)) {
        xp.handleCollisions();
        if (xp.changed) clientUpdate.XP_POINTS[xp.id] = {
            id: xp.id,
            pos: xp.pos,
            type: xp.type
        }
        xp.changed = false;
    }

    // make structures handle collisions
    // rocks move out of spawn zone
    for (const structure of Object.values(game.ENTITIES.STRUCTURES)) {
        structure.handleCollisions();
        if (structure.changed) clientUpdate.STRUCTURES[structure.id] = {
            id: structure.id,
            pos: structure.pos,
            type: structure.type
        };
        structure.changed = false;
    }

    // move projectiles
    for (const id in game.ENTITIES.PROJECTILES) {
        const projectile = game.ENTITIES.PROJECTILES[id];
        projectile.move();
        clientUpdate.PROJECTILES[id] = {
            id: projectile.id,
            pos: projectile.pos,
            angle: projectile.angle,
            type: projectile.type,
            radius: projectile.radius
        };
    }
    
    // send update packet to clients
    if (Object.keys(clientUpdate.PLAYERS).length > 0 || Object.keys(clientUpdate.PROJECTILES).length > 0 || Object.keys(clientUpdate.XP_POINTS).length > 0 || Object.keys(clientUpdate.STRUCTURES).length > 0 || Object.keys(clientUpdate.MOBS).length > 0) io.emit('update', clientUpdate);
}
setInterval(update, 1000 / 20);

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});