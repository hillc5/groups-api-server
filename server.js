var express = require('express');
var connectToMongo = require('./mongo-api.js').connect;
var userAPI = require('./server-api/server-user-api');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 9000;
var DEV_CLIENT = { origin: 'http://localhost:8080' };

function startAPIServer() {
    console.log('Now Starting Server...');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cors(DEV_CLIENT));

    app.get('/api/get-user/id/:id', userAPI.getUserById);
    app.get('/api/get-user/email/:email', userAPI.getUserByEmail);
    app.post('/api/create-user', userAPI.createUser);

    app.listen(PORT);
    console.log("Server Listening on " + PORT + '...');
}

connectToMongo().then(startAPIServer, console.err);
