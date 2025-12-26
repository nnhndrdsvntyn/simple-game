import {
    game
} from '../server.js';

export function buildInitPacket() {
    const initPacket = {
        PLAYERS: {},
        STRUCTURES: {},
        XP_POINTS: {},
        PROJECTILES: {}
    };

    // client-ify players (only send position, id, and chat message)
    Object.values(game.ENTITIES.PLAYERS).forEach(player => {
        initPacket['PLAYERS'][player.id] = {
            id: player.id,
            pos: player.pos,
            radius: player.radius,
            chatMessage: player.chatMessage,
            score: player.score,
            angle: player.angle
        };
    });

    // send structure data to clients
    Object.values(game.ENTITIES.STRUCTURES).forEach(structure => {
        initPacket['STRUCTURES'][structure.id] = structure;
    });

    // send xp points data to clients
    Object.values(game.ENTITIES.XP_POINTS).forEach(xp => {
        initPacket['XP_POINTS'][xp.id] = xp;
    });

    // send projectile data to clients
    Object.values(game.ENTITIES.PROJECTILES).forEach(projectile => {
        initPacket['PROJECTILES'][projectile.id] = projectile;
    });

    // return the init packet
    return initPacket;
}

export function checkParseCommand(chat, socket) {
    if (!game.ENTITIES.PLAYERS[socket.id].isAdmin) return; // only allow admins to run commands

    // LOGIC BELOW IS WRITTEN BY MOSTLY AI :)
    
    if (!chat.startsWith('/')) return null;
    
    const [command, ...args] = chat.split(' ');
    const fullArgs = args.join(' ');
    
    // Helper function to get player by ID
    const getPlayer = (id) => {
        if (id === 'self') return game.ENTITIES.PLAYERS[socket.id];
        return game.ENTITIES.PLAYERS[id];
    };
    
    // Helper function to parse coordinates
    const parseCoordinates = (str) => {
        const match = str.match(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (!match) return null;
        return [parseInt(match[1]), parseInt(match[2])];
    };
    
    if (command === '/tppos') {
        // Format: /tppos (playerId, (x, y))
        const match = fullArgs.match(/\(\s*(self|[a-zA-Z0-9_]+)\s*,\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)/);
        if (match) {
            const [, playerId, x, y] = match;
            const player = getPlayer(playerId);
            if (player) {
                player.pos.x = parseInt(x);
                player.pos.y = parseInt(y);
                player.changed = true;
                return { command, args: [playerId, parseInt(x), parseInt(y)] };
            }
        }
    }
    
    else if (command === '/tpplayer') {
        // Format: /tpplayer (playerId, targetPlayerId)
        const match = fullArgs.match(/\(\s*(self|[a-zA-Z0-9_]+)\s*,\s*(self|[a-zA-Z0-9_]+)\s*\)/);
        if (match) {
            const [, playerId, targetId] = match;
            const player = getPlayer(playerId);
            const targetPlayer = getPlayer(targetId);
            
            if (player && targetPlayer) {
                player.pos.x = targetPlayer.pos.x;
                player.pos.y = targetPlayer.pos.y;
                player.changed = true;
                return { command, args: [playerId, targetId] };
            }
        }
    }
    
    else if (command === '/setspeed') {
        // Format: /setspeed (playerId, speed)
        const match = fullArgs.match(/\(\s*(self|[a-zA-Z0-9_]+)\s*,\s*(default|\d+(\.\d+)?)\s*\)/);
        if (match) {
            const [, playerId, speedStr] = match;
            const player = getPlayer(playerId);
            
            if (player) {
                const speed = speedStr === 'default' ? 20 : parseFloat(speedStr);
                player.speed = speed;
                player.changed = true;
                return { command, args: [playerId, speed] };
            }
        }
    }

    else if (command === '/setscore') {
        // Format: /setscore (playerId, score)
        const match = fullArgs.match(/\(\s*(self|[a-zA-Z0-9_]+)\s*,\s*(\d+)\s*\)/);
        if (match) {
            const [, playerId, score] = match;
            const player = getPlayer(playerId);
            
            if (player) {
                player.score = parseInt(score);
                player.changed = true;
                return { command, args: [playerId, score] };
            }
        }
    }

    else if (command === '/setradius') {
        // Format: /setradius (playerId, radius)
        const match = fullArgs.match(/\(\s*(self|[a-zA-Z0-9_]+)\s*,\s*(\d+)\s*\)/);
        if (match) {
            const [, playerId, radius] = match;
            const player = getPlayer(playerId);
            
            if (player) {
                player.radius = parseInt(radius);
                player.changed = true;
                return { command, args: [playerId, radius] };
            }
        }
    }
    
    return null;
}