import {
    socket
} from './client.js';
import {
    ENTITIES
} from './game.js';
import {
    camera
} from './client.js';
import {
    LC
} from './client.js';
import { renderGameInfo } from './ui.js';
import { playerMap } from './shared/playermap.js';

export class Player {
    constructor(id, pos = {
        x: 5000,
        y: 5000
    }) {
        this.id = id;
        this.radius = 30;
        this.newRadius = 30;
        this.score = 0;
        this.newScore = 0;
        this.pos = pos;
        this.newAngle = 0;
        this.angle = 0;
        this.newPos = {
            ...this.pos
        };
        this.chatMessage = "";
        this.color = (this.id === socket.id) ? 'blue' : 'red'; // blue if local player, red if its another player
        LC.loadImage({
            name: 'player-default',
            src: playerMap.get('player-default').imgSrc
        });
    }
    draw = function() {
        // interpolate from pos to newPos
        const lerpSpeedOrWhatever = 0.5;
        this.pos.x += (this.newPos.x - this.pos.x) * lerpSpeedOrWhatever;
        this.pos.y += (this.newPos.y - this.pos.y) * lerpSpeedOrWhatever;


        // camera positions
        let screenPos = [
            this.pos.x - (camera.pos.x - camera.width / 2),
            this.pos.y - (camera.pos.y - camera.height / 2)
        ];
        if (this.id === socket.id && camera.newTarget.id == socket.id) screenPos = LC.center;

        // interpolate from radius to newRadius
        this.radius += (this.newRadius - this.radius) * lerpSpeedOrWhatever;

        LC.drawImage({
            pos: [screenPos[0] - (this.radius), screenPos[1] - (this.radius)],
            name: 'player-default',
            size: [this.radius * 2, this.radius * 2]
        })

        // draw a red orb in front of the player based on their angle
        const angle = this.angle * (Math.PI / 180);
        const orbPos = [
            screenPos[0] + Math.cos(angle) * this.radius,
            screenPos[1] + Math.sin(angle) * this.radius
        ];
        LC.drawCircle({
            pos: orbPos,
            radius: 5,
            color: 'red'
        });
        
        /*
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
        */

        // draw chat message bubble if its not empty
        if (this.chatMessage != '') {
            const fontSize = 16;
            const fontFamily = 'Arial';
            const font = `${fontSize}px ${fontFamily}`;

            const textSize = LC.measureText({
                text: this.chatMessage,
                font: font
            });

            const bubblePadding = 10; // Horizontal padding
            const verticalPadding = 6; // Vertical padding (reduced from 10)
            const bubbleWidth = textSize.width + bubblePadding * 2;
            const bubbleHeight = textSize.height + verticalPadding * 2;

            // Calculate bubble position (centered above player)
            const bubbleX = screenPos[0] - bubbleWidth / 2;
            const bubbleY = screenPos[1] - this.radius - bubbleHeight - 5;

            // Draw bubble background with reduced height
            LC.drawRect({
                pos: [bubbleX, bubbleY],
                size: [bubbleWidth, bubbleHeight],
                color: 'rgba(64, 59, 59)',
                transparency: 0.9,
                cornerRadius: 10,
            });

            // Draw text properly centered
            // Text needs to be positioned considering its baseline
            const textX = bubbleX + bubblePadding;
            const textY = bubbleY + verticalPadding + fontSize * 0.8; // Adjust for baseline

            LC.drawText({
                text: this.chatMessage,
                pos: [textX, textY],
                color: 'white',
                font: font
            });
        }

        // draw game info
        renderGameInfo();
    };
};