import { socket } from './client.js';
import { ENTITIES } from './game.js';
import { camera } from './client.js';
import { LC } from './client.js';
import { xpMap } from './shared/xpmap.js';

export class XP {
    constructor(id, pos, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.radius = xpMap.get(type).radius;
        this.color = xpMap.get(type).color;

        LC.loadImage({
            name: this.type,
            src: xpMap.get(type).imgSrc
        });
    }
    draw = function() {
        const localPlayer = ENTITIES.PLAYERS[socket.id];
        const cameraPos = {
            x: localPlayer.pos.x - (camera.width / 2),
            y: localPlayer.pos.y - (camera.height / 2)
        }
        
        const screenPos = [
            this.pos.x - cameraPos.x,
            this.pos.y - cameraPos.y
        ];

        /*
        LC.drawCircle({
            pos: screenPos,
            radius: this.radius,
            color: this.color
        });
        */

        LC.drawImage({
            pos: [screenPos[0] - (this.radius), screenPos[1] - (this.radius)],
            name: this.type,
            size: [
                this.radius * 2,
                this.radius * 2
            ]
        });
    }
}