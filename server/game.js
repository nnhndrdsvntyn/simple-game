import { Structure } from './structure.js';
import { entityMap } from '../public/shared/entitymap.js';
import { XP } from './xp.js';
import { io } from '../server.js';
import { Mob } from './mob.js';

export class Game {
    constructor(server) {
        this.io = server;
        this.ENTITIES = {
            PLAYERS: {},
            MOBS: {},
            STRUCTURES: {},
            XP_POINTS: {},
            PROJECTILES: {}
        }

        // spawn some mobs
        for (let i = 1; i <= 70; i++) {
            const radius = entityMap.MOBS['chick'].radius;
            let randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('MOBS', new Mob('chick' + i, randomPos, 'chick'));
        }

        for (let i = 1; i <= 40; i++) {
            const radius = entityMap.MOBS['pig'].radius;
            let randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('MOBS', new Mob('pig' + i, randomPos, 'pig'));
        }

        for (let i = 1; i <= 100; i++) {
            const radius = entityMap.MOBS['cow'].radius;
            let randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('MOBS', new Mob('cow' + i, randomPos, 'cow'));
        }


        // generate structures and populate its list
        // spawn zone (1)
        for (let i = 1; i <= 1; i++) {
            const radius = entityMap.STRUCTURES['spawn-zone'].radius;
            let pos = {
                x: 5000,
                y: 5000
            }
            this.newEntity('STRUCTURES', new Structure('spawn-zone' + i, pos, 'spawn-zone'));
        }
        
        // rock1 (50)
        for (let i = 1; i <= 50; i++) {
            const radius = entityMap.STRUCTURES['rock1'].radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius
            };
            this.newEntity('STRUCTURES', new Structure('rock1' + i, randomPos, 'rock1'));
        }

        /*

        // generate xp points and populate its list
        // green
        for (let i = 1; i <= 300; i++) {
            const radius = entityMap.XP_POINTS['green'].radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'green'));
        }

        // red
        for (let i = 1; i <= 150; i++) {
            const radius = entityMap.XP_POINTS['red'].radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'red'));
        }

        // blue
        for (let i = 1; i <= 75; i++) {
            const radius = entityMap.XP_POINTS['blue'].radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'blue'));
        }

        // pruple
        for (let i = 1; i <= 35; i++) {
            const radius = entityMap.XP_POINTS['purple'].radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'purple'));
        }
        */
    }
    newEntity(type, entity) {
        this.ENTITIES[type][entity.id] = entity;
    }

    deleteEntity(type, id) {
        delete this.ENTITIES[type][id];
        io.emit('delete', {
            type: type,
            id: id
        })
    }
}