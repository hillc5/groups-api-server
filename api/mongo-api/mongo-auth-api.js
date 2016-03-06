var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    config = require('../config/config'),
    log = require('../util/api-util').Logger;

var db = null;
var authCollection = null;

var NO_CONN_ERROR = { status: 503, errorMessage: 'ERROR. No Connection' };

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

    validateUser: function(email, password) {

        var promise = new Promise(function(resolve, reject) {
            authCollection.find({ email: email }).toArray(function(err, result) {
                var signature, id;
                if (err) {
                    reject(err);
                } else if (result.length === 0) {
                    reject('There is no user with that email address');
                } else {
                    signature = result[0].signature;
                    id = result[0]._id;
                    bcrypt.compare(password, result[0].password, function(err, result) {
                        var token;
                        if (err) {
                            reject(err);
                        } else if (result === false) {
                            reject('Incorrect Password');
                        } else {
                            token = getJWTToken(id, signature);
                            resolve(token);
                        }
                    });
                }
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