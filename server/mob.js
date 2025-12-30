import { entityMap } from '../public/shared/entitymap.js';
import { game } from '../server.js';
import { io } from '../server.js';
import { XP } from './xp.js';


export class Mob {
    constructor(id, pos, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.speedTimeout = 0;
        this.angle = 0;
        this.speed = entityMap.MOBS[type].speed;
        this.radius = entityMap.MOBS[type].radius;
        this.health = entityMap.MOBS[type].maxHealth;
        this.maxHealth = entityMap.MOBS[type].maxHealth;

        const range = entityMap.MOBS[type].xpDropAmountRange;
        this.xpDropAmount = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

        this.changed = false;
        this.setRandomAngle();
    }
    move() {
        const rad = this.angle * Math.PI / 180;
        this.pos.x += Math.cos(rad) * this.speed;
        this.pos.y += Math.sin(rad) * this.speed;
        this.checkCollisions();
        this.changed = true;
    }
    setRandomAngle() {
        this.angle = Math.floor(Math.random() * 360) - 180;
        this.changed = true;
        setTimeout(() => {
            this.setRandomAngle();
        }, Math.floor(Math.random() * 4000) + 1000)
    }
    checkCollisions() {
        // Check collisions with players
        for (const id in game.ENTITIES.PLAYERS) {
            const player = game.ENTITIES.PLAYERS[id];
            const dx = this.pos.x - player.pos.x;
            const dy = this.pos.y - player.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.radius + player.radius;

            if (distance < minDistance) {
                // Collision detected, push mob away from player and player away from mob
                const overlap = minDistance - distance;
                const angle = Math.atan2(dy, dx);
                this.pos.x += Math.cos(angle) * overlap;
                this.pos.y += Math.sin(angle) * overlap;
                // Also push the player away
                player.pos.x -= Math.cos(angle) * overlap;
                player.pos.y -= Math.sin(angle) * overlap;
                player.changed = true;
                this.changed = true;
            }
        }

        // Keep mob within map boundaries (10000 x 10000)
        if (this.pos.x < this.radius) this.pos.x = this.radius;
        if (this.pos.x > 10000 - this.radius) this.pos.x = 10000 - this.radius;
        if (this.pos.y < this.radius) this.pos.y = this.radius;
        if (this.pos.y > 10000 - this.radius) this.pos.y = 10000 - this.radius;
    }
    alarm() {
        if (!this.speedTimeout) {
            this.speed *= 2.5
            this.setRandomAngle();
            this.speedTimeout = setTimeout(() => {
                this.speed = entityMap.MOBS[this.type].speed;
                this.speedTimeout = null;
            }, 5000);
        };
    }
    die(shooterId) {
        game.ENTITIES.PLAYERS[shooterId].changed = true;
        game.ENTITIES.PLAYERS[shooterId].score += entityMap.MOBS[this.type].score;

        const radius = entityMap.MOBS[this.type].radius;
        
        let randomPos = {
            x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
        }
        for (let i = 0; i < this.xpDropAmount; i++) {
            const min = entityMap.MOBS[this.type].xpDropAmountRange[0];
            const max = entityMap.MOBS[this.type].xpDropAmountRange[1];
            const array = entityMap.MOBS[this.type].xpDropTypes;
            
            Math.floor(Math.random() * (max - min + 1)) + min; // random amount xp dropped based on range
            
            const xpType = array[Math.floor(Math.random() * array.length)];
            this.spawnXP(xpType);
        }
        game.deleteEntity('MOBS', this.id);
        setTimeout(() => {
            game.newEntity('MOBS', new Mob(this.id, randomPos, this.type));
            io.emit('add', {
                type: 'MOBS',
                id: this.id,
                entity: {
                    pos: randomPos,
                    type: this.type,
                    angle: this.angle
                }
            });
        }, 2500);
    }
    spawnXP(xpType) {
        const radius = entityMap.XP_POINTS[xpType].radius;
        const id = 'xp' + (Object.keys(game.ENTITIES.XP_POINTS).length + 1);
        const pos = { ... this.pos };
        pos.x += Math.random() * (radius * 2) - radius;
        pos.y += Math.random() * (radius * 2) - radius
        game.newEntity('XP_POINTS', new XP(id, this.pos, xpType));
        io.emit('add', {
            type: 'XP_POINTS',
            id: id,
            entity: {
                id: id,
                pos: pos,
                type: xpType
            }
        })
    }
}