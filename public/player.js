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
import { entityMap } from './shared/entitymap.js';

export class Player {
    constructor(id, pos = {x: 5000, y: 5000}) {
        this.id = id;
        this.radius = entityMap.PLAYERS.defaultRadius
        this.newRadius = this.radius;
        this.score = entityMap.PLAYERS.defaultScore;
        this.newScore = this.score;
        this.hasShield = true;
        this.health = null;
        this.newHealth = null;
        this.maxHealth = null;
        this.pos = pos;
        this.newPos = {
            ...this.pos
        };
        this.newAngle = 0;
        this.angle = 0;
        this.chatMessage = "";
        this.color = (this.id === socket.id) ? 'blue' : 'red'; // blue if local player, red if its another player
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

        // if the player has a shield, draw the shield image on top of them
        if (this.hasShield) {
            LC.drawImage({
                pos: [screenPos[0] - (this.radius * 1.5), screenPos[1] - (this.radius) * 1.5],
                name: 'spawn-zone-shield',
                size: [this.radius * 3, this.radius * 3],
                transparency: 0.5
            });
        }

        LC.drawImage({
            pos: [screenPos[0] - (this.radius), screenPos[1] - (this.radius)],
            name: 'player-default',
            size: [this.radius * 2, this.radius * 2]
        });

        // interpolate from angle to newAngle
        // bulkier logic to fix interpolation bug with angles
        this.angle += (((this.newAngle - this.angle + 540) % 360 - 180) * lerpSpeedOrWhatever);
        this.angle = ((this.angle + 540) % 360) - 180;

        // draw a red orb in front of the player based on their angle
        const angle = this.angle * (Math.PI / 180);
        const orbPos = [
            screenPos[0] + Math.cos(angle) * (this.radius * 1.25),
            screenPos[1] + Math.sin(angle) * (this.radius * 1.25)
        ];
        LC.drawCircle({
            pos: orbPos,
            radius: 5,
            color: 'red'
        });

        // interpolate from heatlh to newHealth
        this.health += (this.newHealth - this.health) * lerpSpeedOrWhatever;

        const healthBarWidth = 50;
        const healthBarHeight = 8;
        const healthBarX = screenPos[0] - healthBarWidth / 2;
        const healthBarY = screenPos[1] + this.radius + 10;

        // Draw the background of the health bar (the "missing" health)
        LC.drawRect({
            pos: [healthBarX, healthBarY],
            size: [healthBarWidth, healthBarHeight],
            color: 'red'
        });

        // Draw the foreground of the health bar (the current health)
        const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;
        LC.drawRect({
            pos: [healthBarX, healthBarY],
            size: [currentHealthWidth, healthBarHeight],
            color: 'green'
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