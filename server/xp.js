import { game } from '../server.js';
import { io } from '../server.js';
import { entityMap } from '../public/shared/entitymap.js'

export class XP {
    constructor(id, pos, type) {
        this.color = entityMap.XP_POINTS[type].color;
        this.id = id;
        this.radius = entityMap.XP_POINTS[type].radius;
        this.type = type;
        this.score = entityMap.XP_POINTS[type].score;
        this.pos = pos;
        // despawn xp after 10 seconds
        this.despawnTimer = setTimeout(() => {
            this.delete();
        }, 10000)
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
            let percentageGain = (Math.floor(Math.random() * 6) + 5) / 10; // 50% to 100% gain possible.
            if (distance === 0) {
                player.score += (this.score * percentageGain); // give player score
                player.changed = true;
                game.deleteEntity('XP_POINTS', this.id); // delete the xp from the list
                io.emit('delete', { type: 'XP_POINTS', id: this.id }); // tell all clients to delete the xp from their lists
            } else {
                // handle regular overlap (distance < minDistance)
                player.score += (this.score * percentageGain); // give player score
                player.changed = true;
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

        // check collisions with structures and move the xp outside
        for (const structure of Object.values(game.ENTITIES.STRUCTURES)) {
            // allow it to xp to spawn inside spawn zones
            if (structure.type === 'spawn-zone') continue; // skip
            
            const dx = this.pos.x - structure.pos.x;
            const dy = this.pos.y - structure.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.radius + structure.radius;

            if (distance <= minDistance) {
                // move the xp outside of the structure
                const normalX = dx / distance;
                const normalY = dy / distance;
                const overlap = minDistance - distance;
                const moveX = normalX * overlap;
                const moveY = normalY * overlap;
                this.pos.x += moveX + 200; // extra 200 so they stop touching
                this.pos.y += moveY + 200; // extra 200 so they stop touching
                this.changed = true;
            }
        }
    }
    delete() {
        clearTimeout(this.despawnTimer);
        game.deleteEntity('XP_POINTS', this.id);
    }
}