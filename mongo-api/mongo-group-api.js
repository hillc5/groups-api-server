var Promise = require('es6-promise').Promise,
    mongoUserAPI = require('./mongo-user-api'),
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
                mongoUserAPI.getUserById(group.ownerId).then(function(result) {
                    var user = result;
                    group.users.push({ _id: user._id, name: user.name, email: user.email });
                    // TODO disallow same name and owner for any new group
                    groupCollection.insert(group, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // Adding group to creator's groups array
                            mongoUserAPI.addGroupToUser(group.ownerId, result.ops[0]);
                            resolve(result);
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
    }

};

module.exports = groupAPI;