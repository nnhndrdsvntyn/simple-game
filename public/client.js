// -= LOAD LIBCANVAS API -= \\
window.LC = new LibCanvas();

// -= CONNECT TO SERVER -= \\
window.socket = io();
window.socket.on("connect", () => {
    const player = new Player(socket.id, 5000, 5000);
    window.Players[socket.id] = player;
    console.log("Socket connected with id:", socket.id);
});

// -+ INIT LISTENER -+ \\
window.socket.on('init', (d) => {
    const players = d.players;
    players.forEach(player => {
        // Don't create duplicate if local player already exists
        if (!window.Players[player.id]) {
            const p = new Player(player.id, player.x, player.y);
            window.Players[player.id] = p;
            p.setNewPosition(player.x, player.y); // Set initial new
        }
    });

    const decorations = d.decorations;
    decorations.forEach(decoration => {

        window.Decorations[decoration.id] = new Decoration(decoration.id, decoration.x, decoration.y, decoration.type);
    });
})

// -+ ADD LISTENER -+ \\
window.socket.on('add', (data) => {
    if (data.type === 'player') {
        const p = new Player(data.id, data.x, data.y);
        window.Players[data.id] = p;
        p.setNewPosition(data.x, data.y);
        console.log(`Player ${data.id} joined the game.`);
    }
});

// -+ DELETE LISTENER -+ \\
window.socket.on('delete', (d) => {
    if (d.type === 'player') {
        delete window.Players[d.id];
    }
})

// -+ UPDATE LISTENER -+ \\
window.socket.on('update', (d) => {
    let players = d.players;
    players.forEach(player => {
        if (!window.Players[player.id]) return;
        // Use setNewPosition instead of directly setting x,y
        window.Players[player.id].setNewPosition(player.x, player.y);

        // update players chat messages
        window.Players[player.id].chatMessage = player.chatMessage;
    });
});

// -+ KICKED LISTENER -+ \\
window.socket.on('kicked', (data) => {
    alert(`You have been kicked from the server.\nReason: ${data.reason}`);
})

// -= DATA STORING -= \\
window.Players = {};
window.Decorations = {};

// -= HELPERS -= \\
// -+ LINEAR-INTERPOLATION -+ \\
function lerp(start, end, t) {
    return start + (end - start) * t;
    // For smoother easing, you could use: return start + (end - start) * (1 - Math.pow(0.5, t));
}

// -= IMPORT CONSTANTS -= \\
import Constants from "../public-helpers/Constants.js";

// -= IMPORT PLAYER CLASS -= \\
import Player from '../public-helpers/Player.js';

// -= IMPORT DECORATION CLASS -= \\
import Decoration from '../public-helpers/Decoration.js';

// -= TAKE INPUT VIA KEYS -= \\
window.addEventListener('keydown', e => Players[socket.id]?.move?.(e.key, true));
window.addEventListener('keyup', e => Players[socket.id]?.move?.(e.key, false));

// -= RENDER EVERYTHING -= \\
function render() {
    // clear the LibCanvas
    LC.clearCanvas();

    // render all decorations
    Object.values(window.Decorations).forEach(decoration => {
        decoration.draw();
    });
    
    // render all players
    Object.values(window.Players).forEach(player => {
        player.draw();
    });

    // render coordinates top left of the screen
    LC.drawText({
        text: `Player Coordinates: X: ${Math.round(Players[socket.id].x)}, Y: ${Math.round(Players[socket.id].y)}`,
        pos: [10, 30],
        font: '20px Arial',
        color: 'white'
    });

    // request next frame

    requestAnimationFrame(render);
}
setTimeout(() => {
    render();
}, 1000)
// start loop after 1 second;