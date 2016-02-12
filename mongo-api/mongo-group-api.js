var Promise = require('es6-promise').Promise,
    mongoUserAPI = require('./mongo-user-api'),
    ObjectId = require('mongodb').ObjectId;

var db = null;
var groupCollection = null;

var groupAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        groupCollection = db.collection('group');
        console.log('MONGO: Group API ONLINE');
    },

    createNewGroup: function createNewGroup(group) {

        var promise = new Promise(function(resolve, reject) {


            if (!db) {
                reject('ERROR. No Connection');
            } else {
                mongoUserAPI.getUserById(group.ownerId).then(function(result) {
                    var user = result;
                    group.users.push({ _id: user._id, name: user.name, email: user.email });
                    // TODO disallow same name and owner for any new group
                    groupCollection.insert(group, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // TODO add an addGroupToUser api method in user api and call it here
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

    getGroupsByName: function getGroupsByName(name) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject('ERROR. No Connection');
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