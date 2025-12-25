import { socket } from './client.js';
import { ENTITIES } from './game.js';
import { LC } from './client.js';

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

// Chat input (simplified)
export function createChatInput() {
    const input = document.createElement('input');
    input.style.cssText = `
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
    input.type = 'text';
    input.placeholder = 'Type message...';
    input.maxLength = 50;
    
    return input;
}

// Chat button (simplified)
export function createChatButton() {
    const button = document.createElement('button');
    button.style.cssText = `
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
    button.textContent = 'CHAT';
    
    return button;
}

// Joystick (simplified)
export function createJoystick() {
    const container = document.createElement('div');
    const knob = document.createElement('div');
    
    container.style.cssText = `
        position: fixed;
        left: 40px; bottom: 40px;
        width: 150px; height: 150px;
        border-radius: 50%;
        background: rgba(0,0,0,0.3);
        z-index: 1000;
        touch-action: none;
    `;
    
    knob.style.cssText = `
        width: 60px; height: 60px;
        border-radius: 50%;
        background: rgba(0,0,0,0.7);
        position: absolute;
        top: 45px; left: 45px;
        cursor: pointer;
        touch-action: none;
    `;
    
    container.appendChild(knob);
    return { container, knob };
}

// Simple joystick logic
export function setupJoystick(container, knob) {
    let activeKeys = new Set();
    let isDragging = false;
    
    const sendKey = (key, state) => {
        socket.emit('keyInput', { key, state });
    };
    
    const updateMovement = (clientX, clientY) => {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + 75;
        const centerY = rect.top + 75;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.min(Math.sqrt(deltaX*deltaX + deltaY*deltaY), 50);
        
        if (distance === 0) return;
        
        // Move knob
        knob.style.transform = `translate(${deltaX * (50/distance)}px, ${deltaY * (50/distance)}px)`;
        
        // Calculate direction
        const normX = deltaX / distance;
        const normY = deltaY / distance;
        const newKeys = new Set();
        
        if (normY < -0.3) newKeys.add('w');
        if (normY > 0.3) newKeys.add('s');
        if (normX < -0.3) newKeys.add('a');
        if (normX > 0.3) newKeys.add('d');
        
        // Update keys
        activeKeys.forEach(key => !newKeys.has(key) && sendKey(key, false));
        newKeys.forEach(key => !activeKeys.has(key) && sendKey(key, true));
        activeKeys = newKeys;
    };
    
    const resetJoystick = () => {
        knob.style.transform = 'translate(0, 0)';
        activeKeys.forEach(key => sendKey(key, false));
        activeKeys.clear();
        isDragging = false;
    };
    
    // Event handlers
    const startDrag = (e) => {
        e.preventDefault();
        isDragging = true;
    };
    
    const moveDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const coords = e.touches ? e.touches[0] : e;
        updateMovement(coords.clientX, coords.clientY);
    };
    
    const endDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        resetJoystick();
    };
    
    // Attach events
    knob.addEventListener('mousedown', startDrag);
    knob.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

// Initialize everything
export function initUI() {
    // Chat system
    const chatInput = createChatInput();
    const chatButton = createChatButton();
    document.body.append(chatInput, chatButton);
    
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
    
    // Joystick
    const { container, knob } = createJoystick();
    document.body.appendChild(container);
    setupJoystick(container, knob);
}