// -= PLAYER CLASS -= \\
// -+ IMPORT LERP HELPER -+ \\
import lerp from './lerp.js';

// -= IMPORT CONSTANTS -= \\
import Constants from "../public-helpers/Constants.js";

class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.chatMessage = '';
        this.newX = x; // Where we're interpolating to
        this.newY = y;
        this.prevX = x; // Where we started interpolation from
        this.prevY = y;
        this.lastUpdate = Date.now(); // When we received the last position
        this.color = null;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        }
        this.activeKeys = new Set();
    }

    // Update new position (called from server updates)
    setNewPosition(x, y) {
        // Store current position as previous for interpolation
        this.prevX = this.x;
        this.prevY = this.y;

        // Set new target
        this.newX = x;
        this.newY = y;

        // Reset interpolation timer
        this.lastUpdate = Date.now();
    }

    // Update current position based on interpolation
    updatePosition() {
        const now = Date.now();
        const timeSinceUpdate = now - this.lastUpdate;
        const interpolationTime = 50;

        // For ALL players, including local
        const t = Math.min(timeSinceUpdate / interpolationTime, 1);
        this.x = lerp(this.prevX, this.newX, t);
        this.y = lerp(this.prevY, this.newY, t);
    }

    draw() {
        // First update position based on interpolation
        this.updatePosition();

        if (!this.color) {
            this.color = (this.id === socket.id) ? 'blue' : 'red';
        };

        let screenPos;
        if (this.id === socket.id) {
            screenPos = LC.center;
        } else {
            if (!Players[socket.id]) return;
            // Local player updates its own position in its draw() call
            // No need to call it again here

            screenPos = [
                this.x - Players[socket.id].x + LC.center[0],
                this.y - Players[socket.id].y + LC.center[1]
            ];
        }

        // don't render if off screen
        if (Math.abs(this.x - Players[socket.id].x) > LC.width / 2 + this.size ||
            Math.abs(this.y - Players[socket.id].y) > LC.height / 2 + this.size) {
            return;
        }

        LC.drawCircle({
            pos: screenPos,
            radius: Constants.PLAYERS.RADIUS,
            color: this.color,
            transparency: 1
        });

        // draw chat message if exists
        if (this.chatMessage !== '') {
            const font = '14px Arial';
            const padding = 6;

            const [cx, cy] = screenPos;
            const y = cy - Constants.PLAYERS.RADIUS - 10;

            const {
                width,
                height
            } = LC.measureText({
                text: this.chatMessage,
                font
            });

            const bgWidth = width + padding * 2;
            const bgHeight = height + padding * 2;

            const bgX = cx - bgWidth / 2;
            const bgY = cy - Constants.PLAYERS.RADIUS - bgHeight - 10;

            LC.drawRect({
                pos: [bgX, bgY],
                size: [bgWidth, bgHeight],
                color: 'darkgray',
                transparency: 0.6
            });

            LC.drawText({
                text: this.chatMessage,
                pos: [cx - width / 2, y - padding],
                font,
                color: 'black'
            });
        }
    }

    sendPacket(event, data) {
        socket.emit(event, data);
    }

    move(key, state) {
        if (!['w', 'a', 's', 'd'].includes(key)) return;

        const alreadyActive = this.activeKeys.has(key);

        if (state && !alreadyActive) {
            this.activeKeys.add(key);
            this.sendPacket('keystate', {
                key,
                state
            });
        } else if (!state && alreadyActive) {
            this.activeKeys.delete(key);
            this.sendPacket('keystate', {
                key,
                state
            });
        }
    }
}

export default Player