const PassportLocalMongoose = require('passport-local-mongoose');
const Mongoose = require('../../configs/db').Mongoose;

const Schema = Mongoose.Schema;

const ownerSchema = new Schema({

    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    level: {
        type: String,
    },
    domain: {
        type: String,
        required: true,
    },
    chats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
        },
    ],
    data: [],

});

ownerSchema.plugin(PassportLocalMongoose, {

    usernameField: 'email',
    hashField: 'password',
    usernameLowerCase: true,

});

exports.Owner = Mongoose.model('Owner', ownerSchema);
