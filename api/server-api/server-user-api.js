var userService = require('../services/user-service');

var userAPI = {

    createUser:  function(req, res) {
        var errors;

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
            userService.createNewUser(req.body.name, req.body.email, req.body.password)
            .then(function(result) {
                res.status(201).send(result);
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    },

    getUserById: function(req, res) {
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
            userService.getUserById(search).then(function(user) {
                res.status(200).send(user);
            }, function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    },

    getUserByEmail: function(req, res) {
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
            userService.getUserByEmail(email).then(function(user) {
                res.status(200).send(user);
            }, function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    }

};

module.exports = userAPI;