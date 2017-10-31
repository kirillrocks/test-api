const Joi = require('joi');
const Crypto = require('crypto');

const Owner = require('./model').Owner;

// login {POST}
exports.login = {

    validate: { // validation
        payload: {
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        },
    },

    handler: function(request, reply) { // response

        Owner.authenticate()(request.payload.email, request.payload.password, (err, usr) => {

            if (err) {
                console.error(err);
                return reply(err);
            }

            // If the authentication failed owner will be false. If it's not false, we store the owner
            if (usr) {

                let token = Crypto.randomBytes(16).toString('hex');

                Owner.findById(usr._id, (err) => {

                    if (err) {
                        return reply({
                            'statusCode': 400,
                            'status': 'error',
                            'data': err,
                        }).code(400);
                    }

                    usr.set({token: token}).save();
                });

                return reply({
                    'statusCode': 200,
                    'status': 'success',
                    'data': {
                        'ownerId': usr._id,
                        'token': token,
                        'level': '',
                    },
                }).code(200);

            } else {

                return reply({
                    'statusCode': 404,
                    'status': 'error',
                    'data': 'Owner not found',
                }).code(404);

            }

        });
    },
};

// register {POST}
exports.register = {

    validate: {
        payload: {
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            domain: Joi.string().required(),
        },
    },

    handler: function(request, reply) {

        Owner.findOne({email: request.payload.email}, function(err, usr) {

            if (usr) {

                return reply({
                    'statusCode': 400,
                    'status': 'error',
                    'data': 'Email already taken',
                }).code(400);

            } else {

                let newOwner = new Owner({
                    email: request.payload.email,
                    domain: request.payload.domain,
                    level: 'owner',
                });

                Owner.register(newOwner, request.payload.password, function(err, usr, message) {

                    console.log(err);

                    if (err) {
                        return reply(err);
                    }

                    return reply({
                        'statusCode': 200,
                        'status': 'success',
                        'data': 'Owner registered',
                    }).code(200);
                });

            }

        });
    },
};

// logout {POST}
exports.logout = {

    validate: {
        payload: {
            token: Joi.string().required(),
        },
    },

    handler: function(request, reply) {

        Owner.findOne({'token': request.payload.token}, (err, usr) => {

            if (err) {

                return reply({
                    'statusCode': 400,
                    'status': 'error',
                    'data': err,
                }).code(400);

            }

            if (usr) {
                usr.set({token: ''}).save();

                return reply({
                    'statusCode': 200,
                    'status': 'success',
                    'data': 'Token has been removed',
                }).code(200);
            } else {

                return reply({
                    'statusCode': 400,
                    'status': 'error',
                    'data': 'Owner not found',
                }).code(400);
            }
        });
    },
};
