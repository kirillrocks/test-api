const Hapi = require('hapi');
const Inert = require('inert');

const config = require('./configs/server');
const ownersRoutes = require('./plugins/owner/routes');

const server = new Hapi.Server();
server.register(Inert);

// api server
server.connection({

    port: config.server.apiPort,
    labels: ['api'],
});

// socket.io server
server.connection({

    port: config.server.chatPort,
    labels: ['chat'],
});

// register socket.io
server.register(require('./plugins/socket.io'), (err) => {

    if (err) {
        throw err;
    }
});

// routes
server.route(ownersRoutes);

// dev route
server.route({
    method: 'GET',
    path: '/guest.html',
    handler: {
        file: 'guest.html'
    }
});

// server start
server.start((err) => {

    if (err) {
        console.error(err);
        throw err;
    }

    console.log('Server started');
});