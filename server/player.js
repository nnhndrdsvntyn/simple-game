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
        this.chatMessage = "";
        this.chatTimeout = null;
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
    }
    handleCollisions() {
        // structures
        for (const id in game.ENTITIES.STRUCTURES) {
            const structure = game.ENTITIES.STRUCTURES[id];
            const dx = this.pos.x - structure.pos.x;
            const dy = this.pos.y - structure.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = structure.radius + this.radius;

            if (distance < minDistance && distance > 0) {
                const overlap = minDistance - distance;
                const pushX = Math.round((dx / distance) * overlap * 1.1); // 1.1 is so that the player gets pushed back harder and stops colliding properly
                const pushY = Math.round((dy / distance) * overlap * 1.1); // 1.1 is so that the player gets pushed back harder and stops colliding properly

                this.pos.x += pushX;
                this.pos.y += pushY;
                this.changed = true;
            }
        }

        // other players - FIXED VERSION
        for (const id in game.ENTITIES.PLAYERS) {
            const player = game.ENTITIES.PLAYERS[id];

            // Skip self
            if (player === this) continue;

            const dx = this.pos.x - player.pos.x;
            const dy = this.pos.y - player.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = player.radius + this.radius;

            if (distance < minDistance && distance > 0) {
                const oldPosSelf = { ...this.pos };
                const oldPosOther = { ...player.pos };
                const overlap = minDistance - distance;

                // Calculate normalized push vector (shortest path)
                const pushX = Math.round((dx / distance) * (overlap / 2)); // Half overlap for this player
                const pushY = Math.round((dy / distance) * (overlap / 2)); // Half overlap for this player

                // Move both players apart by equal amounts
                this.pos.x += pushX + 2;
                this.pos.y += pushY + 2;

                player.pos.x -= pushX + 2; // Opposite direction
                player.pos.y -= pushY + 2; // Opposite direction

                if (player.pos.x != oldPosSelf.x || player.pos.y != oldPosSelf.y) this.changed = true;
                if (oldPosOther != player.pos.x || oldPosOther != player.pos.y) player.changed = true;
            }
        }
    }
    setChat(message) {
        this.changed = true;
        if (this.chatMessage != message) {
            clearTimeout(this.chatTimeout);
            this.chatMessage = message;
            this.chatTimeout = setTimeout(() => {
                this.chatMessage = '';
                this.changed = true;
            }, 10000) // 10 second chat duration before clearing
        }
    }
}