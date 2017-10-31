const ChatHandler = require('../chat/handler');

// check connection status
exports.checkConnection = function() {

    this.emit('checkConnection', 'connected');
};

// create new chat from guest
exports.getNewChat = function(data) {
    const self = this;

    ChatHandler.newChat(data, function(returnedData) {
        self.emit('getNewChat', returnedData);
    });
};

// get unreadable chats
exports.getWaitingChats = function(data) {

    const self = this;

    ChatHandler.getWaitingChats(data, function(returnedData) {
        self.emit('getWaitingChats', returnedData);
    });
};

// get active chats
exports.getActiveChats = function(data) {

    const self = this;

    ChatHandler.getActiveChats(data, function(returnedData) {
        self.emit('getActiveChats', returnedData);
    });
};

// get chat messages
exports.getChatMessages = function(data) {

    const self = this;

    ChatHandler.getChatMessages(data, function(returnedData) {
        self.emit('getChatMessages', returnedData);
    });
};

// post new message
exports.newMessage = function(data) {

    const self = this;

    ChatHandler.newMessage(data, function(returnedData) {
        self.emit('newMessage', returnedData);
    });
};

