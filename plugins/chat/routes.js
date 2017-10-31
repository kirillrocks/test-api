const userController = require('./handler');

// API Server Endpoints
module.exports = [

    {method: 'POST', path: '/login', config: userController.login},
    {method: 'POST', path: '/register', config: userController.register},
    {method: 'POST', path: '/logout', config: userController.logout},

];
