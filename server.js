var express = require('express');
var mongoAPI = require('./mongo-api/mongo-api.js');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 8080;
var DEV_CLIENT = { origin: 'http://localhost:63342' };

function startAPIServer() {
    console.log('Now Starting Server...');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cors(DEV_CLIENT));

    app.get('/api/get-user/id/:id', function(req, res) {
        var search = req.params.id;
        mongoAPI.getUserById(search).then(function(user) {
            res.status(200).send(user);
        }, function() {
            res.status(404).send({ errorMessage: 'No user for ' + req.params.id })
        })
    });

    app.get('/api/get-user/email/:email', function(req, res) {
        var search = { email: req.params.email };
        mongoAPI.getUserByEmail(search).then(function(user) {
            res.status(200).send(user);
        }, function() {
            res.status(404).send({ errorMessage: 'No user for ' + req.params.email });
        });
    });

    app.post('/api/create-user', function(req, res) {
        var user = {
                name: req.body.name,
                email: req.body.email,
                groups: [],
                posts: [],
                events: []
            };
        mongoAPI.createNewUser(user).then(function(result) {
            res.status(201).send({ success: 'SUCCESS', user: result.ops[0] });
        }, function(error) {
            console.log(error);
            res.status(400).send({ errorMessage: error });
        });
    });


    app.listen(PORT);
    console.log("Server Listening on " + PORT + '...');
}

mongoAPI.connect().then(startAPIServer, console.err);