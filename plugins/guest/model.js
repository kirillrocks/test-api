const Mongoose = require('../../configs/db').Mongoose;

const Schema = Mongoose.Schema;

const guestSchema = new Schema({

    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    chats: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                ref: 'Chat',
                required: true,
            },
            domain: {
                type: String,
                ref: 'Chat',
                required: true,
            },
        },
    ],

});

exports.Guest = Mongoose.model('Guest', guestSchema);
