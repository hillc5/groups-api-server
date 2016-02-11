var mongoAPI = require('../mongo-api');

var userAPI = {

    getUserById: function getUserById(req, res) {
        var search = req.params.id,
            errors;

        req.checkParams('id', 'Invalid format.  Id must be a Mongo ObjectId').isMongoId();
        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.getUserById(search).then(function(user) {
                res.status(200).send(user);
            }, function() {
                res.status(404).send({ errorMessage: 'No user for ' + req.params.id })
            });
        }
    },

    getUserByEmail: function getUserByEmail(req, res) {
        var search = { email: req.params.email },
            errors;

        req.checkParams('email', 'Invalid format.  Incorrect email format').isEmail();
        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.getUserByEmail(search).then(function(user) {
                res.status(200).send(user);
            }, function() {
                res.status(404).send({ errorMessage: 'No user for ' + req.params.email });
            });
        }
    },

    createUser:  function createUser(req, res) {
        var errors,
            user;

        req.checkBody({
            'name': {
                notEmpty: true,
                isAscii: {
                    errorMessage: 'Name must be valid ascii characters'
                }
            },

            'email': {
                notEmpty: true,
                isEmail: {
                    errorMessage: 'Invalid email format'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            user = {
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
    }
};

module.exports = userAPI;