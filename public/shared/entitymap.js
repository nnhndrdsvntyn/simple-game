import { images } from '../images/images.js';

export const entityMap = new Map();

// Player
entityMap.set('player-default', {
    type: 'player-default',
    imgSrc: './images/player-default.png'
});

// Projectile
entityMap.set('pebble', {
    type: 'pebble',
    imgSrc: images['pebble'],
    radius: 10,
    knockbackStrength: 30,
    imgDimensions: { width: 10 * 2, height: 10 * 2 }
});

// Structure
entityMap.set('spawn-zone', {
    type: 'spawn-zone',
    radius: 500,
    color: 'blue',
    imgSrc: './images/spawn-zone.png'
});
entityMap.set('rock1', {
    type: 'rock1',
    radius: 150,
    color: 'black',
    imgSrc: './images/rock1.png'
});

// XP
entityMap.set('green', {
    type: 'green',
    radius: 30,
    score: 10,
    color: 'green',
    imgSrc: './images/xp-green.png'
});
entityMap.set('red', {
    type: 'red',
    radius: 30,
    score: 30,
    color: 'red',
    imgSrc: './images/xp-red.png'
});
entityMap.set('blue', {
    type: 'blue',
    radius: 30,
    score: 100,
    color: 'blue',
    imgSrc: './images/xp-blue.png'
});
entityMap.set('purple', {
    type: 'purple',
    radius: 30,
    score: 250,
    color: 'purple',
    imgSrc: './images/xp-purple.png'
});
