var mongoAuthAPI = require('../mongo-api/mongo-auth-api'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    uuid = require('node-uuid'),
    Promise = require('es6-promise').Promise,
    config = require('../config/config'),
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger,
    authService,

    AUTH_SERVICE = 'AUTH_SERVICE';

function encrypt(phrase) {
    return new Promise(function(resolve, reject) {
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
}

function compare(password, hash) {
    return new Promise(function(resolve, reject) {
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
}

function verifyJWTToken(token, signature) {
    return new Promise(function(resolve, reject) {
        jwt.verify(token, signature, { issuer: config.signature }, function(err, result) {
            if (err) {
                reject({ status: 403, errorMessage: 'Token Invalid: ' + err.message });
            } else {
                resolve(result);
            }
        });
    });
}

function decodeJWTToken(token) {
    return new Promise(function(resolve, reject) {
        var decoded;
        try {
            decoded = jwt.decode(token);
            resolve(decoded);
        } catch (error) {
            reject({ status: 400, errorMessage: 'Malformed Token'});
        }
    });
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

authService = {

    storeUserCredentials: function(email, password, userId) {
        var signature;

        return mongoAuthAPI.getCredentialsByEmail(email).then(function(result) {
            if (result) {
                throw { status: 400, errorMessage: 'A user already exists with email: ' + email };
            }
            return encrypt(password);
        }).then(function(hash) {
            signature = uuid.v4();
            var authUser = {
                email: email,
                password: hash,
                userId: userId,
                signature: signature
            };
            logger.info(AUTH_SERVICE, 'Attempting to insert user credentials for', email);
            return mongoAuthAPI.insertUserCredentials(authUser);
        }).then(function(result) {
            logger.info(AUTH_SERVICE, 'Attempting to sign token for', email);
            var token = signJWTToken(result.ops[0]._id, signature);
            return token;
        }).catch(function(error) {
            logger.error(AUTH_SERVICE, 'Error while storing credentials for', email);
            apiUtil.throwError(error);
        });
    },

    validateUser: function(email, password) {
        var signature,
            userId,
            id;

        logger.info(AUTH_SERVICE, 'Getting credentials for', email);
        return mongoAuthAPI.getCredentialsByEmail(email).then(function(credentials) {
            if (!credentials) {
                throw { status: 401, errorMessage: 'There is no user with email address: ' + email };
            }
            signature = credentials.signature;
            userId = credentials.userId;
            id = credentials._id;

            logger.info(AUTH_SERVICE, 'Comparing passwords');
            return compare(password, credentials.password);
        }).then(function() {
            var token = signJWTToken(id, signature);
            logger.info(AUTH_SERVICE, 'User validated with email', email);
            return {userId: userId, token: token };
        }).catch(function(error) {
            logger.error(AUTH_SERVICE, 'Unable to validate user with email', email, 'error:', error);
            apiUtil.throwError(error);
        });
    },

    validateToken: function(token) {
        logger.info(AUTH_SERVICE, 'Attempting initial decode of token');
        return decodeJWTToken(token).then(function(decoded) {
            if (!decoded) {
                throw { status: 401, errorMessage: 'Incorrect token associated with the request' };
            }
            logger.info(AUTH_SERVICE, 'Retrieving signature for', decoded.id);
            return mongoAuthAPI.getUserSignature(decoded.id);

        }).then(function(signature) {
            logger.info(AUTH_SERVICE, 'Verifying token');
            return verifyJWTToken(token, signature);
        }).then(function(result) {
            logger.info(AUTH_SERVICE, 'Token validated');
            return result;
        }).catch(function(error) {
            logger.error(AUTH_SERVICE, 'Unable to validate token', 'error:', error);
            apiUtil.throwError(error);
        });
    }
};

module.exports = authService;
