import { game, io } from '../server.js';
import {
    Projectile
} from './projectile.js';
import { entityMap } from '../public/shared/entitymap.js';

export class Player {
    constructor(id) {
        this.id = id;
        this.pos = {
            x: 5000,
            y: 5000
        };
        this.speed = entityMap.PLAYERS.defaultSpeed;
        this.radius = entityMap.PLAYERS.defaultRadius;
        this.chatMessage = "";
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.naturalRegen = { speed: 1, health: 5 };
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

        // start natural regeneration interval
        setInterval(() => {
            if (this.health < this.maxHealth) {
                this.health = Math.min(this.maxHealth, this.health + this.naturalRegen.health);
                this.changed = true;
            }
        }, 1000 / this.naturalRegen.speed);
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

        // keep player inside map (10000 x 10000)
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
                    thisObj.pos.x += Math.cos(angle) * (pushDistance + 1); // extra 1 so they stop touching
                    thisObj.pos.y += Math.sin(angle) * (pushDistance + 1); // extra 1 so they stop touching

                    otherObj.pos.x -= Math.cos(angle) * (pushDistance + 1); // extra 1 so they stop touching
                    otherObj.pos.y -= Math.sin(angle) * (pushDistance + 1); // extra 1 so they stop touching

                    thisObj.changed = true;
                    otherObj.changed = true;
                } else {
                    // Only this player moves (structure doesn't move)
                    thisObj.pos.x += Math.cos(angle) * (pushDistance * 2 + 1); // extra 1 so they stop touching
                    thisObj.pos.y += Math.sin(angle) * (pushDistance * 2 + 1); // extra 1 so they stop touching
                    thisObj.changed = true;
                }
                return;
            }

            // Normal collision (distance > 0)
            const overlap = minDistance - distance;
            const nx = dx / distance;
            const ny = dy / distance;

            if (isPlayer) {
                // Both players move half the overlap
                const pushDist = (overlap / 2) + 1;

                thisObj.pos.x += nx * pushDist;
                thisObj.pos.y += ny * pushDist;

                otherObj.pos.x -= nx * pushDist;
                otherObj.pos.y -= ny * pushDist;

                thisObj.changed = true;
                otherObj.changed = true;
            } else {
                // Only this player moves (structure doesn't move)
                const pushDist = overlap + 1;
                thisObj.pos.x += nx * pushDist;
                thisObj.pos.y += ny * pushDist;
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

    die(killerId, type) {
        // if this player died to another player
        if (type === 'player') {
            game.ENTITIES.PLAYERS[killerId].score += this.score; // give killer their score
            game.ENTITIES.PLAYERS[killerId].changed = true;
            // tell victim who killed them, and tell the killer the victim they killed
            io.to(killerId).emit('killed', this.id);
            io.to(this.id).emit('diedTo', {
                type: 'player',
                id: killerId
            });

            this.pos.x = 5000; // send back to center of map
            this.pos.y = 5000; // send back to center of map
            this.health = this.maxHealth // reset health
            this.score = 0; // reset score
            this.changed = true
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
        const angleInRadians = this.angle * (Math.PI / 180);
        const projectileRadius = this.radius / 2;
        // Spawn distance from player center. Player radius + projectile radius.
        const spawnDistance = this.radius;

        const projectileX = this.pos.x + Math.cos(angleInRadians) * spawnDistance; // spawn outside player
        const projectileY = this.pos.y + Math.sin(angleInRadians) * spawnDistance; // spawn outside player

        const projectile = new Projectile(id, {
            x: projectileX,
            y: projectileY
        }, this.angle, 'bullet', this.id, 'player');
        game.ENTITIES.PROJECTILES[id] = projectile;
        io.emit('add', {
            type: 'PROJECTILES',
            id: id,
            entity: {
                id: projectile.id,
                pos: projectile.pos,
                angle: projectile.angle,
                type: projectile.type,
                radius: projectile.radius
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
                setTimeout(() => {
                    this.canAttack = true;
                }, 250);
            }, 250);

            // trigger first attack immediately
            if (this.canAttack) {
                this.canAttack = false;
                this.attack();
                setTimeout(() => {
                    this.canAttack = true;
                }, 250);
            }

        } else {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
    }
}