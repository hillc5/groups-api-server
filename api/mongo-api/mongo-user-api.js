var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId,
    logger = require('../util/api-util').Logger;

var db = null;
var userCollection = null;

var NO_CONN_ERROR = { status: 503, errorMessage: 'ERROR. No Connection' };
var MONGO_USER = 'MONGO_USER_API';

var userAPI = {

    setDBConnection: function(connection) {
        db = connection;
        userCollection = db.collection('user');
        logger.info(MONGO_USER, 'User API ONLINE');
    },

    insertNewUser: function(user) {

        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.insertOne(user).then(function(result) {
                    logger.info(MONGO_USER, 'Successfully inserted new user into db', user.email);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_USER, 'Error inserting user into db', user.email);
                    reject(error);
                });
            }
        });
    },

    getUserById: function(id) {

        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.find({ _id: ObjectId(id) }).limit(1).next()
                .then(function(result) {
                    var message = result ? 'User found for' : 'No User found for';
                    logger.info(MONGO_USER, message, id);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_USER, 'Error retrieving user for', id);
                    reject(error);
                });
            }
        });
    },

    getUserByEmail: function(email) {

        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.find({ email: email }).limit(1).next()
                .then(function(result) {
                    var message = result ? 'User found for email' : 'No User found for email';
                    logger.info(MONGO_USER, message, email);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_USER, 'Error retrieving user for', email);
                    reject(error);
                });
            }
        });
    },

    addGroupToUser: function(userId, group) {

        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.findOneAndUpdate(
                    { _id: ObjectId(userId) },
                    { $push: { groups : group } },
                    { returnOriginal: false }
                ).then(function(result) {
                    logger.info(MONGO_USER, 'Successfully added group', group._id, 'to user', userId);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_USER, 'Error adding group', group._id, 'to user', userId);
                    reject(error);
                });
            }
        });
    },

    removeGroupFromUser: function(userId, groupId) {

        return new Promise(function(resolve, reject) {
            if(!db) {
                reject(NO_CONN_ERROR);
            } else {
                userCollection.findOneAndUpdate(
                    { _id: ObjectId(userId) },
                    { $pull: { groups: { _id: ObjectId(groupId) }}},
                    { returnOriginal: false }
                ).then(function(result) {
                    logger.info(MONGO_USER, 'Successfully removed group', groupId, 'from user', userId);
                    resolve(result);
                }).catch(function(error) {
                    logger.error(MONGO_USER, 'Error removing group', groupId, 'from user', userId);
                    reject(error);
                });
            }
        });
    }
};

module.exports = userAPI;
