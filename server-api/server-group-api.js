var mongoAPI = require('../mongo-api'),
    apiUtil = require('../util/api-util');

var groupAPI = {

    createGroup: function createGroup(req, res) {
        var errors,
            group,
            tags;

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
            tags = apiUtil.parseListString(req.body.tags);
            group = {
                name: req.body.name,
                public: req.body.public,
                ownerId: req.body.ownerId,
                users: [],
                events: [],
                tags: tags || [],
                posts: [],
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
        var errors;

        req.sanitize('groupId').trim();
        req.sanitize('userId').trim();

        req.checkBody({
            'groupId': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'id must be a valid Mongo ObjectId'
                }
            },

            'userId': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'user._id must be a valid Mongo ObjectId'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.getUserById(req.body.userId).then(function(user) {
                var userSnapshot = apiUtil.createUserSnapshot(user);
                return mongoAPI.addUserToGroup(req.body.groupId, userSnapshot);
            }).then(function(result) {
                res.status(200).send(result);
            }).catch(function(error) {
                res.status(404).send(error);
            });
        }
    },

    removeUserFromGroup: function removeUserFromGroup(req, res) {
        var errors;

        req.sanitize('groupId').trim();
        req.sanitize('userId').trim();

        req.checkBody({
            'groupId': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'groupId must be a valid Mongo ObjectId'
                }
            },

            'userId': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'groupId must be a valid Mongo ObjectId'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            mongoAPI.removeUserFromGroup(req.body.groupId, req.body.userId).then(function(result) {
                res.status(201).send(result);
            }).catch(function(error) {
                res.status(404).send(error);
            });
        }

    }

};

module.exports = groupAPI;