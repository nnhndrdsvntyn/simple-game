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


        // simulate black outline on player
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
    };
};