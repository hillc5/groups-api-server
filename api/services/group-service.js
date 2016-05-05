var mongoGroupAPI = require('../mongo-api/mongo-group-api'),
    mongoUserAPI = require('../mongo-api/mongo-user-api'),
    Promise = require('es6-promise').Promise,
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger,

    GROUP_SERVICE = 'GROUP_SERVICE';

var groupService = {

    createNewGroup: function(name, ownerId, isPublic, tags) {
        var groupResult,
            group,
            owner,
            tagsArray;

        var promise = new Promise(function(resolve, reject) {

            logger.info(GROUP_SERVICE, 'Attempting to retrieve owner account', ownerId);
            mongoUserAPI.getUserById(ownerId).then(function(user) {
                if (!user) {
                    throw { status: 400, errorMessage: 'There is no user with id ' + ownerId };
                }
                owner = {
                    _id: user._id,
                    name: user.name
                };

                tagsArray = apiUtil.listStringToArray(tags);
                group = apiUtil.createDefaultGroup(name, owner, isPublic, tagsArray);
                logger.info(GROUP_SERVICE, 'Attempting to insert new group', name);
                return mongoGroupAPI.insertNewGroup(group);
            }).then(function(result) {
                var groupId = result.ops[0]._id;
                logger.info(GROUP_SERVICE, 'Adding group', groupId, 'and user', owner._id, 'references');
                return mongoGroupAPI.addUserToGroup(groupId, owner);
            }).then(function(result) {
                groupResult = result.value;
                return mongoUserAPI.addGroupToUser(owner._id, groupResult);
            }).then(function() {
                logger.info(GROUP_SERVICE, 'Group created with id', groupResult._id);
                resolve({ group: groupResult });
            }).catch(function(error) {
                logger.error(GROUP_SERVICE, 'Error with group creation:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    getGroupById: function(id) {
        var promise = new Promise(function(resolve, reject) {
            logger.info(GROUP_SERVICE, 'Retrieving group for', id);
            mongoGroupAPI.getGroupById(id).then(function(result) {
                if (!result) {
                    throw { status: 404, errorMessage: 'There is no group with id ' + id };
                }
                logger.info(GROUP_SERVICE, 'Found group with', id);
                resolve(result);
            }).catch(function(error) {
                logger.error(GROUP_SERVICE, 'Error with group retrieval', id);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    addUserToGroup: function(groupId, userId) {
        var promise = new Promise(function(resolve, reject) {
            var groupResult;
            
            logger.info(GROUP_SERVICE, 'Retrieving group', groupId, 'and user', userId);
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

                userInGroup = user.groups.some(function(group) {
                    return group._id.equals(groupId);
                });

                if (userInGroup) {
                    throw { status: 400, errorMessage: 'Group ' + groupId + ' already contains user ' + userId };
                }
                logger.info(GROUP_SERVICE, 'Adding group', groupId, 'and user', userId, 'references');
                
                // using user._id so that ObjectId(...) works in removeUserFromGroup
                return mongoGroupAPI.addUserToGroup(groupId, { _id: user._id, name: user.name });
            }).then(function(result) {
                groupResult = result.value;
                return mongoUserAPI.addGroupToUser(userId, groupResult);
            }).then(function() {
                logger.info(GROUP_SERVICE, 'Successfully added user ' + userId + ' to group ' + groupId);
                resolve(groupResult);
            }).catch(function(error) {
                logger.error(GROUP_SERVICE, 'Error with user addition:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    },

    removeUserFromGroup: function(groupId, userId) {
        var promise = new Promise(function(resolve, reject) {
            logger.info(GROUP_SERVICE, 'Retrieving group', groupId);
            mongoGroupAPI.getGroupById(groupId).then(function(result) {
                if (result.ownerId === userId) {
                    throw { status: 400, errorMessage: 'Cannot delete the owner of the group: ' + userId };
                }
                logger.info(GROUP_SERVICE, 'Attempting to remove user', userId, 'from group', groupId);
                return Promise.all([
                    mongoGroupAPI.removeUserFromGroup(groupId, userId),
                    mongoUserAPI.removeGroupFromUser(userId, groupId)
                ]);
            }).then(function(results) {
                logger.info(GROUP_SERVICE, 'Removed user ' + userId + ' from group ' + groupId);
                resolve(results[0].value);
            }).catch(function(error) {
                logger.error(GROUP_SERVICE, 'Error removing user ' + userId + ' from group ' + groupId);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    }

};

module.exports = groupService;