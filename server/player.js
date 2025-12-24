export class Player {
    constructor(id) {
        this.id = id;
        this.pos = {x: 5000, y: 5000};
        this.speed = 20;
        this.velocity = {x: 0, y: 0};
        this.keys = {w: false, a: false, s: false, d: false};
        this.changed = true;
    }
    move() {
        const oldPos = { ... this.pos };
        
        if (this.keys['w']) this.velocity.y = -this.speed;
        if (this.keys['a']) this.velocity.x = -this.speed;
        if (this.keys['s']) this.velocity.y = this.speed;
        if (this.keys['d']) this.velocity.x = this.speed;

        if (!this.keys['w'] && !this.keys['s']) this.velocity.y = 0;
        if (!this.keys['a'] && !this.keys['d']) this.velocity.x = 0;
        
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

        if (this.pos.x !== oldPos.x || this.pos.y !== oldPos.y) this.changed = true;
    }
}