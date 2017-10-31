const Crypto = require('crypto');

const Chat = require('./model').Chat;
const Owner = require('../owner/model').Owner;
const Guest = require('../guest/model').Guest;

exports.newChat = function(data, callback) {

    // find domain owner
    Owner.findOne({
        domain: data.domain,
        level: 'owner',
    }, function(err, owner) {

        if (owner) {

            Guest.findOne({
                email: data.email,
            }, function(err, guestExist) {
                if (err) {
                    throw(err);
                }

                // if guest not found than create guest
                if (!guestExist) {

                    let guestToken = Crypto.randomBytes(16).toString('hex');

                    Guest.create({
                        email: data.email,
                        name: data.name,
                        token: guestToken,
                    }, function(err, guest) {

                        if (err) {
                            throw (err);
                        }

                        // create chat for new guest
                        Chat.create({
                            owner: owner._id,
                            guest: guest._id,
                            domain: owner.domain,
                            status: 'unreadable',
                        }, function(err, chat) {

                            if (err) {
                                throw (err);
                            }

                            // add created chat tot guest
                            Guest.findByIdAndUpdate(
                                guest._id,
                                {
                                    $push: {'chats': {_id: chat, domain: data.domain}},
                                    token: guestToken
                                },
                                {safe: true, upsert: true, new: true}
                            ).exec();

                            // if owner do not have this chat
                            Owner.findOne({
                                _id: owner._id,
                                chats: chat,
                            }, function(err, ownerChecked) {
                                if (!ownerChecked) {
                                    Owner.findByIdAndUpdate(
                                        owner._id,
                                        {$push: {'chats': chat}},
                                        {safe: true, upsert: true, new: true}
                                    ).exec();
                                }
                            });

                            callback({
                                guestToken: guestToken,
                                chatId: chat._id,
                                guestId: guest._id,
                            });

                        });

                    });
                } else {

                    // get exist chat for exist guest
                    Chat.findOne({
                        owner: owner._id,
                        guest: guestExist._id,
                        domain: owner.domain,
                    }, function(err, chat) {

                        if (err) {
                            throw (err);
                        }

                        if (chat) {

                            let guestToken = Crypto.randomBytes(16).toString('hex');

                            // if guest do not have this chat
                            Guest.findOne({
                                _id: guestExist._id,
                                chats: chat,
                            }, function(err, guestExistChecked) {
                                if (!guestExistChecked) {
                                    Guest.findByIdAndUpdate(
                                        guestExist._id,
                                        {
                                            $push: {'chats': {_id: chat, domain: data.domain}},
                                            token: guestToken
                                        },
                                        {safe: true, upsert: true, new: true}
                                    ).exec();
                                }
                            });

                            // if owner do not have this chat
                            Owner.findOne({
                                _id: owner._id,
                                chats: chat,
                            }, function(err, ownerChecked) {
                                if (!ownerChecked) {
                                    Owner.findByIdAndUpdate(
                                        owner._id,
                                        {$push: {'chats': chat}},
                                        {safe: true, upsert: true, new: true}
                                    ).exec();
                                }
                            });

                            callback({
                                guestToken: guestToken,
                                chatId: chat._id,
                                guestId: guestExist._id,
                            });

                        } else {

                            let guestToken = Crypto.randomBytes(16).toString('hex');

                            // create chat for exist guest
                            Chat.create({
                                owner: owner._id,
                                guest: guestExist._id,
                                domain: owner.domain,
                                status: 'unreadable',
                            }, function(err, chat) {

                                if (err) {
                                    throw (err);
                                }

                                // if guest do not have this chat
                                Guest.findOne({
                                    _id: guestExist._id,
                                    chats: chat,
                                }, function(err, guestExistChecked) {
                                    if (!guestExistChecked) {
                                        Guest.findByIdAndUpdate(
                                            guestExist._id,
                                            {
                                                $push: {'chats': {_id: chat, domain: data.domain}},
                                                token: guestToken
                                            },
                                            {safe: true, upsert: true, new: true}
                                        ).exec();
                                    }
                                });

                                // if owner do not have this chat
                                Owner.findOne({
                                    _id: owner._id,
                                    chats: chat,
                                }, function(err, ownerChecked) {
                                    if (!ownerChecked) {
                                        Owner.findByIdAndUpdate(
                                            owner._id,
                                            {$push: {'chats': chat}},
                                            {safe: true, upsert: true, new: true}
                                        ).exec();
                                    }
                                });

                                callback({
                                    guestToken: guestToken,
                                    chatId: chat._id,
                                    guestId: guestExist._id,
                                });

                            });

                        }

                    });
                }
            });

        } else {
            callback({
                'statusCode': 400,
                'status': 'error',
                'data': 'Owner for this domain not found',
            });
        }
    });
};

// add new message
exports.newMessage = function(data, callback) {

    Owner.findOne({
        'token': data.token,
        'chats._id': data.chatId,
    }).exec().then(function(owner) {

        return Guest.findOne({
            'token': data.token,
            'chats._id': data.chatId,
        }).exec().then(function(guest) {

            return {owner: owner, guest: guest};
        }).then(function(result) {

            Chat.update({_id: data.chatId},
                {
                    $push: {
                        'messages': {
                            from: result.owner ? result.owner._id : result.guest._id,
                            message: data.message,
                        },
                    },
                }).exec().then(function() {

                // set chat is active when owner reply
                if (result.owner) {
                    Chat.findById(data.chatId, function(err, chat) {
                        chat.set({status: 'active'}).save();
                    });
                }

                callback({
                    'statusCode': 200,
                    'status': 'success',
                    'data': 'Message added',
                });
            });
        });
    });
};

exports.getWaitingChats = function(data, callback) {

	Owner.findOne({
		token: data.token,
	}).populate({
		path: 'chats',
		match: { status: 'unreadable'},
		select: '_id',
	}).exec(function(err, owner) {

		callback({
			'statusCode': 200,
			'status': 'success',
			'data': owner.chats,
		});
	});
};

exports.getActiveChats = function(data, callback) {

    Owner.findOne({
        token: data.token,
    }).populate({
        path: 'chats',
        match: { status: 'active'},
        select: '_id',
    }).exec(function(err, owner) {

        callback({
            'statusCode': 200,
            'status': 'success',
            'data': owner.chats,
          });
    });
};

// get chat messages by chatId
exports.getChatMessages = function(data, callback) {

    Owner.findOne({
        token: data.token,
    }).exec().then(function(owner) {

        return Guest.findOne({
            token: data.token,
        }).exec().then(function(guest) {
            return {owner: owner, guest: guest};
        }).then(function(result) {

            Chat.findOne({
                _id: data.chatId,
                $or: [{owner: result.owner ? result.owner._id : null}, {guest: result.guest ? result.guest._id : null}],
            }, {messages: {$slice: [data.skip, data.limit]}}).exec().then(function(chat) {

                callback({
                    'statusCode': 200,
                    'status': 'success',
                    'data': chat.messages,
                });
            });
        });
    });
};