export const entityMap = {
    PLAYERS: {
        defaultScore: 0,
        defaultRadius: 30,
        defaultSpeed: 20,
        'skins': {
            "player-default": './images/player-default.png'
        }
    },
    MOBS: {
        chick: {
            radius: 30,
            xpDropTypes: ['green'],
            xpDropAmountRange: [1, 1],
            speed: 10,
            score: 50,
            maxHealth: 20,
            imgSrc: './images/chick.png'
        },
        pig: {
            radius: 60,
            xpDropTypes: ['green', 'red'],
            xpDropAmountRange: [1, 4],
            speed: 10,
            score: 200,
            maxHealth: 100,
            imgSrc: './images/pig.png'
        }
    },
    PROJECTILES: {
        'pebble': {
            imgSrc: './images/projectiles/pebble.png',
            radius: 10,
            speed: 30,
            damage: 10,
            knockbackStrength: 30
        },
        'bullet': {
            imgSrc: './images/projectiles/bullet.png',
            radius: 10,
            speed: 100,
            damage: 50,
            knockbackStrength: 15
        }
    },
    STRUCTURES: {
        'spawn-zone': {
            imgSrc: './images/spawn-zone.png',
            radius: 500,
            color: 'blue'
        },
        'rock1': {
            imgSrc: './images/rock1.png',
            radius: 150,
            color: 'black'
        }
    },
    XP_POINTS: {
        'green': {
            imgSrc: './images/xp-green.png',
            radius: 30,
            score: 10,
            color: 'green'
        },
        'red': {
            imgSrc: './images/xp-red.png',
            radius: 30,
            score: 30,
            color: 'red'
        },
        'blue': {
            imgSrc: './images/xp-blue.png',
            radius: 30,
            score: 100,
            color: 'blue',
        },
        'purple': {
            imgSrc: './images/xp-purple.png',
            radius: 30,
            score: 250,
            color: 'purple'
        }
    }
}