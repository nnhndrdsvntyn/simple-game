import { ENTITIES } from './game.js';
window.ENTITIES = ENTITIES;

import { Network } from './network.js';

export const socket = io();
socket.on("connect", () => {
    render();
})
window.socket = socket;
const network = new Network(socket);

export const LC = new LibCanvas();
window.LC = LC;
const camera = {
    width: LC.width,
    height: LC.height,
    target: { pos: { x: 0, y: 0 } },
    zoomIn: function(amount) {
        LC.width -= amount;
        LC.height -= amount;
        LC.canvas.width -= amount;
        LC.canvas.height -= amount;
        camera.height -= amount;
        camera.width -= amount;
    },
    zoomOut: function(amount) {
        LC.width += amount;
        LC.height += amount;
        LC.canvas.width += amount;
        LC.canvas.height += amount;
        camera.height += amount;
        camera.width += amount;
    }
}
window.camera = camera;
export { camera };

window.addEventListener('keydown', (e) => {
    const input = document.getElementById('chatInputArea');
    if (input === document.activeElement) return;
    
    if (!'wasd'.includes(e.key.toLowerCase())) return;
    
    socket.emit('keyInput', {
        key: e.key.toLowerCase(),
        state: true
    });
});

window.addEventListener('keyup', (e) => {
    const input = document.getElementById('chatInputArea');
    if (input === document.activeElement) return;
    
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

    // draw all xp points
    for (const xp of Object.values(ENTITIES.XP_POINTS)) xp.draw();

    // draw all players
    for (const player of Object.values(ENTITIES.PLAYERS)) player.draw();

    requestAnimationFrame(render);
}