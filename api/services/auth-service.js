var mongoAuthAPI = require('../mongo-api/mongo-auth-api'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    uuid = require('node-uuid'),
    Promise = require('es6-promise').Promise,
    config = require('../config/config'),
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger;

function encrypt(phrase) {

    var promise = new Promise(function(resolve, reject) {
        bcrypt.genSalt(config.saltFactor, function(err, salt) {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(phrase, salt, function(err, hash) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });

    return promise;
}

function getJWTToken(id, secret) {
    var tokenHeader = {
            id: id,
            serverSignature: config.signature
        },
        options = {
            expiresIn: config.tokenExpires
        };

    return jwt.sign(tokenHeader, secret, options);
}

var authService = {

    storeUserCredentials: function(email, password) {
        var promise = new Promise(function(resolve, reject) {
            var signature;

            mongoAuthAPI.getCredentialsByEmail(email)
            .then(function(result) {
                if (result) {
                    throw { status: 400, errorMessage: 'A user already exists with email: ' + email };
                }
                return encrypt(password);
            }).then(function(hash) {
                signature = uuid.v4();
                var authUser = {
                    email: email,
                    password: hash,
                    signature: signature
                };

                return mongoAuthAPI.insertUserCredentials(authUser);
            }).then(function(result) {
                logger.info('MONGO: Stored credentials for user with email', email);
                var token = getJWTToken(result.ops[0]._id, signature);
                resolve(token);
            }).catch(function(error) {
                logger.error('MONGO: Error storing credentials for user with email', email, 'error: ' + error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    }

};

module.exports = authService;