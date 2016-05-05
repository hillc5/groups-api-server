var express = require('express'),
    connectToMongo = require('./mongo-api/mongo-db-api').connect,
    config = require('./config/config'),
    log = require('./util/api-util').Logger,

    authAPI = require('./server-api/server-auth-api'),
    userAPI = require('./server-api/server-user-api'),
    groupAPI = require('./server-api/server-group-api'),

    CORS = require('cors'),
    bodyParser = require('body-parser'),
    validator = require('express-validator'),
    morgan = require('morgan'),

    app = express();

function startAPIServer() {
    log.info('Now Starting Server...');

    // body parser parses body and url params and places them on the req
    // object as simple attributes
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(morgan(config.logFormat));

    // validator puts validation and sanitization methods on the req object
    app.use(validator());

    // cors allows the handling of Cross-Origin-Resource-Sharing
    app.use(CORS(config.client));

    app.use(function(req, res, next) {
        var cluster = require('cluster');
        if(cluster.isWorker) {
            log.info('Worker %d received request', cluster.worker.id);
        }
        next();
    });

    // UNPROTECTED APIS
    app.post('/api/user', userAPI.createUser);
    app.post('/api/auth/validate/user', authAPI.validateUser);
    // TODO implement proper validateTokenMiddleWare method that is not middleware
    app.post('/api/auth/validate/token', authAPI.validateToken);

    // All routes underneath this middleware will need a token sent along with
    // the request.
    app.use(authAPI.validateTokenMiddleWare);

    // PROTECTED USER APIS
    app.get('/api/user/:id', userAPI.getUserById);

    // PROTECTED GROUP APIS
    app.get('/api/group/:id', groupAPI.getGroupById);
    app.post('/api/group', groupAPI.createGroup);
    app.put('/api/group/:group/user/:user', groupAPI.addUserToGroup);
    app.delete('/api/group/:group/user/:user', groupAPI.removeUserFromGroup);

    app.listen(config.port);
    log.info('Server Listening on ' + config.port + '...');
}

function start() {
    connectToMongo().then(startAPIServer, log.error);
}

if (require.main === module) {
    start();
} else {
    module.exports = start;
}