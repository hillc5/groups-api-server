var mongoAPI = require('../mongo-api');

var groupAPI = {

    createGroup: function createGroup(req, res) {
        var errors,
            group;

        console.log(req.body);

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
            })
        }
    }

};

module.exports = groupAPI;