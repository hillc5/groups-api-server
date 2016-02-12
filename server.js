var express = require('express'),
    connectToMongo = require('./mongo-api.js').connect,
    userAPI = require('./server-api/server-user-api'),
    groupAPI = require('./server-api/server-group-api'),
    CORS = require('cors'),
    bodyParser = require('body-parser'),
    validator = require('express-validator'),
    app = express();

var PORT = process.env.PORT || 8080;
var DEV_CLIENT = { origin: 'http://localhost:' + PORT };

function startAPIServer() {
    console.log('Now Starting Server...');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(validator());
    app.use(CORS(DEV_CLIENT));

    // USER APIS
    app.get('/api/get-user/id/:id', userAPI.getUserById);
    app.get('/api/get-user/email/:email', userAPI.getUserByEmail);
    app.post('/api/create-user', userAPI.createUser);

    // GROUP APIS
    app.get('/api/get-group/name/:name', groupAPI.getGroupsByName);
    app.post('/api/create-group', groupAPI.createGroup);

    app.listen(PORT);
    console.log("Server Listening on " + PORT + '...');
}

connectToMongo().then(startAPIServer, console.err);
