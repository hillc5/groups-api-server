var mongoAPI = require('../mongo-api'),
    groupService = require('../services/group-service');

var groupAPI = {

    createGroup: function(req, res) {
        var errors,
            body;

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
            body = req.body;
            groupService.createNewGroup(body.name, body.ownerId, body.public, body.tags)
            .then(function(result) {
                res.status(201).send(result);
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    },

    getGroupById: function(req, res) {
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
            groupService.getGroupById(req.params.id).then(function(group) {
                res.status(200).send(group);
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }

    },

    getGroupsByName: function(req, res) {
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

    addUserToGroup: function(req, res) {
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
            groupService.addUserToGroup(req.body.groupId, req.body.userId).then(function(result) {
                res.status(200).send(result);
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    },

    removeUserFromGroup: function(req, res) {
        var errors,
            updatedGroup,
            groupId;

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
            groupId = req.body.groupId;
            mongoAPI.getGroupById(groupId).then(function(result) {
                if (result.ownerId === req.body.userId) {
                    throw new Error('Cannot remove owner of the group');
                }
                return mongoAPI.removeUserFromGroup(groupId, req.body.userId);
            }).then(function(result) {
                updatedGroup = result;
                return mongoAPI.removeGroupFromUser(req.body.userId, groupId);
            }).then(function() {
                res.status(200).send(updatedGroup);
            }).catch(function(error) {
                if (error && error.message) {
                    error = {
                        errorMessage: error.message
                    };
                }
                res.status(404).send(error);
            });
        }

    }

};

module.exports = groupAPI;