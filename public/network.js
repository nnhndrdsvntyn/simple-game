import { ENTITIES } from './game.js';
import { Player } from './player.js';
import { Structure } from './structure.js'
import { XP } from './xp.js'
import { camera } from './client.js';

export class Network {
    constructor(socket) {
        this.socket = socket;

        this.socket.on("init", (data) => this.onInit(data));
        this.socket.on("add", (data) => this.onAdd(data));
        this.socket.on("delete", (data) => this.onDelete(data));
        this.socket.on('update', (data) => this.onUpdate(data));
    }

    onInit(data) {
        console.log('init:', data);

        // populate player list
        for (const id in data.PLAYERS) {
            const player = data.PLAYERS[id];
            ENTITIES.PLAYERS[id] = new Player(player.id, player.pos);
            ENTITIES.PLAYERS[id].chatMessage = player.chatMessage;
            ENTITIES.PLAYERS[id].score = player.score;
        }

        // ensure camera follows the local player
        setTimeout(() => {
            if (ENTITIES.PLAYERS[socket.id]) camera.setTarget(ENTITIES.PLAYERS[socket.id]);
        }, 100);

        // populate structure list
        for (const id in data.STRUCTURES) {
            const structure = data.STRUCTURES[id];
            ENTITIES.STRUCTURES[id] = new Structure(id, structure.pos, structure.type);
        }

        // populate xp points list
        for (const id in data.XP_POINTS) {
            const xp = data.XP_POINTS[id];
            ENTITIES.XP_POINTS[id] = new XP(id, xp.pos, xp.type);
        }
    }

    onAdd(data) {
        console.log('add:', data);
        if (data.type === 'PLAYERS') {
            ENTITIES[data.type][data.id] = new Player(data.id);
        }
        if (data.type === 'XP_POINTS') ENTITIES[data.type][data.id] = new XP(data.id, data.entity.pos, data.entity.type);     
    }

    onDelete(data) {
        console.log('delete:', data);
        delete ENTITIES[data.type][data.id];
    }

    onUpdate(data) {
        console.log('update:', data);
        for (const id in data.PLAYERS) {
            ENTITIES.PLAYERS[id].newPos = data.PLAYERS[id].pos;
            ENTITIES.PLAYERS[id].chatMessage = data.PLAYERS[id].chatMessage;
            ENTITIES.PLAYERS[id].newScore = data.PLAYERS[id].score;
            ENTITIES.PLAYERS[id].newRadius = data.PLAYERS[id].radius;
        }
    }
}