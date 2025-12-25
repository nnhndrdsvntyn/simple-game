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

export class Player {
    constructor(id, pos = {
        x: 5000,
        y: 5000
    }) {
        this.id = id;
        this.radius = 30;
        this.score = 0;
        this.newScore = 0;
        this.pos = pos;
        this.newPos = {
            ...this.pos
        };
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