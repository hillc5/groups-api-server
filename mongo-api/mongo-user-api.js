var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId;

var db = null;
var userCollection = null;

var NO_CONN_ERROR = 'ERROR. No Connection';

var userAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        userCollection = db.collection('user');
        console.log('MONGO: User API ONLINE');
    },


    getUserById: function getUserById(id) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.find({ _id: ObjectId(id) }).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        reject("There is no user with that id");
                    } else {
                        resolve(result[0]);
                    }
                });
            }
        });

        return promise;
    },

    getUserByEmail: function getUserByEmail(email) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.find({ email: email }).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if( result.length === 0) {
                        reject("There is no user with that email address");
                    } else {
                        resolve(result[0]);
                    }
                });
            }
        });

        return promise;
    },

    createNewUser: function createNewUser(user) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject('ERROR.  No Connection');
            } else {
                userCollection.find({ email: user.email}).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length != 0) {
                        reject("User already exists with " + user.email);
                    } else {
                        userCollection.insert(user, function(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result.ops[0]);
                            }
                        });
                    }
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
                userCollection.update({ _id: ObjectId(userId) }, { $push: { groups : group } },
                function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
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