const userController = require('./handler');

// API Server Endpoints
module.exports = [

    {method: 'POST', path: '/owner/login', config: userController.login},
    {method: 'POST', path: '/owner/register', config: userController.register},
    {method: 'POST', path: '/owner/logout', config: userController.logout},

];
