import {
    game
} from '../server.js';
import {
    io
} from '../server.js';

export class Projectile {
    constructor(id, pos, angle, type, shooterId) {
        this.id = id;
        this.pos = pos;
        this.shooterId = shooterId;
        this.type = type;
        this.angle = angle
        this.speed = 30;
        // despawn projectile after 0.750 second
        setTimeout(() => {
            game.deleteEntity('PROJECTILES', this.id);
            io.emit('delete', {
                type: 'PROJECTILES',
                id: this.id
            });
        }, 750)
    }
    move() {
        const rad = this.angle * Math.PI / 180;
        this.pos.x += Math.cos(rad) * this.speed;
        this.pos.y += Math.sin(rad) * this.speed;

        for (const id in game.ENTITIES.PLAYERS) {
            const player = game.ENTITIES.PLAYERS[id];

            // check if its the shooter (dont check collisions)
            if (player.id === this.shooterId) continue; // continue to check the next player

            // check if they colliding
            const dx = player.pos.x - this.pos.x;
            const dy = player.pos.y - this.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.radius) {
                // knkock the player back
                const knockbackStrength = 100;
                const angle = Math.atan2(dy, dx);
                player.pos.x += Math.cos(rad) * knockbackStrength;
                player.pos.y += Math.sin(rad) * knockbackStrength;
                player.changed = true;

                // delete this projectile
                game.deleteEntity('PROJECTILES', this.id);
                io.emit('delete', {
                    type: 'PROJECTILES',
                    id: this.id
                });

                break; // dont check other players
            }
        }
    }
}