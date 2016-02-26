var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    uuid = require('node-uuid'),
    config = require('../config/config'),
    log = require('../util/api-util').Logger;

var db = null;
var authCollection = null;

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

var authAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        authCollection = db.collection('userauth');
        log.info('MONGO: Auth API ONLINE');
    },

    storeUserCredentials: function storeUserCredentials(email, password) {
        var promise = new Promise(function(resolve, reject) {

            authCollection.find({ email: email }).toArray(function(err, result) {
                if (err) {
                    reject(err);
                } else if (result.length !== 0) {
                    reject('User already exists with ' + email);
                } else {
                    encrypt(password).then(function(hash) {
                        var signature = uuid.v4(),
                            authUser = {
                                email: email,
                                password: hash,
                                signature: signature
                            };
                        authCollection.insert(authUser, function(err, result) {
                            var token;

                            if (err) {
                                reject(err);
                            } else {
                                token = getJWTToken(result.ops[0]._id, signature);
                                resolve(token);
                            }
                        });
                    }).catch(function(error) {
                        reject(error);
                    });
                }
            });

        });

        return promise;
    },


    validateUser: function validateUser(email, password) {

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

    getUserSignature: function getUserSignature(id) {

        var promise = new Promise(function(resolve, reject) {
            authCollection.find({ _id: ObjectId(id) }).toArray(function(err, results) {
                if (err) {
                    reject(err);
                } else if (results.length === 0) {
                    reject('No user for id: ' + id);
                } else {
                    resolve(results[0]);
                }
            });
        });

        return promise;
    }


};

module.exports = authAPI;