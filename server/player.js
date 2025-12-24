import {
    game
} from '../server.js';
export class Player {
    constructor(id) {
        this.id = id;
        this.pos = {
            x: 5000,
            y: 5000
        };
        this.speed = 20;
        this.radius = 30;
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
        this.handleCollisions();
        if (this.pos.x !== oldPos.x || this.pos.y !== oldPos.y) this.changed = true;
    }
    handleCollisions() {
        for (const id in game.ENTITIES.STRUCTURES) {
            const structure = game.ENTITIES.STRUCTURES[id];
            const dx = this.pos.x - structure.pos.x;
            const dy = this.pos.y - structure.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = structure.radius + (this.radius); // assuming player has radius 
            if (distance < minDistance && distance > 0) {
                const overlap = minDistance - distance;
                const pushX = (dx / distance) * overlap;
                const pushY = (dy / distance) * overlap;
                this.pos.x += pushX;
                this.pos.y += pushY;
                this.changed = true;
            }
        }
    }
}