const Crypto = require('crypto');

const Chat = require('./model').Chat;
const Owner = require('../owner/model').Owner;
const Guest = require('../guest/model').Guest;

exports.newChat = function(data, callback) {

	// // find owner for domain
	// Owner.findOne({
	// 	domain: data.domain,
	// 	level: 'owner',
	// }).exec().then(function(owner) {
	//
	// 	if (owner) {
	//
	// 		return Guest.findOne({
	// 			email: data.email,
	// 		}).exec().then(function(guest) {
	//
	// 			return Chat.findOne({
	// 				owner: owner._id,
	// 				guest: guest._id,
	// 				domain: data.domain,
	// 			}).exec().then(function(chat) {
	//
	// 				if (!chat) {
	//
	// 					// create new chat
	// 					Chat.create({
	// 						owner: owner._id,
	// 						guest: guest._id,
	// 						domain: data.domain,
	// 						status: 'unreadable',
	// 					}).exec().then(function(chat) {
	//
	// 						let guestToken = Crypto.randomBytes(16).toString('hex');
	//
	// 						// if guest not exist, create it
	// 						if (!guest) {
	//
	// 							Guest.create({
	// 								email: data.email,
	// 								name: data.name,
	// 								token: guestToken,
	// 							}).exec().then(function(guest) {
	//
	// 								Guest.findByIdAndUpdate(
	// 									guest._id,
	// 									{
	// 										$push: {'chats': {_id: chat, domain: data.domain}},
	// 									},
	// 									{safe: true, upsert: true, new: true}
	// 								);
	//
	// 								Owner.findByIdAndUpdate(
	// 									owner._id,
	// 									{$push: {'chats': chat}},
	// 									{safe: true, upsert: true, new: true}
	// 								);
	//
	// 								callback({
	// 									guestToken: guestToken,
	// 									chatId: chat._id,
	// 									guestId: guest._id,
	// 								});
	// 							});
	// 						} else {
	//
	// 							// add created chat to guest
	// 							Guest.findByIdAndUpdate(
	// 								guest._id,
	// 								{
	// 									$push: {'chats': {_id: chat, domain: data.domain}},
	// 									token: guestToken
	// 								},
	// 								{safe: true, upsert: true, new: true}
	// 							);
	//
	// 							// add created chat to owner
	// 							Owner.findByIdAndUpdate(
	// 								owner._id,
	// 								{$push: {'chats': chat}},
	// 								{safe: true, upsert: true, new: true}
	// 							);
	//
	// 							callback({
	// 								guestToken: guestToken,
	// 								chatId: chat._id,
	// 								guestId: guest._id,
	// 							});
	// 						}
	// 					});
	// 				} else {
	//
	// 					// return exist chat and guest token
	// 					let guestToken = Crypto.randomBytes(16).toString('hex');
	//
	// 					guest.set({token: guestToken}).save();
	//
	// 					callback({
	// 						guestToken: guestToken,
	// 						chatId: chat._id,
	// 						guestId: guest._id,
	// 					});
	// 				}
	// 			});
	// 		});
	// 	}
	// });

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

    // try find owner
    Owner.findOne({
        token: data.token,
        chats: data.chatId,
    }).exec().then(function(owner) {

	    // try find guest
        return Guest.findOne({
            token: data.token,
            'chats._id': data.chatId,
        }).exec().then(function(guest) {

            // add message to chat by guest or chat owner
	        Chat.update({_id: data.chatId},
		        {
			        $push: {
				        'messages': {
					        from: owner ? owner._id : guest._id,
					        message: data.message,
				        },
			        },
		        }).exec().then(function() {

		        // set chat is active when owner reply
		        if (owner) {
			        Chat.findById(data.chatId, function(err, chat) {
				        chat.set({status: 'active'}).save();
			        });
		        }

		        callback({
			        'statusCode': 200,
			        'status': 'success',
			        'data': {
				        message: data.message,
				        from: owner ? owner._id : guest._id
		            },
		        });
	        });
        });
    });
};

exports.getWaitingChats = function(data, callback) {

    // find chats with unreadable status
	Owner.findOne({
		token: data.token,
	}).populate({
		path: 'chats',
		match: { status: 'unreadable'},
		select: '_id',
	}).exec().then(function(err, owner) {

		callback({
			'statusCode': 200,
			'status': 'success',
			'data': owner.chats,
		});
	});
};

exports.getActiveChats = function(data, callback) {

	// find chats with active status
    Owner.findOne({
        token: data.token,
    }).populate({
        path: 'chats',
        match: { status: 'active'},
        select: '_id',
    }).exec().then(function(err, owner) {

        callback({
            'statusCode': 200,
            'status': 'success',
            'data': owner.chats,
          });
    });
};

// get chat messages by chatId
exports.getChatMessages = function(data, callback) {

    // try find owner
    Owner.findOne({
        token: data.token,
    }).exec().then(function(owner) {

	    // try find guest
        return Guest.findOne({
            token: data.token,
        }).exec().then(function(guest) {

	        // get chat messages by id for guest or owner
	        Chat.findOne({
		        _id: data.chatId,
		        $or: [{owner: owner ? owner._id : null}, {guest: guest ? guest._id : null}],
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