import { entityMap } from '../public/shared/entitymap.js';
import { game } from '../server.js';
export class Structure {
    constructor(id, pos, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.changed = false;
        this.radius = entityMap.get(type).radius;
    }
    handleCollisions() {
        if (this.type === 'spawn-zone') {
            return;
        }

        for (const id in game.ENTITIES.STRUCTURES) {
            const structure = game.ENTITIES.STRUCTURES[id];
            if (structure.type === 'spawn-zone') {
                const dx = this.pos.x - structure.pos.x;
                const dy = this.pos.y - structure.pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + structure.radius && distance > 0) {
                    const overlap = this.radius + structure.radius - distance;
                    const angle = Math.atan2(dy, dx);
                    this.pos.x += Math.cos(angle) * overlap;
                    this.pos.y += Math.sin(angle) * overlap;
                    this.changed = true;
                } else if (distance === 0) {
                    // if they are perfectly on top of each other, move this structure slightly
                    this.pos.x += (Math.random() - 0.5) * 2;
                    this.pos.y += (Math.random() - 0.5) * 2;
                    this.changed = true;
                }
            }
        }
    }
}