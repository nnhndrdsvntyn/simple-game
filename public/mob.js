import { LC } from './client.js';
import { camera } from './client.js';
import { entityMap } from './shared/entitymap.js';

export class Mob {
    constructor(id, pos, angle, type) {
        this.id = id;
        this.pos = pos;
        this.health = entityMap.MOBS[type].maxHealth;
        this.newHealth = entityMap.MOBS[type].maxHealth;
        this.maxHealth = entityMap.MOBS[type].maxHealth;
        this.newPos = { ... pos };
        this.angle = angle;
        this.newAngle = angle;
        this.type = type;
        this.radius = entityMap.MOBS[type].radius;
    }
    draw = function() {
        // lerp from pos to newPos
        const lerpSpeedOrWhatever = 0.3;
        this.pos.x += (this.newPos.x - this.pos.x) * lerpSpeedOrWhatever;
        this.pos.y += (this.newPos.y - this.pos.y) * lerpSpeedOrWhatever;
        
        // interpolate angle
        this.angle += (((this.newAngle - this.angle + 540) % 360 - 180) * lerpSpeedOrWhatever);
        this.angle = ((this.angle + 540) % 360) - 180;

        const screenPos = [
            this.pos.x - (camera.pos.x - camera.width / 2),
            this.pos.y - (camera.pos.y  - camera.height / 2)
        ];

        // apply image proportions based on mob
        const imgProportions = [this.radius * 2, this.radius * 2];
        if (this.type === 'pig') {
            imgProportions[0] += 50;
        } else if (this.type === 'cow') {
            imgProportions[0] += 50
        }
    
        LC.drawImage({
            name: this.type,
            pos: [screenPos[0] - imgProportions[0] / 2, screenPos[1] - imgProportions[1] / 2],
            rotation: this.angle,
            size: imgProportions
        });

        // hitbox debug
        /*
        LC.drawCircle({
            pos: screenPos,
            radius: this.radius,
            color: 'red'
        });
        */

        // lerp from health to newHealth
        this.health += (this.newHealth - this.health) * lerpSpeedOrWhatever;

        // draw health bar
        const healthBarWidth = 50;
        const healthBarHeight = 8;
        const healthBarX = screenPos[0] - imgProportions[0] / 2 + (imgProportions[0] - healthBarWidth) / 2;
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
    }
}