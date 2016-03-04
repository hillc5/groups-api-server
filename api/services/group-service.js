var mongoGroupAPI = require('../mongo-api/mongo-group-api'),
    mongoUserAPI = require('../mongo-api/mongo-user-api'),
    Promise = require('es6-promise').Promise,
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger;

var groupService = {

    createNewGroup: function(name, ownerId, isPublic, tags) {
        var groupResult,
            group,
            userId,
            tagsArray;

        tagsArray = apiUtil.listStringToArray(tags);
        group = apiUtil.createDefaultGroup(name, ownerId, isPublic, tagsArray);

        var promise = new Promise(function(resolve, reject) {

            mongoUserAPI.getUserById(ownerId).then(function(user) {
                if (!user) {
                    throw { status: 400, errorMessage: 'There is no user with id ' + ownerId };
                }
                userId = user._id;
                return mongoGroupAPI.insertNewGroup(group);
            }).then(function(result) {
                var groupId = result.ops[0]._id;
                return Promise.all([
                    mongoGroupAPI.addUserToGroup(groupId, userId),
                    mongoUserAPI.addGroupToUser(userId, groupId)
                ]);
            }).then(function(results) {
                groupResult = results[0];
                logger.info('MONGO: Group created with id', groupResult._id);
                resolve({ group: groupResult });
            }).catch(function(error) {
                logger.error('MONGO: Error with group creation:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    getGroupById: function(id) {
        var promise = new Promise(function(resolve, reject) {
            mongoGroupAPI.getGroupById(id).then(function(group) {
                logger.info('MONGO: Found group with id:', id);
                resolve(group);
            }).catch(function(error) {
                logger.error('MONGO: Error with group retrieval:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    addUserToGroup: function(groupId, userId) {
        var promise = new Promise(function(resolve, reject) {
            Promise.all([
                mongoUserAPI.getUserById(userId),
                mongoGroupAPI.getGroupById(groupId)
            ]).then(function(results) {
                var user = results[0],
                    group = results[1],
                    userInGroup;

                if (!user) {
                    throw { status: 400, errorMessage: 'There is no user with id: ' + userId };

                }

                if (!group) {
                    throw { status: 400, errorMessage: 'There is no group with id: ' + groupId };
                }

                userInGroup = user.groups.some(function(id) {
                    return id.equals(group._id);
                });

                if (userInGroup) {
                    throw { status: 400, errorMessage: 'Group ' + groupId + ' already contains user ' + userId };
                }

                return Promise.all([
                    mongoGroupAPI.addUserToGroup(group._id, user._id),
                    mongoUserAPI.addGroupToUser(user._id, group._id)
                ]);
            }).then(function(results) {
                logger.info('MONGO: Successfully added user ', + userId + ' to group ' + groupId);
                resolve(results[0]);
            }).catch(function(error) {
                logger.error('MONGO: Error with user addition:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    removeUserFromGroup: function(groupId, userId) {
        var promise = new Promise(function(resolve, reject) {
            mongoGroupAPI.getGroupById(groupId).then(function(result) {
                if (result.ownerId === userId) {
                    throw { status: 400, errorMessage: 'Cannot delete the owner of the group: ' + userId };
                }
                return Promise.all([
                    mongoGroupAPI.removeUserFromGroup(groupId, userId),
                    mongoUserAPI.removeGroupFromUser(userId, groupId)
                ]);
            }).then(function(results) {
                logger.info('MONGO: Removed user ' + userId + ' from group ' + groupId);
                resolve(results[0].value);
            }).catch(function(error) {
                logger.error('MONGO: Error removing user ' + userId + ' from group ' + groupId);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    }

};

module.exports = groupService;