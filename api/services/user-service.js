var mongoUserAPI = require('../mongo-api/mongo-user-api'),
    mongoAuthAPI = require('../mongo-api/mongo-auth-api'),
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger,
    Promise = require('es6-promise').Promise;

var userService = {

    createNewUser: function(name, email, password) {
        var promise = new Promise(function(resolve, reject) {
            var authToken;

            mongoUserAPI.getUserByEmail(email).then(function(result) {
                var newUser;
                if (result !== null) {
                    throw { status: 400, errorMessage: 'A user already exists with email: ' + email };
                }
                newUser = apiUtil.createDefaultUser(name, email);
                return Promise.all([
                    mongoAuthAPI.storeUserCredentials(email, password),
                    mongoUserAPI.insertNewUser(newUser)
                ]);
            }).then(function(results) {
                var user = results[1].ops[0];
                authToken = results[0];
                logger.info('MONGO: User created with id', user._id);
                resolve({ user: user, token: authToken });
            }).catch(function(error) {
                logger.error('MONGO: Error with user creation:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    getUserById: function(id) {
        var promise = new Promise(function(resolve, reject) {
            mongoUserAPI.getUserById(id).then(function(result) {
                if (result === null) {
                    logger.info('MONGO: No user found for ', id);
                    throw { status: 400, errorMessage: 'There is no user with id: ' + id };
                } else {
                    logger.info('MONGO: 1 user found for ', id);
                    resolve(result);
                }
            }).catch(function(error) {
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    getUserByEmail: function(email) {
        var promise = new Promise(function(resolve, reject) {
            mongoUserAPI.getUserByEmail(email).then(function(result) {
                if (result === null) {
                    logger.info('MONGO: No user found for ', email);
                    throw { status: 400, errorMessage: 'There is no user with email: ' + email };
                } else {
                    logger.info('MONGO: 1 user found for ', email);
                    resolve(result);
                }
            }).catch(function(error) {
                apiUtil.sendError(error, reject);
            });

        });

        return promise;
    }
};

module.exports = userService;