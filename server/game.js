import { Structure, structureMap } from './structure.js';

export class Game {
    constructor(server) {
        this.io = server;
        this.ENTITIES = {
            PLAYERS: {},
            STRUCTURES: {}
        }

        // generate structures and populate its list
        // rock1 (50)
        for (let i = 1; i < 50; i++) {
            const radius = structureMap.get('rock1').radius;
            let randomPos;
            randomPos = {
                x: Math.floor(Math.random() * (10000 - radius * 2)) + radius,
                y: Math.floor(Math.random() * (10000 - radius * 2)) + radius
            };
            this.newEntity('STRUCTURES', new Structure(i, randomPos, 'rock1'));
        }
    }
    newEntity(type, entity) {
        this.ENTITIES[type][entity.id] = entity;
    }

    deleteEntity(type, id) {
        delete this.ENTITIES[type][id];
    }
}