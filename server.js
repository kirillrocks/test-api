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
server.register(require('./plugins/socket.io'), function(err) {

    if (err) {
        throw err;
    }
});

// routes
server.route(ownersRoutes);

// dev routes
server.route({
    method: 'GET',
    path: '/guest.html',
    handler: {
        file: 'guest.html'
    }
});

server.route({
	method: 'GET',
	path: '/owner.html',
	handler: {
		file: 'owner.html'
	}
});

// server start
server.start(function(err) {

    if (err) {
        console.error(err);
        throw err;
    }

    console.log('Server started');
});

exports.server = server;