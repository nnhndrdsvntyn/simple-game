export const entityMap = {
    PLAYERS: {
        defaultScore: 0,
        defaultRadius: 30,
        defaultSpeed: 20,
        attackCooldownTime: 250, // in milliseconds
        'skins': {
            "player-default": './images/player-default.png'
        }
    },
    MOBS: {
        chick: {
            radius: 20,
            xpDropTypes: ['green'],
            xpDropAmountRange: [1, 1],
            speed: 10,
            score: 50,
            maxHealth: 20,
            imgSrc: './images/chick.png'
        },
        pig: {
            radius: 40,
            xpDropTypes: ['green', 'red'],
            xpDropAmountRange: [2, 4],
            speed: 10,
            score: 200,
            maxHealth: 100,
            imgSrc: './images/pig.png'
        },
        cow: {
            radius: 60,
            xpDropTypes: ['red', 'blue'],
            xpDropAmountRange: [2, 4],
            speed: 10,
            score: 300,
            maxHealth: 200,
            imgSrc: './images/cow.png'
        
        }
    },
    PROJECTILES: {
        'pebble': {
            imgSrc: './images/projectiles/pebble.png',
            radius: 10,
            speed: 30,
            damage: 10,
            cooldownTime: 250, // in ms
            knockbackStrength: 30
        },
        'bullet': {
            imgSrc: './images/projectiles/bullet.png',
            radius: 10,
            speed: 100,
            damage: 100,
            cooldownTime: 1000, // in ms
            knockbackStrength: 15
        },
        'bowling-ball': {
            imgSrc: './images/projectiles/bowling-ball.png',
            radius: 15,
            speed: 50,
            damage: 85,
            cooldownTime: 1200, // in ms
            knockbackStrength: 60
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