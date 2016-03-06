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

function compare(password, hash) {

    var promise = new Promise(function(resolve, reject) {
        bcrypt.compare(password, hash, function(err, result) {
            if (err) {
                reject({ status: 500, errorMessage: err });
            } else if (result === false) {
                reject({ status: 401, errorMessage: 'Incorrect Password' });
            } else {
                resolve(true);
            }
        });
    });

    return promise;
}

function verifyJWTToken(token, signature) {

    var promise = new Promise(function(resolve, reject) {
        jwt.verify(token, signature, { issuer: config.signature }, function(err, result) {
            if (err) {
                reject({ status: 403, errorMessage: 'Token Invalid: ' + err.message });
            } else {
                resolve(result);
            }
        });
    });

    return promise;
}

function decodeJWTToken(token) {

    var promise = new Promise(function(resolve, reject) {
        var decoded;
        try {
            decoded = jwt.decode(token);
            resolve(decoded);
        } catch (error) {
            reject({ status: 400, errorMessage: 'Malformed Token'});
        }
    });

    return promise;
}

function signJWTToken(id, secret) {
    var tokenHeader = {
            id: id
        },
        options = {
            issuer: config.signature,
            audience: id,
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
                var token = signJWTToken(result.ops[0]._id, signature);
                resolve(token);
            }).catch(function(error) {
                logger.error('MONGO: Error storing credentials for user with email', email, 'error: ' + error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    validateUser: function(email, password) {

        var promise = new Promise(function(resolve, reject) {
            var signature,
                id;

            mongoAuthAPI.getCredentialsByEmail(email).then(function(credentials) {
                if (!credentials) {
                    throw { status: 401, errorMessage: 'There is no user with email address: ' + email };
                }
                signature = credentials.signature;
                id = credentials._id;

                return compare(password, credentials.password);

            }).then(function() {
                var token = signJWTToken(id, signature);
                logger.info('MONGO: User validated with email', email);
                resolve(token);
            }).catch(function(error) {
                logger.error('MONGO: Unable to validate user with email', email, 'error:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    validateToken: function(token) {

        var promise = new Promise(function(resolve, reject) {
            decodeJWTToken(token).then(function(decoded) {
                if (!decoded) {
                    throw { status: 401, errorMessage: 'Incorrect token associated with the request' };
                }
                return mongoAuthAPI.getUserSignature(decoded.id);

            }).then(function(signature) {
                return verifyJWTToken(token, signature);

            }).then(function(result) {
                logger.info('MONGO: validated token');
                resolve(result);
            }).catch(function(error) {
                logger.error('MONGO: unable to validate token', 'error:', error);
                apiUtil.sendError(error, reject);
            });

        });

        return promise;
    }

};

module.exports = authService;