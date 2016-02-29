var mongoUserAPI = require('../mongo-api/mongo-user-api'),
    mongoAuthAPI = require('../mongo-api/mongo-auth-api'),
    apiUtil = require('../util/api-util'),
    log = apiUtil.Logger,
    Promise = require('es6-promise').Promise;

function sendError(error, reject) {
    if (error.status) {
        reject(error);
    } else {
        reject({ status: 500, errorMessage: error.errmsg });
    }
}

var userService = {

    createNewUser: function(name, email, password) {
        var promise = new Promise(function(resolve, reject) {
            var authToken;

            mongoUserAPI.getUserByEmail(email).then(function(result) {
                if (result !== null) {
                    throw { status: 400, errorMessage: 'A user already exists with email: ' + email };
                } else {
                    return mongoAuthAPI.storeUserCredentials(email, password);
                }
            }).then(function(token) {
                var newUser = apiUtil.createDefaultUser(name, email);
                authToken = token;
                return mongoUserAPI.insertNewUser(newUser);
            }).then(function(result) {
                var user = result.ops[0];
                resolve({ user: user, token: authToken });
            }).catch(function(error) {
                sendError(error, reject);
            });
        });

        return promise;
    },

    getUserById: function(id) {
        var promise = new Promise(function(resolve, reject) {
            mongoUserAPI.getUserById(id).then(function(result) {
                if (result === null) {
                    log.info('MONGO: No user found for ', id);
                    throw { status: 400, errorMessage: 'There is no user with id: ' + id };
                } else {
                    log.info('MONGO: 1 user found for ', id);
                    resolve(result);
                }
            }).catch(function(error) {
                sendError(error, reject);
            });
        });

        return promise;
    },

    getUserByEmail: function(email) {
        var promise = new Promise(function(resolve, reject) {
            mongoUserAPI.getUserByEmail(email).then(function(result) {
                if (result === null) {
                    log.info('MONGO: No user found for ', email);
                    throw { status: 400, errorMessage: 'There is no user with email: ' + email };
                } else {
                    log.info('MONGO: 1 user found for ', email);
                    resolve(result);
                }
            }).catch(function(error) {
                sendError(error, reject);
            });

        });

        return promise;
    }
};

module.exports = userService;