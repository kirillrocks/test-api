const Mongoose = require('../../configs/db').Mongoose;

const Schema = Mongoose.Schema;

const chatSchema = new Schema({

    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'Guest',
        required: true,
    },
    status: {
        type: String,
    },
    messages: [
        {
            from: {
                type: Schema.Types.ObjectId,
            },
            message: {
                type: String,
            },
        },
    ],

});

exports.Chat = Mongoose.model('Chat', chatSchema);
