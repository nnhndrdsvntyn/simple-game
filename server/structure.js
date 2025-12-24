export const structureMap = new Map();
structureMap.set('rock1', {
    type: 'rock1',
    radius: 150,
});
export class Structure {
    constructor(id, pos, type) {
        this.id = id;
        this.pos = pos;
        this.type = type;
        this.radius = structureMap.get(type).radius;
    }
}