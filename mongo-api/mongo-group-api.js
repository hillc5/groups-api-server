var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId;

var db = null;
var groupCollection = null;

var NO_CONN_ERROR = 'ERROR. No Connection';

var groupAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        groupCollection = db.collection('groups');
        console.log('MONGO: Group API ONLINE');
    },

    createNewGroup: function createNewGroup(group) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.insert(group, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.ops[0]);
                    }
                });
            }
        });

        return promise;
    },

    getGroupById: function getGroupById(id) {

        var promise = new Promise(function(resolve, reject) {

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.find({ _id: ObjectId(id) }).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        reject('No Results Found');
                    } else {
                        resolve(result[0]);
                    }
                });
            }
        });

        return promise;
    },

    getGroupsByName: function getGroupsByName(name) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.find({ name: name }).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        reject('No Group found');
                    } else {
                        resolve(result);
                    }
                });
            }
        });

        return promise;
    },

    addUserToGroup: function  addUserToGroup(groupId, user) {

        var promise = new Promise(function(resolve, reject) {

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.findAndModify(
                    { _id: ObjectId(groupId) },
                    [[ '_id',  'asc']],
                    { $push: { users: user } },
                    { new: true },
                    function(err, results) {
                        if (err) {
                            reject(err);
                        } else if (!results.value) {
                            reject('There is no group with id, ' + groupId);
                        } else {
                            resolve(results.value);
                        }
                    });
            }
        });

        return promise;
    },

    removeUserFromGroup: function removeUserFromGroup(groupId, userId) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.findOneAndUpdate(
                    { _id: ObjectId(groupId) },
                    { $pull: { users: { _id: ObjectId(userId) }}},
                    { returnOriginal: false })
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
            }
        });

        return promise;
    }

};

module.exports = groupAPI;