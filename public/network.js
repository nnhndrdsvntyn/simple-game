import { ENTITIES } from './game.js';
import { Player } from './player.js';
import { Structure } from './structure.js'

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
        }

        // populate structure list
        for (const id in data.STRUCTURES) {
            const structure = data.STRUCTURES[id];
            ENTITIES.STRUCTURES[id] = new Structure(id, structure.pos, structure.type);
        }
    }

    onAdd(data) {
        console.log('add:', data);
        ENTITIES[data.type][data.id] = new Player(data.id);        
    }

    onDelete(data) {
        console.log('delete:', data);
        delete ENTITIES[data.type][data.id];
    }

    onUpdate(data) {
        console.log('update:', data);
        for (const id in data.PLAYERS) {
            ENTITIES.PLAYERS[id].newPos = data.PLAYERS[id].pos;
        }
    }
}