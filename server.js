import express from "express";
import {
    createServer
} from "http";
import {
    Server
} from "socket.io";

const app = express();
app.use(express.static("public"));
const httpServer = createServer(app);
const io = new Server(httpServer);

// -= DATA STORING -= \\
const Players = {};
const Decorations = {};

// -= IMPORT CONSTANTS -= \\
import Constants from "./root-helpers/Constants.js";

// -= IMPORT PLAYER CLASS -= \\
import Player from "./root-helpers/Player.js";

// -= IMPORT DECORATION CLASS -= \\
import Decoration from "./root-helpers/Decoration.js";
// -+ CREATE DECORATIONS -+ \\
// rocks
for (let i = 1; i <= 100; i++) {
    const id = `rock-${i}`;
    const size = Constants.DECORATIONS['rock'].size;
    const x = Math.floor(Math.random() * (Constants.MAP.WIDTH - size - 200)) + 100;
    const y = Math.floor(Math.random() * (Constants.MAP.HEIGHT - size - 200)) + 100;
    const rock = new Decoration(id, x, y, 'rock');
    Decorations[id] = rock;
}

io.on('connection', (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // create the new player
    let player = new Player(socket.id, 5000, 5000);
    Players[socket.id] = player;

    // send all clients (excluding this one) the add event
    socket.broadcast.emit("add", {
        type: 'player',
        id: socket.id,
        x: 5000,
        y: 5000
    }) 

    // send the new socket/connection all the entity data
    // send after a small wait. (gives client time to set itself up)
    
    setTimeout(() => {
        // init entry snapshots
        let players = [];
        let decorations = []

        Object.values(Players).forEach(player => {
            // make a copy of the player to send to the clients
            // speed, and keys attributes won't be shown.

            const clientPlayer = {
                id: player.id,
                x: player.x,
                y: player.y
            }
            players.push(clientPlayer);
        });
        Object.values(Decorations).forEach(decoration => {
            decorations.push(decoration);
        });
        
        socket.emit("init", {
            players: players,
            decorations: decorations
        });
    }, 500);

    // listen for inputs and change player key states
    socket.on("keystate", (data) => {
        data.state ? Players[socket.id].keys[data.key] = true : Players[socket.id].keys[data.key] = false;
    });

    // listen for chat messages and store serverside
    socket.on("chat", (data) => {
        // safety checks
        if (typeof data.message !== 'string') {
            socket.emit("kicked", { reason: 'Do not send malformed chats.' });
            socket.disconnect();
            console.log('⚠️ Socket kicked for sending a malformed chat:', socket.id);
            return;
        }
        if (data.message.length > Constants.PLAYERS.CHAT_MAX_LENGTH) {
            socket.emit("kicked", { reason: 'Chat message too long.' });
            socket.disconnect();
            console.log('⚠️ Socket kicked for sending a long chat:', socket.id);
            return;
        }
        
        Players[socket.id].setMessage(data.message);
    });

    // listen for players that left, and remove them from the data/system
    socket.on("disconnect", () => {
        console.log("🔴 Socket disconnected:", socket.id);
        
        // tell clients to delete that player
        io.emit('delete', {
            type: 'player',
            id: socket.id
        });

        // delete that player on the serverside
        delete Players[socket.id];
    })
});

// -= MAIN LOOP -= \\
function update() {
    // update entry snapshots
    let players = [];
    
    // edit players and put them in the updates
    Object.values(Players).forEach(player => {
        if (!player) return;
        if (player.keys['w']) player.move('w');
        if (player.keys['a']) player.move('a');
        if (player.keys['s']) player.move('s');
        if (player.keys['d']) player.move('d');

        // clamp players inside of map bounds
        player.x = Math.max(0, Math.min(Constants.MAP.WIDTH, player.x));
        player.y = Math.max(0, Math.min(Constants.MAP.HEIGHT, player.y));

        if (!player.changed) return;
        player.changed = false;

        // make a copy of the player to send to the clients
        // speed, and keys attributes won't be shown.

        const clientPlayer = {
            id: player.id,
            x: player.x,
            y: player.y,
            chatMessage: player.chatMessage
        }
        players.push(clientPlayer);
    });

    // send out update packets
    io.emit('update', {
        players
    });
}
setInterval(update, 1000 / Constants.SERVER.TICK_RATE); // send updates at 20 TPS

httpServer.listen(3000);
