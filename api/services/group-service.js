var mongoGroupAPI = require('../mongo-api/mongo-group-api'),
    mongoUserAPI = require('../mongo-api/mongo-user-api'),
    Promise = require('es6-promise').Promise,
    apiUtil = require('../util/api-util'),
    logger = apiUtil.Logger;

var groupService = {

    createNewGroup: function(name, ownerId, isPublic, tags) {
        var groupResult,
            group,
            userSnapshot,
            tagsArray;

        tagsArray = apiUtil.parseListString(tags);
        group = apiUtil.createDefaultGroup(name, ownerId, isPublic, tagsArray);

        var promise = new Promise(function(resolve, reject) {

            mongoUserAPI.getUserById(ownerId).then(function(user) {
                if (!user) {
                    throw { status: 400, errorMessage: 'There is no user with id ' + ownerId };
                }
                userSnapshot = apiUtil.createUserSnapshot(user);
                return mongoGroupAPI.insertNewGroup(group);
            }).then(function(result) {
                groupResult = result.ops[0];
                return mongoGroupAPI.addUserToGroup(groupResult._id, userSnapshot);
            }).then(function(result) {
                groupResult = result;
                var groupSnapshot = apiUtil.createGroupSnapshot(groupResult);
                return mongoUserAPI.addGroupToUser(ownerId, groupSnapshot);
            }).then(function() {
                logger.info('MONGO: Group created with id', groupResult._id);
                resolve({ group: groupResult });
            }).catch(function(error) {
                logger.error('MONGO: Error with group creation:', error);
                apiUtil.sendError(error, reject);
            });
        });

        return promise;
    }

};

module.exports = groupService;