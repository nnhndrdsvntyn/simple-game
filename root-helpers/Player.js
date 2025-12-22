// -= PLAYER CLASS -= \\

// -= IMPORT CONSTANTS -= \\
import Constants from "../root-helpers/Constants.js";

class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = 20;
        this.keys = {w: false, a: false, s: false, d: false};
        this.chatMessage = '';
        this.msgTimeout;
        this.changed = false;
    }
    move (key) {
        const oldX = this.x;
        const oldY = this.y;

        key === 'w' ? this.y -= this.speed  : null;
        key === 'a' ? this.x -= this.speed : null;
        key === 's' ? this.y += this.speed : null;
        key === 'd' ? this.x += this.speed : null;

        if (this.x !== oldX || this.y !== oldY) {
            this.changed = true;
        }
    }
    setMessage (message) {
        this.chatMessage = message;
        this.changed = true;
        clearTimeout(this.msgTimeout);
        this.msgTimeout = setTimeout(() => {
            this.chatMessage = '';
            this.changed = true;
        }, Constants.PLAYERS.CHAT_DURATION * 1000);
    }
}

// -= EXPORT PLAYER CLASS -= \\
export default Player;