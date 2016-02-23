var Promise = require('es6-promise').Promise,
    mongoUserAPI = require('./mongo-user-api'),
    apiUtil = require('../util/api-util'),
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
            var groupSnapshot,
                newGroup;

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                mongoUserAPI.getUserById(group.ownerId).then(function(result) {
                    var user = apiUtil.createUserSnapshot(result);
                    group.users.push(user);
                    // TODO disallow same name and owner for any new group
                    groupCollection.insert(group, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            newGroup = result.ops[0];
                            // Adding group to creator's groups array
                            groupSnapshot = apiUtil.createGroupSnapshot(newGroup);
                            mongoUserAPI.addGroupToUser(group.ownerId, groupSnapshot);

                            resolve(newGroup);
                        }
                    });
                }, function() {
                    reject("No User found for ownerId: " + group.ownerId);
                })
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
                        reject("No Group found");
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
                        var group;
                        if (err) {
                            reject(err);
                        } else if (!results.value) {
                            reject('There is no group with id, ' + groupId);
                        } else {
                            group = apiUtil.createGroupSnapshot(results.value);
                            mongoUserAPI.addGroupToUser(user._id, group);
                            resolve(results);
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
                groupCollection.findOne({ _id: ObjectId(groupId) }).then(function(result) {
                    if (result.ownerId === userId) {
                        reject('Cannot remove owner of the group');
                    } else {
                        return mongoUserAPI.removeGroupFromUser(userId, groupId);
                    }
                }).then(function() {
                    return groupCollection.findOneAndUpdate(
                        { _id: ObjectId(groupId) },
                        { $pull: { users: { _id: ObjectId(userId) }}},
                        { returnOriginal: false });
                }).then(function(result) {
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