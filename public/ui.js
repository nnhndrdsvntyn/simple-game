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


// arrow buttons top, bottom, right, left to move player on mobile
// Create container
const arrowButtonsContainer = document.createElement('div');
document.body.appendChild(arrowButtonsContainer);

const sendKey = (key, state) => {
    socket.emit('keyInput', { key, state });
};

const buttonSize = 60;
const gap = 5;
const containerSize = buttonSize * 3 + gap * 2;

arrowButtonsContainer.style.cssText = `
    position: fixed;
    left: 20px;
    bottom: 20px;
    width: ${containerSize}px;
    height: ${containerSize}px;
    display: grid;
    grid-template: repeat(3, 1fr) / repeat(3, 1fr);
    gap: ${gap}px;
    z-index: 1000;
    touch-action: none;
`;

const createButton = (text, key, col, row) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        grid-column: ${col};
        grid-row: ${row};
        width: ${buttonSize}px;
        height: ${buttonSize}px;
        border: none;
        border-radius: 8px;
        background: rgba(0,0,0,0.7);
        color: white;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: manipulation;
        user-select: none;
    `;
    
    // Touch events
    btn.ontouchstart = (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(0.95)';
        btn.style.background = 'rgba(50,50,50,0.9)';
        sendKey(key, true);
    };
    
    btn.ontouchend = (e) => {
        e.preventDefault();
        btn.style.transform = '';
        btn.style.background = 'rgba(0,0,0,0.7)';
        sendKey(key, false);
    };
    
    // Mouse events
    btn.onmousedown = () => {
        btn.style.transform = 'scale(0.95)';
        btn.style.background = 'rgba(50,50,50,0.9)';
        sendKey(key, true);
    };
    
    btn.onmouseup = () => {
        btn.style.transform = '';
        btn.style.background = 'rgba(0,0,0,0.7)';
        sendKey(key, false);
    };
    
    btn.onmouseleave = () => {
        btn.style.transform = '';
        btn.style.background = 'rgba(0,0,0,0.7)';
        sendKey(key, false);
    };
    
    return btn;
};

arrowButtonsContainer.append(
    createButton('↑', 'w', 2, 1),
    createButton('←', 'a', 1, 2),
    createButton('→', 'd', 3, 2),
    createButton('↓', 's', 2, 3)
);