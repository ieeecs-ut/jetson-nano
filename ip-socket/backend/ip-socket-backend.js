const Http = require('http');
const Express = require('express');
const { Server } = require("socket.io");

const PROD = true;
const PORT = PROD ? (process.env.PORT != undefined && process.env.PORT != null ? process.env.PORT : 3040) : 3000;

const CLIENT_LIM = 5;
const NGROK_DOMAIN_AUTH_REQ = false;
const AUTH = PROD ? (process.env.AUTH_PWD != undefined && process.env.AUTH_PWD != null ? process.env.AUTH_PWD : "password") : "password";

var web = Express();
var http = Http.createServer(web);
var ws = new Server(http);

var clients = [];
var nano_client_id = "";
var create_client = (id, add = true) => {
    var client_obj = {
        id: id
    };
    if (add) clients[id] = client_obj;
    return client_obj;
};
var remove_client = (id) => {
    if (clients.hasOwnProperty(id))
        delete clients[id];
};

web.post('/', (req, res) => {
    res.send('ieeecs-nano-1 gateway');
});

web.get('/', (req, res) => {
    res.sendFile(`${__dirname}/frontend/index.html`);
});

ws.on('connection', (socket) => {
    console.log(`[ws] a user connected: ${socket.id}`);
    if (Object.keys(clients).length >= CLIENT_LIM) {
        console.log(`[ws] client limit ${CLIENT_LIM} reached – rejecting user: ${socket.id}`);
        socket.disconnect();
        console.log(clients);
    } else {
        create_client(socket.id);
        console.log(clients);
        socket.on('disconnect', () => {
            console.log(`[ws] user disconnected: ${socket.id}`);
            remove_client(socket.id);
            console.log(clients);
            if (nano_client_id == socket.id)
                nano_client_id = "";
        });
        socket.on('auth_nano', (auth) => {
            if (auth == AUTH) {
                nano_client_id = socket.id;
                console.log(`[ws] nano identified: ${nano_client_id}`);
            }
        });
        socket.on('ip_internal', (auth) => {
            if (auth == AUTH) {
                console.log("[ws] ip internal requested");
                if (nano_client_id != "") {
                    if (clients.hasOwnProperty(nano_client_id)) {
                        ws.to(nano_client_id).emit('ip_internal', AUTH);
                    } else nano_client_id = "";
                }
            }
        });
        socket.on('ip_internal_res', (auth, ips) => {
            if (auth == AUTH) {
                console.log("[ws] ip internal returned");
                for (var c_id in clients) {
                    if (c_id != nano_client_id && clients.hasOwnProperty(c_id)) {
                        ws.to(c_id).emit('ip_internal', ips);
                    }
                }
            }
        });
        socket.on('ngrok_domain', (auth) => {
            if (!NGROK_DOMAIN_AUTH_REQ || auth == AUTH) {
                console.log("[ws] ngrok domain requested");
                if (nano_client_id != "") {
                    if (clients.hasOwnProperty(nano_client_id)) {
                        ws.to(nano_client_id).emit('ngrok_domain', AUTH);
                    } else nano_client_id = "";
                }
            }
        });
        socket.on('ngrok_domain_res', (auth, ngd) => {
            if (auth == AUTH) {
                console.log("[ws] ngrok domain returned");
                for (var c_id in clients) {
                    if (c_id != nano_client_id && clients.hasOwnProperty(c_id)) {
                        ws.to(c_id).emit('ngrok_domain', ngd);
                    }
                }
            }
        });
    }
});

http.listen(PORT, () => {
    console.log(`[web] listening on port ${PORT}`);
});


// unused
var web_return_data = (req, res, data) => {
    res.status(200);
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
    return null;
};
var web_return_error = (req, res, code, msg) => {
    res.status(code);
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify({
        status: code,
        message: msg
    }, null, 2));
};