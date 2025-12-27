import {
    game
} from '../server.js';
import { Projectile } from './projectile.js';
import { io } from '../server.js';

export class Player {
    constructor(id) {
        this.id = id;
        this.pos = {
            x: 5000,
            y: 5000
        };
        this.speed = 20;
        this.radius = 30;
        this.chatMessage = "";
        this.score = 0;
        this.angle = 0;
        this.canAttack = true;
        this.hasShield = true;
        this.attackInterval = null;
        this.chatTimeout = null;
        this.isAdmin = false;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        this.changed = true;
    }
    move() {
        const oldPos = {
            ...this.pos
        };
        if (this.keys['w']) this.velocity.y = -this.speed;
        if (this.keys['a']) this.velocity.x = -this.speed;
        if (this.keys['s']) this.velocity.y = this.speed;
        if (this.keys['d']) this.velocity.x = this.speed;
        if (!this.keys['w'] && !this.keys['s']) this.velocity.y = 0;
        if (!this.keys['a'] && !this.keys['d']) this.velocity.x = 0;
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        if (this.pos.x !== oldPos.x || this.pos.y !== oldPos.y) this.changed = true;

        this.handleCollisions();

        // clamp player inside map
        if (this.pos.x < 0) this.pos.x = 0;
        if (this.pos.x > 10000) this.pos.x = 10000;
        if (this.pos.y < 0) this.pos.y = 0;
        if (this.pos.y > 10000) this.pos.y = 10000;
    }
    handleCollisions() {
        // THE LOGIC BELOW IS MOSTLY WRITTEN BY AI LOL

        // Helper function to handle collision between two circles
        const handleCircleCollision = (thisObj, otherObj, otherRadius, isPlayer = false) => {
            const dx = thisObj.pos.x - otherObj.pos.x;
            const dy = thisObj.pos.y - otherObj.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = otherRadius + thisObj.radius;

            // If not colliding, skip
            if (distance >= minDistance) return;

            // Handle exact overlap (distance = 0)
            if (distance === 0) {
                const angle = Math.random() * Math.PI * 2;
                const pushDistance = minDistance / 2;

                if (isPlayer) {
                    // Both players move
                    thisObj.pos.x += Math.cos(angle) * pushDistance + 3; // extra 3 so they stop touching
                    thisObj.pos.y += Math.sin(angle) * pushDistance + 3; // extra 3 so they stop touching

                    otherObj.pos.x -= Math.cos(angle) * pushDistance + 3; // extra 3 so they stop touching
                    otherObj.pos.y -= Math.sin(angle) * pushDistance + 3; // extra 3 so they stop touching

                    thisObj.changed = true;
                    otherObj.changed = true;
                } else {
                    // Only this player moves (structure doesn't move)
                    thisObj.pos.x += Math.cos(angle) * pushDistance * 2 + 3; // extra 3 so they stop touching
                    thisObj.pos.y += Math.sin(angle) * pushDistance * 2 + 3; // extra 3 so they stop touching
                    thisObj.changed = true;
                }
                return;
            }

            // Normal collision (distance > 0)
            const overlap = minDistance - distance;
            const pushX = (dx / distance) * overlap;
            const pushY = (dy / distance) * overlap;

            if (isPlayer) {
                // Both players move half the overlap
                const halfPushX = pushX / 2;
                const halfPushY = pushY / 2;

                thisObj.pos.x += halfPushX + 3; // extra 3 so they stop touching
                thisObj.pos.y += halfPushY; // extra 3 so they stop touching

                otherObj.pos.x -= halfPushX + 3; // extra 3 so they stop touching
                otherObj.pos.y -= halfPushY + 3; // extra 3 so they stop touching

                thisObj.changed = true;
                otherObj.changed = true;
            } else {
                // Only this player moves (structure doesn't move)
                thisObj.pos.x += pushX + 3; // extra 3 so they stop touching
                thisObj.pos.y += pushY + 3; // extra 3 so they stop touching
                thisObj.changed = true;
            }
        };

        let isCollidingWithSpawnZone = false;
        // Check collisions with structures
        for (const id in game.ENTITIES.STRUCTURES) {
            const structure = game.ENTITIES.STRUCTURES[id];
            if (structure.type === 'spawn-zone') {
                const dx = this.pos.x - structure.pos.x;
                const dy = this.pos.y - structure.pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = this.radius + structure.radius;
                if (distance < minDistance) {
                    isCollidingWithSpawnZone = true;
                }
            } else {
                handleCircleCollision(this, structure, structure.radius, false);
            }
        }

        // give shield if inside spawn zone, and remove shield if not.
        if (this.hasShield !== isCollidingWithSpawnZone) {
            this.hasShield = isCollidingWithSpawnZone;
            if (this.hasShield) {
                clearInterval(this.attackInterval);
                this.attackInterval = null;
            }
            this.changed = true;
        }

        // Check collisions with other players
        for (const id in game.ENTITIES.PLAYERS) {
            const player = game.ENTITIES.PLAYERS[id];
            if (player === this) continue; // skip self

            handleCircleCollision(this, player, player.radius, true);
        }
    }
    setChat(message) {
        this.changed = true;
        if (message.startsWith("/")) return; // Ignore commands
        if (this.chatMessage != message) {
            clearTimeout(this.chatTimeout);
            this.chatMessage = message;
            this.chatTimeout = setTimeout(() => {
                this.chatMessage = '';
                this.changed = true;
            }, 10000) // 10 second chat duration before clearing
        }
    }

    setAngle(angle) {
        this.angle = angle;
        this.changed = true;
    }

    attack() {
        const id = Math.random().toString();
        const projectile = new Projectile(id, { ...this.pos }, this.angle, 'pebble', this.id);
        game.ENTITIES.PROJECTILES[id] = projectile;
        io.emit('add', {
            type: 'PROJECTILES',
            id: id,
            entity: {
                id: projectile.id,
                pos: projectile.pos,
                angle: projectile.angle,
                type: projectile.type
            }
        });
    }

    setAttack(state) {
    if (state) {
        if (this.hasShield) return;
        // an interval already exists? then don't continue
        if (this.attackInterval) return;

        this.attackInterval = setInterval(() => {
            if (!this.canAttack) return;
            this.canAttack = false;
            this.attack();
            setTimeout(() => { this.canAttack = true; }, 250);
        }, 250);

        // trigger first attack immediately
        if (this.canAttack) {
            this.canAttack = false;
            this.attack();
            setTimeout(() => { this.canAttack = true; }, 250);
        }

    } else {
        clearInterval(this.attackInterval);
        this.attackInterval = null;
    }
}
}