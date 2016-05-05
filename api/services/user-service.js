var mongoUserAPI = require('../mongo-api/mongo-user-api'),
    authService = require('../services/auth-service'),
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger,
    Promise = require('es6-promise').Promise,

    USER_SERVICE = 'USER_SERVICE';

var userService = {

    createNewUser: function(name, email, password) {
        var promise = new Promise(function(resolve, reject) {
            var authToken,
                user;

            logger.info(USER_SERVICE, 'Determining if email already exists', email);
            mongoUserAPI.getUserByEmail(email).then(function(result) {
                var newUser;
                if (result !== null) {
                    throw { status: 400, errorMessage: 'A user already exists with email: ' + email };
                }
                newUser = apiUtil.createDefaultUser(name, email);
                logger.info(USER_SERVICE, 'Inserting new user');
                return mongoUserAPI.insertNewUser(newUser);
            }).then(function(results) {
                user = results.ops[0];
                logger.info(USER_SERVICE, 'Storing User Credentials');
                return authService.storeUserCredentials(email, password, user._id);
            }).then(function(results) {
                authToken = results;
                logger.info(USER_SERVICE, 'User created with id', user._id);
                resolve({ user: user, token: authToken });
            }).catch(function(error) {
                logger.error(USER_SERVICE, 'Error with user creation:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    getUserById: function(id) {
        var promise = new Promise(function(resolve, reject) {
            logger.info(USER_SERVICE, 'Retrieving user with', id);
            mongoUserAPI.getUserById(id).then(function(result) {
                if (result === null) {
                    throw { status: 400, errorMessage: 'There is no user with id: ' + id };
                } else {
                    logger.info(USER_SERVICE, 'Found user with', id);
                    resolve(result);
                }
            }).catch(function(error) {
                logger.error(USER_SERVICE, 'Error with user retrieval', id);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    }
};

module.exports = userService;