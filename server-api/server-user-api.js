var mongoAPI = require('../mongo-api');

var userApi = {

    getUserById: function getUserById(req, res) {
        var search = req.params.id;
        mongoAPI.getUserById(search).then(function(user) {
            res.status(200).send(user);
        }, function() {
            res.status(404).send({ errorMessage: 'No user for ' + req.params.id })
        });
    },

    getUserByEmail: function getUserByEmail(req, res) {
        var search = { email: req.params.email };
        mongoAPI.getUserByEmail(search).then(function(user) {
            res.status(200).send(user);
        }, function() {
            res.status(404).send({ errorMessage: 'No user for ' + req.params.email });
        });
    },

    createUser:  function createUser(req, res) {
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
    }
};

module.exports = userApi;