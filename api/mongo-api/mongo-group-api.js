var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    log = require('../util/api-util').Logger;

var db = null;
var groupCollection = null;

var NO_CONN_ERROR = 'ERROR. No Connection';

var groupAPI = {

    setDBConnection: function(connection) {
        db = connection;
        groupCollection = db.collection('groups');
        log.info('MONGO: Group API ONLINE');
    },

    insertNewGroup: function (group) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.insert(group, function(err, result) {
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

    getGroupById: function(id) {

        var promise = new Promise(function(resolve, reject) {

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.find({ _id: ObjectId(id) }).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) { // TODO remove this case and just return null
                        reject('No Results Found');
                    } else {
                        resolve(result[0]);
                    }
                });
            }
        });

        return promise;
    },

    getGroupsByName: function(name) {

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

    addUserToGroup: function(groupId, user) {

        var promise = new Promise(function(resolve, reject) {

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                // TODO update deprecated method
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

    removeUserFromGroup: function(groupId, userId) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.findOneAndUpdate(
                    { _id: ObjectId(groupId) },
                    { $pull: { users: { $in: [ObjectId(userId)] }}},
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