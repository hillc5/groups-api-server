var express = require('express'),
    connectToMongo = require('./mongo-api.js').connect,

    authAPI = require('./server-api/server-auth-api'),
    userAPI = require('./server-api/server-user-api'),
    groupAPI = require('./server-api/server-group-api'),

    CORS = require('cors'),
    bodyParser = require('body-parser'),
    validator = require('express-validator'),
    morgan = require('morgan'),

    app = express();

var PORT = process.env.PORT;
var DEV_CLIENT = { origin: 'http://localhost:' + PORT };

function startAPIServer() {
    console.log('Now Starting Server...');

    // body parser parses body and url params and places them on the req
    // object as simple attributes
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(morgan(process.env.LOG_FMT));

    // validator puts validation and sanitization methods on the req object
    app.use(validator());

    // cors allows the handling of Cross-Origin-Resource-Sharing
    app.use(CORS(DEV_CLIENT));

    app.use(function(req, res, next) {
        var cluster = require('cluster');
        if(cluster.isWorker) {
            console.log('Worker %d received request', cluster.worker.id);
        }
        next();
    });

    // AUTH APIS
    app.post('/api/create-user', userAPI.createUser);
    app.post('/api/auth/validate-user', authAPI.validateUser);

    // All routes underneath this middleware will need a token sent along with
    // the request.
    app.use(authAPI.validateToken);

    // USER APIS
    app.get('/api/get-user/id/:id', userAPI.getUserById);
    app.get('/api/get-user/email/:email', userAPI.getUserByEmail);

    // GROUP APIS
    app.get('/api/get-group/id/:id', groupAPI.getGroupById);
    app.get('/api/get-group/name/:name', groupAPI.getGroupsByName);
    app.post('/api/create-group', groupAPI.createGroup);
    app.put('/api/update-group/add-user', groupAPI.addUserToGroup);
    app.put('/api/update-group/remove-user', groupAPI.removeUserFromGroup);

    app.listen(PORT);
    console.log("Server Listening on " + PORT + '...');
}

function start() {
    connectToMongo().then(startAPIServer, console.error);
}

if (require.main === module) {
    start();
} else {
    module.exports = start;
}