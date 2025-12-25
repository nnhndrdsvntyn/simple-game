import { Structure } from './structure.js';
import { structureMap } from '../public/shared/structuremap.js';
import { XP } from './xp.js';
import { xpMap } from '../public/shared/xpmap.js';
import { io } from '../server.js';

export class Game {
    constructor(server) {
        this.io = server;
        this.ENTITIES = {
            PLAYERS: {},
            STRUCTURES: {},
            XP_POINTS: {}
        }

        // generate structures and populate its list
        // spawn zone (1)
        for (let i = 1; i <= 1; i++) {
            const radius = structureMap.get('spawn-zone').radius;
            let pos = {
                x: 5000,
                y: 5000
            }
            this.newEntity('STRUCTURES', new Structure('spawn-zone' + i, pos, 'spawn-zone'));
        }
        
        // rock1 (50)
        for (let i = 1; i <= 50; i++) {
            const radius = structureMap.get('rock1').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius
            };
            this.newEntity('STRUCTURES', new Structure('rock1' + i, randomPos, 'rock1'));
        }

        // generate xp points and populate its list
        for (let i = 1; i <= 100; i++) {
            const radius = xpMap.get('green').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
            }
            this.newEntity('XP_POINTS', new XP('xp' + i, randomPos, 'green'), 'green');
        }
    }
    newEntity(type, entity) {
        this.ENTITIES[type][entity.id] = entity;
    }

    deleteEntity(type, id) {
        delete this.ENTITIES[type][id];
    }
}