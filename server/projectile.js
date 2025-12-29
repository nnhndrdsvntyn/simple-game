import {
    game
} from '../server.js';
import {
    entityMap
} from '../public/shared/entitymap.js';

export class Projectile {
    constructor(id, pos, angle, type, shooterId, shooterType) {
        this.id = id;
        this.pos = pos;
        this.knockbackStrength = entityMap.PROJECTILES[type].knockbackStrength;
        this.shooterType = shooterType;
        this.shooterId = shooterId;
        this.type = type;
        this.radius = entityMap.PROJECTILES[type].radius;
        this.angle = angle

        // realistic uses more CPU, but checks collisions better by checking collisions every 1 unit.
        // teleport uses less cpu. still looks smooth, but only checks collisions every "speed" units.
        this.speed = entityMap.PROJECTILES[type].speed;
        // despawn projectile after 0.750 second
        this.despawnTimer = setTimeout(() => {
            this.delete();
        }, 750);
    }
    move() {
        // Convert angle to radians and move
        const rad = this.angle * Math.PI / 180;
        const moveDist = this.speed;
        if (moveDist === 0) return;

        const moveX = Math.cos(rad) * moveDist;
        const moveY = Math.sin(rad) * moveDist;
        const startX = this.pos.x;
        const startY = this.pos.y;

        let closestHit = null;
        let minT = 1.0;

        // Ray-Circle intersection check
        // This function was written by AI (for better collision detection)
        // I kinda get the math, a little.
        const checkCollision = (entity) => {
            const cx = entity.pos.x;
            const cy = entity.pos.y;
            const r = entity.radius + this.radius;

            const fx = startX - cx;
            const fy = startY - cy;

            const a = moveX * moveX + moveY * moveY;
            const b = 2 * (fx * moveX + fy * moveY);
            const c = (fx * fx + fy * fy) - (r * r);

            let discriminant = b * b - 4 * a * c;
            if (discriminant < 0) return null;

            discriminant = Math.sqrt(discriminant);
            const t1 = (-b - discriminant) / (2 * a);
            const t2 = (-b + discriminant) / (2 * a);

            if (t1 >= 0 && t1 <= 1) return t1;
            if (t2 >= 0 && t2 <= 1) return t2;
            if (c < 0 && t2 > 0) return 0; // Started inside
            return null;
        };

        // Check players
        for (const id in game.ENTITIES.PLAYERS) {
            const player = game.ENTITIES.PLAYERS[id];
            if (player.id === this.shooterId) continue;

            const t = checkCollision(player);
            if (t !== null && t < minT) {
                minT = t;
                closestHit = { type: 'player', entity: player };
            }
        }

        // Check structures
        for (const id in game.ENTITIES.STRUCTURES) {
            const structure = game.ENTITIES.STRUCTURES[id];
            const t = checkCollision(structure);
            if (t !== null && t < minT) {
                minT = t;
                closestHit = { type: 'structure', entity: structure };
            }
        }

        // Check mobs
        for (const id in game.ENTITIES.MOBS) {
            const mob = game.ENTITIES.MOBS[id];
            const t = checkCollision(mob);
            if (t !== null && t < minT) {
                minT = t;
                closestHit = { type: 'mob', entity: mob };
            }
        }

        if (closestHit) {
            this.pos.x = startX + moveX * minT;
            this.pos.y = startY + moveY * minT;

            if (closestHit.type === 'player') {
                const player = closestHit.entity;
                player.pos.x += Math.cos(rad) * this.knockbackStrength;
                player.pos.y += Math.sin(rad) * this.knockbackStrength;

                if (!player.hasShield) {
                    player.health -= entityMap.PROJECTILES[this.type].damage;
                }
                if (player.health <= 0) player.die(this.shooterId, this.shooterType);
                player.changed = true;
            }
            else if (closestHit.type === 'mob') {
                const mob = closestHit.entity;
                mob.health -= entityMap.PROJECTILES[this.type].damage;
                // make mob temporarily faster, or 'alarmed' so they can run away
                mob.alarm();
                mob.pos.x += Math.cos(rad) * this.knockbackStrength;
                mob.pos.y += Math.sin(rad) * this.knockbackStrength;
                if (mob.health <= 0) {
                    // TODO: Mob death logic (e.g., drop XP, remove mob)
                    mob.die(this.shooterId);
                }
                mob.changed = true;
            }
            this.delete();
        } else {
            this.pos.x = startX + moveX;
            this.pos.y = startY + moveY;
        }
    }

    delete() {
        clearTimeout(this.despawnTimer);
        game.deleteEntity('PROJECTILES', this.id);
    }
}