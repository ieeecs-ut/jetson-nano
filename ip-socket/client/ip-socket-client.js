const os = require("os");
const axios = require("axios");
const { io } = require("socket.io-client");

const PROD = true;
const HOST = PROD ? "nano.anuv.me" : "localhost";
const PORT = PROD ? 80 : 3000;
const SECURE = false;
const AUTH = "password";

var extract_internal_ip = next => {
    var results = [];
    var ifaces = os.networkInterfaces();
    if (ifaces.hasOwnProperty('wlan0')) {
        for (var network of ifaces['wlan0']) {
            if (network.family === 'IPv4' && !network.internal) {
                results.push(network.address);
            }
        }
    }
    return next(results);
};

var extract_ngrok_domain = next => {
    axios
        .get('http://localhost:4040/api/tunnels')
        .then(res => {
            try {
                if (res.status == 200) {
                    console.log(res.data);
                    var domain = res.data['tunnels'][0]['public_url'];
                    next(domain);
                } else {
                    console.log(`statusCode: ${res.status}`);
                    console.log(res);
                }
            } catch (e) {
                console.log(e);
            }
        })
        .catch(error => {
            console.error(error);
        });
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
        extract_internal_ip(internal_ips => {
            socket.emit("ip_internal_res", auth, internal_ips.join(', '));
        });
    }
});

socket.on('ngrok_domain', (auth) => {
    if (auth == AUTH) {
        console.log("[ws] ngrok domain requested");
        extract_ngrok_domain(ngrok_domain => {
            socket.emit("ngrok_domain_res", auth, ngrok_domain);
        });
    }
});