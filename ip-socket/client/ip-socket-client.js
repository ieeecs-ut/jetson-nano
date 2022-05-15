const { io } = require("socket.io-client");

const HOST = "localhost";
const PORT = 3000;
const SECURE = false;
const AUTH = "password";

const socket = io(`ws${SECURE ? 's' : ''}://${HOST}:${PORT}/`);

socket.on("connect", () => {
    console.log(socket.id);
    console.log(socket.connected);
    socket.emit("auth_nano", AUTH);
});

socket.on("disconnect", () => {
    console.log(socket.id);
    console.log(socket.connected);
});

socket.on('ip_internal', (auth) => {
    if (auth == AUTH) {
        socket.emit("ip_internal");
    }
});