var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    logger = require('../util/api-util').Logger;

var db = null;
var groupCollection = null;

var NO_CONN_ERROR = { status: 503, errorMessage: 'ERROR. No Connection' };

var groupAPI = {

    setDBConnection: function(connection) {
        db = connection;
        groupCollection = db.collection('groups');
        logger.info('MONGO: Group API ONLINE');
    },

    insertNewGroup: function (group) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.insertOne(group).then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
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
                groupCollection.find({ _id: ObjectId(id) }).limit(1).next()
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
            }
        });

        return promise;
    },

    addUserToGroup: function(groupId, userId) {

        var promise = new Promise(function(resolve, reject) {

            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.findOneAndUpdate(
                    { _id: ObjectId(groupId) },
                    { $push: { users: userId }},
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

    removeUserFromGroup: function(groupId, userId) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.findOneAndUpdate(
                    { _id: ObjectId(groupId) },
                    { $pull: { users: { $in: [ObjectId(userId)] }}},
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

module.exports = groupAPI;