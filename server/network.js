import { game } from '../server.js';

export function buildInitPacket() {
    const initPacket = {
        PLAYERS: {},
        STRUCTURES: {}
    };

    // client-ify players (only send position, id, and chat message)
    Object.values(game.ENTITIES.PLAYERS).forEach(player => {
        initPacket['PLAYERS'][player.id] = {
            id: player.id,
            pos: player.pos,
            chatMessage: player.chatMessage
        };
    });

    // send structure data to clients
    Object.values(game.ENTITIES.STRUCTURES).forEach(structure => {
        initPacket['STRUCTURES'][structure.id] = structure;
    })

    // return the init packet
    return initPacket;
}