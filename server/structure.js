import { structureMap } from '../public/shared/structuremap.js';
export class Structure {
    constructor(id, pos, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.radius = structureMap.get(type).radius;
    }
}