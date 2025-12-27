import {
    game
} from '../server.js';
import {
    io
} from '../server.js';
import { entityMap } from '../public/shared/entitymap.js';

export class Projectile {
    constructor(id, pos, angle, type, shooterId, radius) {
        this.id = id;
        this.pos = pos;
        this.shooterId = shooterId;
        this.type = type;
        this.radius = Math.max(10, radius); // minimum radius is 10
        this.angle = angle
        this.speed = 50 / (this.radius / 30);
        // despawn projectile after 0.750 second
        this.despawnTimer = setTimeout(() => {
            this.delete();
        }, 750);
    }
    move() {
        // Convert angle to radians and move
        const rad = this.angle * Math.PI / 180;
        this.pos.x += Math.cos(rad) * this.speed;
        this.pos.y += Math.sin(rad) * this.speed;

        // Helper function to check collision between two circles
        const checkCollision = (x1, y1, r1, x2, y2, r2) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (r1 + r2);
        };

        // Check collisions with players
        for (const id in game.ENTITIES.PLAYERS) {
            const player = game.ENTITIES.PLAYERS[id];

            // dont check collisions with the shooter
            if (player.id === this.shooterId) continue;

            // dont check collisions with safe players
            if (player.hasShield) continue;

            if (checkCollision(
                    this.pos.x, this.pos.y, this.radius,
                    player.pos.x, player.pos.y, player.radius
                )) {
                // Knock player back
                const knockbackStrength = entityMap.get(this.type).knockbackStrength;
                player.pos.x += Math.cos(rad) * knockbackStrength;
                player.pos.y += Math.sin(rad) * knockbackStrength;
                player.changed = true;

                this.delete();
                return; // Stop checking after hit
            }
        }

        // Check collisions with structures
        for (const id in game.ENTITIES.STRUCTURES) {
            const structure = game.ENTITIES.STRUCTURES[id];

            if (checkCollision(
                    this.pos.x, this.pos.y, this.radius,
                    structure.pos.x, structure.pos.y, structure.radius
                )) {
                this.delete();
                return; // Stop checking after hit
            }
        }
    }

    delete() {
        clearTimeout(this.despawnTimer);
        game.deleteEntity('PROJECTILES', this.id);
    }
}