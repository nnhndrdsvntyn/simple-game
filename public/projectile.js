import { LC } from './client.js';
import { projectileMap } from './shared/projectilemap.js'; 

export class Projectile {
    constructor(id, pos, angle, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.newPos = { ... pos };
        this.angle = angle;
        this.radius = projectileMap.get(type).radius;
        LC.loadImage({
            name: type,
            src: projectileMap.get(type).imgSrc,
        });
    }
    draw = function() {
        // interpolate from pos to newPos
        const lerpSpeedOrWhatever = 0.3;
        this.pos.x += (this.newPos.x - this.pos.x) * lerpSpeedOrWhatever;
        this.pos.y += (this.newPos.y - this.pos.y) * lerpSpeedOrWhatever;
        
        const screenPos = [
            this.pos.x - (camera.pos.x - camera.width / 2),
            this.pos.y - (camera.pos.y  - camera.height / 2)
        ];
        
        LC.drawImage({
            name: this.type,
            pos: [screenPos[0] - this.radius, screenPos[1] - this.radius],
            rotation: this.angle,
            size: [projectileMap.get(this.type).imgDimensions.width, projectileMap.get(this.type).imgDimensions.height]
        });
    }
}