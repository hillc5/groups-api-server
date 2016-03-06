var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    log = require('../util/api-util').Logger;

var db = null;
var authCollection = null;

var NO_CONN_ERROR = { status: 503, errorMessage: 'ERROR. No Connection' };

var authAPI = {

    setDBConnection: function(connection) {
        db = connection;
        authCollection = db.collection('userauth');
        log.info('MONGO: Auth API ONLINE');
    },

    insertUserCredentials: function(userCreds) {
        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                authCollection.insertOne(userCreds).then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
            }
        });

        return promise;
    },

    getCredentialsByEmail: function(email) {
        var promise = new Promise(function(resolve, reject) {
            authCollection.find({ email: email }).limit(1).next()
            .then(function(result) {
                resolve(result);
            }).catch(function(error) {
                reject(error);
            });
        });

        return promise;
    },

    getUserSignature: function(id) {

        var promise = new Promise(function(resolve, reject) {
            authCollection.find({ _id: ObjectId(id) }).limit(1).next()
            .then(function(result) {
                resolve(result.signature);
            }).catch(function(error) {
                reject(error);
            });
        });

        return promise;
    }
};

module.exports = authAPI;