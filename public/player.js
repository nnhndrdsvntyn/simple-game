import { socket } from './client.js';
import { ENTITIES } from './game.js';
import { camera } from './client.js';
import { LC } from './client.js';

export class Player {
    constructor(id, pos = { x: 5000, y: 5000 }) {
        this.id = id;
        this.radius = 30;
        this.pos = pos;
        this.newPos = { ...this.pos };
        this.chatMessage = "";
        this.color = (this.id === socket.id) ? 'blue' : 'red'; // blue if local player, red if its another player
    }
    draw = function() {
        // interpolate from pos to newPos
        const lerpSpeedOrWhatever = 0.3;
        this.pos.x += (this.newPos.x - this.pos.x) * lerpSpeedOrWhatever;
        this.pos.y += (this.newPos.y - this.pos.y) * lerpSpeedOrWhatever;
        
        const localPlayer = ENTITIES.PLAYERS[socket.id];
        const cameraPos = {
            x: localPlayer.pos.x - (camera.width / 2),
            y: localPlayer.pos.y - (camera.height / 2)
        };

        const screenPos = [
            this.pos.x - cameraPos.x,
            this.pos.y - cameraPos.y
        ];


        // simulate black outline on player by drawing a bigger blacker circle first
        LC.drawCircle({
            pos: screenPos,
            radius: this.radius * 1.1,
            color: 'black'
        });

        LC.drawCircle({
            pos: screenPos,
            radius: this.radius,
            color: this.color
        });

        // draw chat message bubble if its not empty
        if (this.chatMessage != '') {
            const textSize = LC.measureText({
                text: this.chatMessage,
                font: '16px Arial'
            });
            const x = screenPos[0] - textSize.width / 2;
            const y = screenPos[1] - this.radius - textSize.height - 10;
            LC.drawText({
                text: this.chatMessage,
                pos: [x, y],
                color: 'white'
            });
        }
    };
};