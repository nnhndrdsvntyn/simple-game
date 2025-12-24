import {
    socket
} from './client.js';
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