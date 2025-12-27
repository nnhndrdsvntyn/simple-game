import { LC } from './client.js';
import { entityMap } from '../shared/entitymap.js';

Object.values(entityMap).forEach(projectile => LC.loadImage({ name: projectile.type, src: projectile.imgSrc }));

export class Projectile {
    constructor(id, pos, angle, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.newPos = { ... pos };
        this.angle = angle;
        this.radius = entityMap.get(type).radius;
        LC.loadImage({
            name: type,
            src: entityMap.get(type).imgSrc,
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
            size: [entityMap.get(this.type).imgDimensions.width, entityMap.get(this.type).imgDimensions.height]
        });
    }
}