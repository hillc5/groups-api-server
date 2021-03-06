var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    logger = require('../util/api-util').Logger,

    db = null,
    authCollection = null,

    MONGO_AUTH = 'MONGO_AUTH_API',
    NO_CONN_ERROR = { status: 503, errorMessage: 'ERROR. No Connection' };

var authAPI = {

    setDBConnection: function(connection) {
        db = connection;
        authCollection = db.collection('userauth');
        logger.info(MONGO_AUTH, 'Auth API ONLINE');
    },

    insertUserCredentials: function(userCreds) {
        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                authCollection.insertOne(userCreds).then(function(result) {
                    logger.info(MONGO_AUTH, 'Stored credentials for user with email', userCreds.email);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_AUTH, 'Error storing credentials for user with email', userCreds.email, 'error: ' + error);
                    reject(error);
                });
            }
        });
    },

    getCredentialsByEmail: function(email) {
        return new Promise(function(resolve, reject) {
            authCollection.find({ email: email }).limit(1).next()
            .then(function(result) {
                var message = result ? 'Credentials found for email' : 'No Credentials found for email';
                logger.info(MONGO_AUTH, message, email);
                resolve(result);
            }).catch(function(error) {
                logger.error(MONGO_AUTH, 'Error retrieving credentials for', email);
                reject(error);
            });
        });
    },

    getUserSignature: function(id) {

        return new Promise(function(resolve, reject) {
            authCollection.find({ _id: ObjectId(id) }).limit(1).next()
            .then(function(result) {
                var message = result ? 'Signature found for' : 'No Signature found for';
                logger.info(MONGO_AUTH, message, id);
                resolve(result.signature);
            }).catch(function(error) {
                logger.error(MONGO_AUTH, 'Error retrieving signature for', id);
                reject(error);
            });
        });
    }
};

module.exports = authAPI;
