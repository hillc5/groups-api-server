var mongoAPI = require('../mongo-api'),
    jwt = require('jsonwebtoken'),
    auth_config = require('../config/auth');

var userAPI = {

    getUserById: function getUserById(req, res) {
        var search,
            errors;

        req.sanitize('id').trim();

        req.checkParams({
            'id': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'id must be a valid Mongo ObjectId'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            search = req.params.id;
            mongoAPI.getUserById(search).then(function(user) {
                res.status(200).send(user);
            }, function() {
                res.status(404).send({ errorMessage: 'No user for ' + req.params.id })
            });
        }
    },

    getUserByEmail: function getUserByEmail(req, res) {
        var email,
            errors;

        req.sanitize('email').trim();

        req.checkParams({
            'email': {
                notEmpty: true,
                isEmail: {
                    errorMessage: 'email must be a valid email address'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            email = req.params.email.toLowerCase();
            mongoAPI.getUserByEmail(email).then(function(user) {
                res.status(200).send(user);
            }, function() {
                res.status(404).send({ errorMessage: 'No user for ' + req.params.email });
            });
        }
    },

    createUser:  function createUser(req, res) {
        var errors,
            user;

        req.sanitize('name').trim();
        req.sanitize('email').trim();

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
            },

            'password': {
                notEmpty: true
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.storeUserCredentials(req.body.email, req.body.password).then(function() {
                user = {
                    name: req.body.name,
                    email: req.body.email.toLowerCase(),
                    groups: [],
                    posts: [],
                    events: [],
                    creationDate: new Date()
                };
                mongoAPI.createNewUser(user).then(function(result) {
                    res.status(201).send({ user: result });
                }, function(error) {
                    res.status(400).send({ errorMessage: error });
                });
            }).catch(function(error) {
                res.status(400).send({ errorMessage: error });
            })
        }
    },
    validateUser: function validateUser(req, res) {
        var errors;

        req.checkBody({
            'email': {
                notEmpty: true,
                isEmail: {
                    errorMessage: 'Invalid email format'
                }
            },

            'password': {
                notEmpty: true
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.validateUser(req.body.email, req.body.password).then(function(result) {
                var token = jwt.sign(result, auth_config.signature, { expiresInMinutes: auth_config.tokenExpires });
                res.status(200).send({ success: true, token: token });
            }).catch(function(error) {
                res.status(401).send(error);
            })
        }
    }
};

module.exports = userAPI;