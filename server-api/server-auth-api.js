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
            mongoAPI.validateUser(req.body.email, req.body.password).then(function(authToken) {
                res.status(200).send({ success: true, token: authToken });
            }).catch(function(error) {
                res.status(401).send(error);
            })
        }
    },

    validateToken: function validateToken(req, res, next) {
        var token = (req.body && req.body.access_token) ||
                    (req.query && req.query.access_token) ||
                     req.headers['x-access-token'],

            decoded = jwt.decode(token);

        if (!decoded) {
            res.status(401).send({errorMessage: 'No token associated with the request'});
        } else if(decoded.serverSignature !== auth_config.signature) {
            res.status(403).send({ errorMessage: 'Token Invalid.  Not associated with this issuer' });
        } else {
            mongoAPI.getUserSignature(decoded.id).then(function(result) {
                jwt.verify(token, result.signature, function(err, decoded) {
                    if (err) {
                        res.status(403).send({ errorMessage: err + ' Token invalid' });
                    } else {
                        req.decoded = decoded;
                        next();
                    }
                });
            }).catch(function(error) {
                res.status(403).send({ errorMessage: error + ' Token invalid' });
            });
        }

    }
};

module.exports = authAPI;