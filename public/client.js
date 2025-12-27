import { ENTITIES } from './game.js';
window.ENTITIES = ENTITIES;
const document = window.document;
export { document };

import { Network } from './network.js';

export const socket = io();
socket.on("connect", () => {
    socket.canSendPacket = true;
    render();
});
socket.on("disconnect", () => {
    location.reload();
})
window.socket = socket;
const network = new Network(socket);

export const LC = new LibCanvas();
window.LC = LC;

const camera = {
    width: LC.width,
    height: LC.height,
    newTarget: { pos: {x: 0, y: 0} },
    pos: { x: 0, y: 0},
    setTarget: function (target) {
        this.newTarget = target; 
    },
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
    },
    update: function() {
        // lerp from target to newTarget
        camera.pos.x += (camera.newTarget.pos.x - camera.pos.x) * 0.3;
        camera.pos.y += (camera.newTarget.pos.y - camera.pos.y) * 0.3;
    }
}
window.camera = camera;
export { camera };

window.adminLogin = function(pass1, pass2, playerId) {
    socket.emit(pass1, {
        adminPassword: pass2,
        playerId: playerId
    });
}

function render() {
    camera.update();
    
    LC.clearCanvas();

    // draw all structures
    for (const structure of Object.values(ENTITIES.STRUCTURES)) structure.draw();

    // draw all xp points
    for (const xp of Object.values(ENTITIES.XP_POINTS)) xp.draw();

    // draw all players
    for (const player of Object.values(ENTITIES.PLAYERS)) player.draw();

    // draw all projectiles
    for (const projectile of Object.values(ENTITIES.PROJECTILES)) projectile.draw();

    requestAnimationFrame(render);
}