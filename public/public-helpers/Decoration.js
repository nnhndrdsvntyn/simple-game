// -= DECORATION CLASS -= \\
// -= IMPORT CONSTANTS -= \\
import Constants from "../public-helpers/Constants.js";

class Decoration {
    constructor(id, x, y, type) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = Constants.DECORATIONS[type].size;
        this.color = Constants.DECORATIONS[type].color;
    }
    
    draw() {
        const screenPos = [
            this.x - Players[socket.id].x + LC.center[0],
            this.y - Players[socket.id].y + LC.center[1]
        ];

        // don't render if off screen.
        if(Math.abs(this.x - Players[socket.id].x) > LC.width / 2 + this.size || 
            Math.abs(this.y - Players[socket.id].y) > LC.height / 2 + this.size) {
            return;
        }
        
        // render the image

        // render the debug circle (gray-ish color from Constants)
        // comment out the code block under this to hide the debug circle
        LC.drawCircle({
            pos: screenPos,
            radius: this.size,
            color: this.color,
            transparency: 1
        });
    }
}

export default Decoration;