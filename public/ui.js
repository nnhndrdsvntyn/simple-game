import {
    socket
} from './client.js';

import { ENTITIES } from './game.js';

import { LC } from './client.js';
// render game info top left of the screen
export function renderGameInfo() {
    // Simple info panel with background
    LC.drawRect({
        pos: [20, 20],
        size: [180, 60],
        color: 'rgba(0, 0, 0, 0.7)',
        cornerRadius: 5
    });

    const playerCount = Object.keys(ENTITIES.PLAYERS).length;
    const player = ENTITIES.PLAYERS[socket.id];

    LC.drawText({
        text: `Players: ${playerCount}`,
        pos: [35, 45],
        color: 'white',
        font: '16px Arial'
    });

    if (player) {
        LC.drawText({
            text: `Pos: (${Math.round(player.pos.x)}, ${Math.round(player.pos.y)})`,
            pos: [35, 70],
            color: 'white',
            font: '16px Arial'
        });
    }
};

// chat input
const input = document.createElement('input');
Object.assign(input.style, {
    position: 'absolute',
    top: '60%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    display: 'none',
    zIndex: '1000'
});
input.type = 'text';
input.placeholder = 'Type your message...';
input.maxLength = 50;
document.body.appendChild(input);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (input.style.display === 'none') {
            input.style.display = 'block';
            input.focus();
        } else {
            const message = input.value.trim();
            if (message) {
                socket.emit('chat', {
                    message
                });
            }
            input.value = '';
            input.style.display = 'none';
        }
    }
});

// chat input button (bottom right, for mobile)
const chatButton = document.createElement('button');
Object.assign(chatButton.style, {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: '1000'
});
chatButton.textContent = 'CHAT';
chatButton.addEventListener('click', () => {
    if (input.style.display === 'block') {
        const message = input.value.trim();
        if (message) {
            socket.emit('chat', {
                message
            });
        }
        input.value = '';
        input.style.display = 'none';
    } else {
        input.style.display = 'block';
        input.focus();
    }
});
document.body.appendChild(chatButton);
