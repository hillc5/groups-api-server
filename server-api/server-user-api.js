var mongoAPI = require('../mongo-api');

var userAPI = {

    getUserById: function getUserById(req, res) {
        var search,
            errors;

        req.sanitize('id').trim();

        req.checkParams('id', 'Invalid format.  Id must be a Mongo ObjectId').isMongoId();
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

        req.checkParams('email', 'Invalid format.  Incorrect email format').isEmail();
        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            email = req.params.email.toLowerCase();
            console.log(email);
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
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            user = {
                name: req.body.name,
                email: req.body.email.toLowerCase(),
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