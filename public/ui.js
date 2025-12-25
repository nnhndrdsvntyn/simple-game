import { socket } from './client.js';
import { ENTITIES } from './game.js';
import { LC } from './client.js';

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Game info rendering
export function renderGameInfo() {
    const playerCount = Object.keys(ENTITIES.PLAYERS).length;
    const player = ENTITIES.PLAYERS[socket.id];
    
    // Draw info panel
    LC.drawRect({
        pos: [20, 20],
        size: [180, 60],
        color: 'rgba(0, 0, 0, 0.7)',
        cornerRadius: 5
    });
    
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
    
    // Draw score
    if (player) {
        player.score += (player.newScore - player.score) * 0.2;
        LC.drawText({
            text: `Score: ${player.score.toFixed(0)}`,
            pos: [LC.width / 2, LC.height - 20],
            color: 'white',
            font: '16px Arial'
        });
    }
};

// Chat input
const chatInput = document.createElement('input');
chatInput.style.cssText = `
    position: absolute;
    top: 60%; left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: none;
    z-index: 1000;
`;
chatInput.type = 'text';
chatInput.placeholder = 'Type message...';
chatInput.maxLength = 50;
document.body.appendChild(chatInput);

// Chat button (show on mobile only)
const chatButton = document.createElement('button');
chatButton.style.cssText = `
    position: absolute;
    bottom: 20px; right: 20px;
    padding: 10px 20px;
    font-size: 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    z-index: 1000;
`;
chatButton.textContent = 'CHAT';
document.body.appendChild(chatButton);

// Show chat button only on mobile
if (!isMobile) {
    chatButton.style.display = 'none';
}

// Chat logic
chatButton.onclick = () => {
    if (chatInput.style.display === 'block') {
        const msg = chatInput.value.trim();
        if (msg) socket.emit('chat', { message: msg });
        chatInput.value = '';
        chatInput.style.display = 'none';
    } else {
        chatInput.style.display = 'block';
        chatInput.focus();
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (chatInput.style.display === 'none') {
            chatInput.style.display = 'block';
            chatInput.focus();
        } else {
            const msg = chatInput.value.trim();
            if (msg) socket.emit('chat', { message: msg });
            chatInput.value = '';
            chatInput.style.display = 'none';
        }
    }
});

// Joystick (mobile only)
let joystickContainer, joystickKnob;
let activeKeys = new Set();
let isDragging = false;

if (isMobile) {
    // Create joystick container
    joystickContainer = document.createElement('div');
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
    document.body.appendChild(joystickContainer);
    
    // Create joystick knob
    joystickKnob = document.createElement('div');
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
    joystickContainer.appendChild(joystickKnob);
    
    // Joystick logic
    const sendKey = (key, state) => {
        socket.emit('keyInput', { key, state });
    };
    
    const updateMovement = (clientX, clientY) => {
        const rect = joystickContainer.getBoundingClientRect();
        const centerX = rect.left + 75;
        const centerY = rect.top + 75;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.min(Math.sqrt(deltaX*deltaX + deltaY*deltaY), 50);
        
        if (distance === 0) return;
        
        // Move knob
        joystickKnob.style.transform = `translate(${deltaX * (50/distance)}px, ${deltaY * (50/distance)}px)`;
        
        // Calculate direction
        const normX = deltaX / distance;
        const normY = deltaY / distance;
        const newKeys = new Set();
        
        if (normY < -0.3) newKeys.add('w');
        if (normY > 0.3) newKeys.add('s');
        if (normX < -0.3) newKeys.add('a');
        if (normX > 0.3) newKeys.add('d');
        
        // Update keys
        activeKeys.forEach(key => {
            if (!newKeys.has(key)) sendKey(key, false);
        });
        newKeys.forEach(key => {
            if (!activeKeys.has(key)) sendKey(key, true);
        });
        
        activeKeys = newKeys;
    };
    
    const resetJoystick = () => {
        joystickKnob.style.transform = 'translate(0, 0)';
        activeKeys.forEach(key => sendKey(key, false));
        activeKeys.clear();
        isDragging = false;
    };
    
    // Touch events
    joystickKnob.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        updateMovement(e.touches[0].clientX, e.touches[0].clientY);
    });
    
    document.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        resetJoystick();
    });
}

// Add keyboard controls for desktop
if (!isMobile) {
    const keysPressed = {};
    
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if ((key === 'w' || key === 'a' || key === 's' || key === 'd') && !keysPressed[key]) {
            keysPressed[key] = true;
            socket.emit('keyInput', { key, state: true });
        }
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keysPressed[key]) {
            keysPressed[key] = false;
            socket.emit('keyInput', { key, state: false });
        }
    });
}