import { Structure } from './structure.js';
import { entityMap } from '../public/shared/entitymap.js';
import { XP } from './xp.js';
import { io } from '../server.js';

export class Game {
    constructor(server) {
        this.io = server;
        this.ENTITIES = {
            PLAYERS: {},
            STRUCTURES: {},
            XP_POINTS: {},
            PROJECTILES: {}
        }

        // generate structures and populate its list
        // spawn zone (1)
        for (let i = 1; i <= 1; i++) {
            const radius = entityMap.get('spawn-zone').radius;
            let pos = {
                x: 5000,
                y: 5000
            }
            this.newEntity('STRUCTURES', new Structure('spawn-zone' + i, pos, 'spawn-zone'));
        }
        
        // rock1 (50)
        for (let i = 1; i <= 50; i++) {
            const radius = entityMap.get('rock1').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius
            };
            this.newEntity('STRUCTURES', new Structure('rock1' + i, randomPos, 'rock1'));
        }

        // generate xp points and populate its list
        // green
        for (let i = 1; i <= 300; i++) {
            const radius = entityMap.get('green').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'green'), 'green');
        }

        // red
        for (let i = 1; i <= 150; i++) {
            const radius = entityMap.get('red').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'red'), 'red');
        }

        // blue
        for (let i = 1; i <= 75; i++) {
            const radius = entityMap.get('blue').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'blue'), 'blue');
        }

        // pruple
        for (let i = 1; i <= 35; i++) {
            const radius = entityMap.get('purple').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'purple'), 'purple');
        }
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