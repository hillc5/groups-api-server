var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    logger = require('../util/api-util').Logger;

var db = null;
var groupCollection = null;

var NO_CONN_ERROR = { status: 503, errorMessage: 'ERROR. No Connection' };
var MONGO_GROUP = 'MONGO_GROUP_API';

var groupAPI = {

    setDBConnection: function(connection) {
        db = connection;
        groupCollection = db.collection('groups');
        logger.info(MONGO_GROUP, 'Group API ONLINE');
    },

    insertNewGroup: function (group) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                groupCollection.insertOne(group).then(function(result) {
                    logger.info(MONGO_GROUP, 'Successfully inserted new group into db');
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_GROUP, 'Error inserting group into db', group.name);
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
                    var message = result ? 'Group found for' : 'No Group found for';
                    logger.info(MONGO_GROUP, message, id);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_GROUP, 'Error retrieving group for', id);
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
                    logger.info(MONGO_GROUP, 'Successfully added user', userId, 'to group', groupId);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_GROUP, 'Error adding user', userId, 'to group', groupId);
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
                    logger.info(MONGO_GROUP, 'Successfully removed user', userId, 'from group', groupId);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_GROUP, 'Error removing user', userId, 'from group', groupId);
                    reject(error);
                });
            }
        });

        return promise;
    }

};

module.exports = groupAPI;