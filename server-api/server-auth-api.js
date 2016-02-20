var mongoAPI = require('../mongo-api'),
    jwt = require('jsonwebtoken'),
    auth_config = require('../config/auth');

var authAPI = {

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

module.exports = authAPI;