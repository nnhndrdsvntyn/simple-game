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

    // draw player's current score at the bottom center of the screen
    if (player) {
        LC.drawText({
            text: `Score: ${player.score}`,
            pos: [LC.width / 2, LC.height - 20],
            color: 'white',
            font: '16px Arial'
        })
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


// Create joystick container
const joystickContainer = document.createElement('div');
document.body.appendChild(joystickContainer);

joystickContainer.style.cssText = `
    position: fixed;
    left: 40px;
    bottom: 40px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: rgba(0,0,0,0.3);
    z-index: 1000;
    touch-action: none;
`;

// Create joystick knob
const joystickKnob = document.createElement('div');
joystickContainer.appendChild(joystickKnob);

joystickKnob.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    position: absolute;
    top: 45px;
    left: 45px;
    cursor: pointer;
    touch-action: none;
    user-select: none;
`;

const sendKey = (key, state) => {
    socket.emit('keyInput', { key, state });
};

let isDragging = false;
let activeKeys = new Set();
let startX = 0, startY = 0;

const updateMovement = (clientX, clientY) => {
    const containerRect = joystickContainer.getBoundingClientRect();
    const centerX = containerRect.left + 75;
    const centerY = containerRect.top + 75;
    
    // Calculate delta from center
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    // Limit movement to 50px max
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    const limitedDistance = Math.min(distance, maxDistance);
    
    if (limitedDistance === 0) return;
    
    // Calculate knob position
    const ratio = limitedDistance / distance;
    const knobX = deltaX * ratio;
    const knobY = deltaY * ratio;
    
    // Move knob
    joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
    
    // Determine direction (using 0.3 threshold)
    const normX = deltaX / limitedDistance;
    const normY = deltaY / limitedDistance;
    
    const newActiveKeys = new Set();
    
    // Up/Down
    if (normY < -0.3) {
        newActiveKeys.add('w');
    } else if (normY > 0.3) {
        newActiveKeys.add('s');
    }
    
    // Left/Right
    if (normX < -0.3) {
        newActiveKeys.add('a');
    } else if (normX > 0.3) {
        newActiveKeys.add('d');
    }
    
    // Send keyup for keys that are no longer active
    activeKeys.forEach(key => {
        if (!newActiveKeys.has(key)) {
            sendKey(key, false);
        }
    });
    
    // Send keydown for new active keys
    newActiveKeys.forEach(key => {
        if (!activeKeys.has(key)) {
            sendKey(key, true);
        }
    });
    
    activeKeys = newActiveKeys;
};

const resetJoystick = () => {
    joystickKnob.style.transform = 'translate(0px, 0px)';
    activeKeys.forEach(key => {
        sendKey(key, false);
    });
    activeKeys.clear();
    isDragging = false;
};

// Touch events
joystickKnob.ontouchstart = (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
};

document.ontouchmove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    updateMovement(e.touches[0].clientX, e.touches[0].clientY);
};

document.ontouchend = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    resetJoystick();
};

// Mouse events
joystickKnob.onmousedown = (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
};

document.onmousemove = (e) => {
    if (!isDragging) return;
    updateMovement(e.clientX, e.clientY);
};

document.onmouseup = () => {
    if (!isDragging) return;
    resetJoystick();
};