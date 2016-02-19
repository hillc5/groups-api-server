var mongoAPI = require('../mongo-api');

var groupAPI = {

    createGroup: function createGroup(req, res) {
        var errors,
            group;

        req.sanitize('name').trim();
        req.sanitize('ownerId').trim();

        req.checkBody({
            'name': {
                notEmpty: true
            },
            'ownerId': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'Id must be a Mongo ObjectId'
                }
            },
            'public': {
                notEmpty: true,
                isBoolean: {
                    errorMessage: 'public must be a valid boolean value'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            group = {
                name: req.body.name,
                public: req.body.public,
                ownerId: req.body.ownerId,
                users: [],
                events: [],
                creationDate: new Date()
            };

            mongoAPI.createNewGroup(group).then(function(result) {
                res.status(201).send({ group: result});
            }, function(error) {
                res.status(400).send({ errorMessage: error });
            });
        }
    },

    getGroupById: function getGroupById(req, res) {
        var errors;

        req.sanitize('id').trim();

        req.checkParams({
            'id': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'Id must be a Mongo ObjectId'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.getGroupById(req.params.id).then(function(group) {
                res.status(200).send(group);
            }).catch(function(error) {
                res.status(404).send(error);
            });
        }

    },

    getGroupsByName: function getGroupsByName(req, res) {
        var name,
            errors;

        req.sanitize('name').trim();

        req.checkParams({
            'name': {
                notEmpty: true
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            name = req.params.name;

            mongoAPI.getGroupsByName(name).then(function(response) {
                res.status(200).send(response);
            }, function() {
                res.status(404).send( { errorMessage: 'No groups with the name ' + req.params.name });
            });
        }
    },

    addUserToGroup: function addUserToGroup(req, res) {
        var user,
            requestUser,
            errors;

        req.sanitize('id').trim();
        req.sanitize('user.name').trim();
        req.sanitize('user._id').trim();
        req.sanitize('user.email').trim();

        req.checkBody({
            'id': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'id must be a valid Mongo ObjectId'
                }
            },

            'user': {
                notEmpty: true
            },

            'user.name': {
                notEmpty: true
            },

            'user._id': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'user._id must be a valid Mongo ObjectId'
                }
            },

            'user.email': {
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
            requestUser = req.body.user;
            user = mongoAPI.createUserSnapshot(requestUser);
            mongoAPI.addUserToGroup(req.body.id, user).then(function(result) {
                res.status(200).send(result);
            }).catch(function(error) {
                res.status(404).send(error);
            });
        }
    }

};

module.exports = groupAPI;