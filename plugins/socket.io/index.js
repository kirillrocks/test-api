const Handlers = require('./handler');

exports.register = function(server, options, next) {

    const io = require('socket.io')(server.select('chat').listener);

    io.on('connection', function(socket) {

        socket.on('checkConnection', Handlers.checkConnection);
        socket.on('getNewChat', Handlers.getNewChat);
        socket.on('getWaitingChats', Handlers.getWaitingChats);
        socket.on('getActiveChats', Handlers.getActiveChats);
        socket.on('getChatMessages', Handlers.getChatMessages);
        socket.on('newMessage', Handlers.newMessage);
    });

    next();
};

exports.register.attributes = {
    name: 'chat',
};