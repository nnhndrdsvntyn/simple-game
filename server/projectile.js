import { game } from '../server.js';
import { io } from '../server.js';

export class Projectile {
    constructor(id, pos, angle, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.angle = angle
        this.speed = 30;
        // despawn projectile after 1 second
        setTimeout(() => {
            game.deleteEntity('PROJECTILES', this.id);
            io.emit('delete', { type: 'PROJECTILES', id: this.id });
        }, 750)
    }
    move() {
        const rad = this.angle * Math.PI / 180;
        this.pos.x += Math.cos(rad) * this.speed;
        this.pos.y += Math.sin(rad) * this.speed;
    }
}
