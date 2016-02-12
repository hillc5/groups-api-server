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
                res.status(201).send({ success: 'SUCCESS', group: result.ops[0]});
            }, function(error) {
                console.log(error);
                res.status(400).send({ errorMessage: error });
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
    }

};

module.exports = groupAPI;