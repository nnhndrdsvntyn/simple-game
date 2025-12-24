import { ENTITIES } from './game.js';
window.ENTITIES = ENTITIES;

import { Network } from './network.js';

export const socket = io();
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

function render() {
    LC.clearCanvas();

    // draw all structures
    for (const structure of Object.values(ENTITIES.STRUCTURES)) structure.draw();

    // draw all players
    for (const player of Object.values(ENTITIES.PLAYERS)) player.draw();

    requestAnimationFrame(render);
}
render();