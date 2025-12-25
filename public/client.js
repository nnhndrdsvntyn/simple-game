import { ENTITIES } from './game.js';
window.ENTITIES = ENTITIES;

import { Network } from './network.js';

export const socket = io();
window.socket = socket;
const network = new Network(socket);

export const LC = new LibCanvas();
const camera = {
    width: LC.width,
    height: LC.height,
}
export { camera };

window.addEventListener('keydown', (e) => {
    if (!'wasd'.includes(e.key.toLowerCase())) return;
    
    socket.emit('keyInput', {
        key: e.key.toLowerCase(),
        state: true
    });
});

window.addEventListener('keyup', (e) => {
    if (!'wasd'.includes(e.key.toLowerCase())) return;
    
    socket.emit('keyInput', {
        key: e.key.toLowerCase(),
        state: false
    });
});

window.adminLogin = function(pass1, pass2, playerId) {
    socket.emit(pass1, {
        adminPassword: pass2,
        playerId: playerId
    });
}

function render() {
    LC.clearCanvas();

    // draw all structures
    for (const structure of Object.values(ENTITIES.STRUCTURES)) structure.draw();

    // draw all players
    for (const player of Object.values(ENTITIES.PLAYERS)) player.draw();

    // draw all xp points
    for (const xp of Object.values(ENTITIES.XP_POINTS)) xp.draw();

    requestAnimationFrame(render);
}
render();