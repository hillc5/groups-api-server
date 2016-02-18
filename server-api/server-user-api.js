var mongoAPI = require('../mongo-api');

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
    },

    addGroupToUser: function addGroupToUser(req, res) {
        var errors,
            group,
            requestGroup;

        req.sanitize('id').trim();
        req.sanitize('group._id').trim();
        req.sanitize('group.name').trim();
        req.sanitize('group.ownerId').trim();

        req.checkBody({
            'id': {
                notEmpty: true
            },

            'group': {
                notEmpty: true
            },

            'group._id': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'Group Id must be a Mongo ObjectId'
                }
            },

            'group.ownerId': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'Owner Id must be a Mongo ObjectId'
                }
            },

            'group.public': {
                notEmpty: true,
                isBoolean: {
                    errorMessage: 'public must be a valid boolean value'
                }
            },

            'group.name': {
                notEmpty: true
            }
        });

        errors = req.validationErrors();

        if(errors) {
            res.status(400).send(errors);
        } else {
            requestGroup = req.body.group;
            group = mongoAPI.createGroupSnapshot(requestGroup);
            mongoAPI.addGroupToUser(req.body.id, group).then(function(result) {
                res.status(200).send(result);
            }).catch(function(error) {
                res.status(404).send(error);
            });
        }
    }
};

module.exports = userAPI;