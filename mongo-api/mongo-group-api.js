var Promise = require('es6-promise').Promise,
    mongoUserAPI = require('./mongo-user-api'),
    ObjectId = require('mongodb').ObjectId;

var db = null;

var groupAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        console.log('MONGO: Group API ONLINE');
    },

    createNewGroup: function createNewGroup(group) {

        var promise = new Promise(function(resolve, reject) {

            var groups = db.collection('groups');

            if (!db) {
                reject('ERROR. No Connection');
            } else {
                mongoUserAPI.getUserById(group.ownerId).then(function(result) {
                    var user = result;
                    group.users.push({ _id: user._id, name: user.name, email: user.email });
                    // TODO disallow same name and owner for any new group
                    groups.insert(group, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // TODO add an addGroupToUser api method and call it here
                            resolve(result);
                        }
                    });
                }, function() {
                    reject("No User found for ownerId: " + group.ownerId);
                })
            }

        });

        return promise;
    }

};

module.exports = groupAPI;