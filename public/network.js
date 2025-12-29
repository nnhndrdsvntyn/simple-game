import { ENTITIES } from './game.js';
import { Player } from './player.js';
import { Mob } from './mob.js';
import { Structure } from './structure.js'
import { XP } from './xp.js'
import { Projectile } from './projectile.js'
import { camera } from './client.js';

export class Network {
    constructor(socket) {
        this.socket = socket;

        this.socket.on("init", (data) => this.onInit(data));
        this.socket.on("add", (data) => this.onAdd(data));
        this.socket.on("delete", (data) => this.onDelete(data));
        this.socket.on('update', (data) => this.onUpdate(data));
        this.socket.on('diedTo', (data) => this.onDiedTo(data));
        this.socket.on('killed', (data) => this.onKilled(data));
    }

    onInit(data) {
        // console.log('init:', data);

        // populate player list
        for (const id in data.PLAYERS) {
            const player = data.PLAYERS[id];
            ENTITIES.PLAYERS[id] = new Player(player.id, player.pos, player.radius, player.score);
            ENTITIES.PLAYERS[id].chatMessage = player.chatMessage;
            ENTITIES.PLAYERS[id].newScore = player.score;
            ENTITIES.PLAYERS[id].newRadius = player.radius;
            ENTITIES.PLAYERS[id].angle = player.angle;
            ENTITIES.PLAYERS[id].hasShield = player.hasShield;
            ENTITIES.PLAYERS[id].newHealth = player.health;
            ENTITIES.PLAYERS[id].maxHealth = player.maxHealth;
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

        // populate projectile list
        for (const id in data.PROJECTILES) {
            const projectile = data.PROJECTILES[id];
            ENTITIES.PROJECTILES[id] = new Projectile(id, projectile.pos, projectile.angle, projectile.type, projectile.radius);
        }

        // populate mob list
        for (const id in data.MOBS) {
            const mob = data.MOBS[id];
            ENTITIES.MOBS[id] = new Mob(id, mob.pos, mob.angle, mob.type);
        }
    }

    onAdd(data) {
        // console.log('add:', data);
        if (data.type === 'PLAYERS') {
            ENTITIES[data.type][data.id] = new Player(data.id);
        }
        if (data.type === 'XP_POINTS') ENTITIES[data.type][data.id] = new XP(data.id, data.entity.pos, data.entity.type);
        if (data.type === 'PROJECTILES') ENTITIES[data.type][data.id] = new Projectile(data.id, data.entity.pos, data.entity.angle, data.entity.type);
        if (data.type === 'MOBS') ENTITIES[data.type][data.id] = new Mob(data.id, data.entity.pos, data.entity.angle, data.entity.type);
         
    }

    onDelete(data) {
        // console.log('delete:', data);
        delete ENTITIES[data.type][data.id];
    }

    onUpdate(data) {
        // console.log('update:', data);
        
        // update players
        for (const id in data.PLAYERS) {
            ENTITIES.PLAYERS[id].newPos = data.PLAYERS[id].pos;
            ENTITIES.PLAYERS[id].chatMessage = data.PLAYERS[id].chatMessage;
            ENTITIES.PLAYERS[id].newScore = data.PLAYERS[id].score;
            ENTITIES.PLAYERS[id].newRadius = data.PLAYERS[id].radius;
            ENTITIES.PLAYERS[id].newAngle = data.PLAYERS[id].angle;
            ENTITIES.PLAYERS[id].hasShield = data.PLAYERS[id].hasShield;
            ENTITIES.PLAYERS[id].newHealth = data.PLAYERS[id].health;
            ENTITIES.PLAYERS[id].maxHealth = data.PLAYERS[id].maxHealth;
        }

        // update mobs
        for (const id in data.MOBS) {
            if (!ENTITIES.MOBS[id]) continue;
            ENTITIES.MOBS[id].newPos = data.MOBS[id].pos;
            ENTITIES.MOBS[id].newAngle = data.MOBS[id].angle;
            ENTITIES.MOBS[id].health = data.MOBS[id].health;
            ENTITIES.MOBS[id].newHealth = data.MOBS[id].health;
        }

        // update projectile's position and radius
        for (const id in data.PROJECTILES) {
            if (!ENTITIES.PROJECTILES[id]) {
                // if its not created, then skip it
                continue;
            }
            ENTITIES.PROJECTILES[id].newPos = data.PROJECTILES[id].pos;
            ENTITIES.PROJECTILES[id].radius = data.PROJECTILES[id].radius;
        }

        // update xps position (they might have been moved out of an obstacle)
        for (const id in data.XP_POINTS) {
            ENTITIES.XP_POINTS[id].pos = data.XP_POINTS[id].pos;
        }
    }

    onDiedTo(data) {
        console.log('You were killed by', data.id);
    }

    onKilled(data) {
        console.log('You killed', data);
    }
}