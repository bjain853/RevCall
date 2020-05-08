const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const p2p = require('socket.io-p2p-server').Server;

const expressApp = express();

expressApp.get('/', (req, res) => {
    //connect react app;
})

const server = http.Server(expressApp);

server.listen(3000);

const io = socketIo(server);

io.use(p2p);

io.on('connection', (socket) => {
    clients[socket.id]=socket;// store client's socket in an array
    p2p(socket,null);
    //send local video and receive remote video stream
});
