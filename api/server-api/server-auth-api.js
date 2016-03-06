var authService = require('../services/auth-service');

var authAPI = {

    validateUser: function(req, res) {
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
            authService.validateUser(req.body.email, req.body.password).then(function(authToken) {
                res.status(200).send({ success: true, token: authToken });
            }).catch(function(error) {
                res.status(error.status).send({ errorMessage: error.errorMessage });
            });
        }
    },

    validateToken: function(req, res, next) {
        var token = (req.body && req.body.access_token) ||
                    (req.query && req.query.access_token) ||
                     req.headers['x-access-token'];


        authService.validateToken(token).then(function(result) {
            req.decoded = result;
            next();
        }).catch(function(error) {
            res.status(error.status).send({ errorMessage: error.errorMessage });
        });
    }
};

module.exports = authAPI;