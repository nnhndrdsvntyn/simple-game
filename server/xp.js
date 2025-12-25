import { game } from '../server.js';
import { io } from '../server.js';
import { xpMap } from '../public/shared/xpmap.js'

export class XP {
    constructor(id, pos, type) {
        this.color = xpMap.get(type).color;
        this.id = id;
        this.radius = xpMap.get(type).radius;
        this.type = xpMap.get(type).type;
        this.score = xpMap.get(type).score;
        this.pos = pos;
    }
    handleCollisions() {
        // check if a player is touching it
        for (const player of Object.values(game.ENTITIES.PLAYERS)) {
            const dx = this.pos.x - player.pos.x;
            const dy = this.pos.y - player.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.radius + player.radius;

            // If not colliding, SKIP TO NEXT (CODE BELOW WON'T RUN FOR THIS INSTACE)
            if (distance >= minDistance) continue;

            // Handle exact overlap (distance = 0)
            if (distance === 0) {
                player.score += this.score; // give player score
                game.deleteEntity('XP_POINTS', this.id); // delete the xp from the list
                io.emit('delete', { type: 'XP_POINTS', id: this.id }); // tell all clients to delete the xp from their lists
            } else {
                // handle regular overlap (distance < minDistance)
                player.score += this.score; // give player score
                game.deleteEntity('XP_POINTS', this.id); // delete the xp from the list
                io.emit('delete', { type: 'XP_POINTS', id: this.id }); // tell all clients to delete the xp from their lists
            }

            // make another copy of this same xp and tell clients to add it to their list
            const randomPos = {
                x: Math.floor(Math.random() * (10000 - this.radius * 2)) + this.radius,
                y: Math.floor(Math.random() * (10000 - this.radius * 2)) + this.radius,
            };
            game.newEntity('XP_POINTS', new XP(this.id, randomPos, this.type), this.type);
            io.emit('add', {
                type: 'XP_POINTS',
                id: this.id,
                entity: {
                    pos: randomPos,
                    type: this.type
                }
            });
        }
    }
}