var mongoUserAPI = require('../mongo-api/mongo-user-api'),
    mongoAuthAPI = require('../mongo-api/mongo-auth-api'),
    apiUtil = require('../util/api-util'),
    Promise = require('es6-promise').Promise;

var userService = {

    createNewUser: function(name, email, password) {
        var promise = new Promise(function(resolve, reject) {
            var authToken;

            mongoUserAPI.getUserByEmail().then(function(result) {
                if (result !== null) {
                    reject({ status: 403, errorMessage: 'A user already exists with ' });
                } else {
                    return mongoAuthAPI.storeUserCredentials(email, password);
                }
            }).then(function(token) {
                var newUser = apiUtil.createDefaultUser(name, email);
                authToken = token;
                return mongoUserAPI.insertNewUser(newUser);
            }).then(function(result) {
                resolve({ user: result, token: authToken });
            }).catch(function(error) {
                return ({ status: 500, errorMessage: error.errmsg });
            });
        });

        return promise;
    }
};

module.exports = userService;