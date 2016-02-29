var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    log = require('../util/api-util').Logger;

var db = null;
var userCollection = null;

var NO_CONN_ERROR = 'ERROR. No Connection';

var userAPI = {

    setDBConnection: function(connection) {
        db = connection;
        userCollection = db.collection('user');
        log.info('MONGO: User API ONLINE');
    },

    insertNewUser: function(user) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject('ERROR.  No Connection');
            } else {
                userCollection.insert(user, function(err, result) {
                    if (err) {
                        log.error(err);
                        reject(err);
                    } else {
                        log.info('MONGO: New User inserted into db:', result.ops[0]._id);
                        resolve(result);
                    }
                });
            }
        });

        return promise;
    },

    getUserById: function(id) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.find({ _id: ObjectId(id) }).limit(1).next()
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    log.error(error);
                    reject(error);
                });
            }
        });

        return promise;
    },

    getUserByEmail: function(email) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.find({ email: email }).limit(1).next()
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    log.error(error);
                    reject(error);
                });
            }
        });

        return promise;
    },

    addGroupToUser: function addGroupToUser(userId, group) {

        var promise = new Promise(function(resolve, reject) {

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.findOneAndUpdate(
                    { _id: ObjectId(userId) },
                    { $push: { groups : group } },
                    { returnOriginal: false }
                ).then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
            }
        });

        return promise;
    },

    removeGroupFromUser: function removeGroupFromUser(userId, groupId) {

        var promise = new Promise(function(resolve, reject) {
            if(!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.findOneAndUpdate(
                    { _id: ObjectId(userId) },
                    { $pull: { groups: { _id: ObjectId(groupId) }}},
                    { returnOriginal: false }
                ).then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
            }
        });

        return promise;
    }
};

module.exports = userAPI;