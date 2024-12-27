const express = require('express');
const http = require('http');
const WebSocket = require('ws');
console.log("This is Server");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'join':
                const room = rooms.get(data.room) || new Set();
                room.add(ws);
                rooms.set(data.room, room);
                break;
                
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                const targetRoom = rooms.get(data.room);
                if (targetRoom) {
                    targetRoom.forEach(client => {
                        if (client !== ws) {
                            client.send(JSON.stringify(data));
                        }
                    });
                }
                break;
        }
    });
});

server.listen(8000, () => {
    console.log('Server running on port 8000');
});
