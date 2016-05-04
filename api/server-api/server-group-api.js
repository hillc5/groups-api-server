var groupService = require('../services/group-service');

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

    addUserToGroup: function(req, res) {
        var errors;

        req.sanitize('group').trim();
        req.sanitize('userId').trim();

        req.checkParams({
            'group': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'group id must be a valid Mongo ObjectId'
                }
            },

            'user': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'user id must be a valid Mongo ObjectId'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            groupService.addUserToGroup(req.params.group, req.params.id).then(function(result) {
                res.status(200).send(result);
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    },

    removeUserFromGroup: function(req, res) {
        var errors;

        req.sanitize('groupId').trim();
        req.sanitize('userId').trim();

        req.checkParams({
            'group': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'group Id must be a valid Mongo ObjectId'
                }
            },

            'user': {
                notEmpty: true,
                isMongoId: {
                    errorMessage: 'user Id must be a valid Mongo ObjectId'
                }
            }
        });

        errors = req.validationErrors();

        if (errors) {
            res.status(400).send(errors);
        } else {
            groupService.removeUserFromGroup(req.params.group, req.params.user).then(function(updatedGroup) {
                res.status(200).send(updatedGroup);
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }

    }

};

module.exports = groupAPI;