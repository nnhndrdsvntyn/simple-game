import { game } from '../server.js';

export function buildInitPacket() {
    const initPacket = {
        PLAYERS: {},
        STRUCTURES: {}
    };

    // client-ify players (only send positions)
    Object.values(game.ENTITIES.PLAYERS).forEach(player => {
        initPacket['PLAYERS'][player.id] = {
            id: player.id,
            pos: player.pos
        };
    });

    // send structure data to clients
    Object.values(game.ENTITIES.STRUCTURES).forEach(structure => {
        initPacket['STRUCTURES'][structure.id] = structure;
    })

    // return the init packet
    return initPacket;
}