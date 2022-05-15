const os = require("os");
const { io } = require("socket.io-client");

const PROD = true;
const HOST = PROD ? "nano.anuv.me" : "localhost";
const PORT = PROD ? 80 : 3000;
const SECURE = false;
const AUTH = "password";

var extract_internal_ip = _ => {
    var results = [];
    var ifaces = os.networkInterfaces();
    if (ifaces.hasOwnProperty('wlan0')) {
        for (var network of ifaces['wlan0']) {
            if (network.family === 'IPv4' && !network.internal) {
                results.push(network.address);
            }
        }
    }
    return results;
};

console.log(`ws${SECURE ? 's' : ''}://${HOST}:${PORT}/`);
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
        console.log("[ws] ip internal requested");
        var internal_ips = extract_internal_ip();
        socket.emit("ip_internal_res", auth, internal_ips.join(', '));
    }
});