var dbAPI = require('./mongo-api/mongo-db-api'),
    groupAPI = require('./mongo-api/mongo-group-api'),
    userAPI = require('./mongo-api/mongo-user-api'),
    apiUtil = require('./mongo-api/api-util');


var mongoAPI = {

    // Connects to the DB
    connect: dbAPI.connect,

    // Mongo User Collection API methods
    getUserById: userAPI.getUserById,
    getUserByEmail: userAPI.getUserByEmail,
    createNewUser: userAPI.createNewUser,
    addGroupToUser: userAPI.addGroupToUser,

    // Mongo Group Collection API methods
    createNewGroup: groupAPI.createNewGroup,
    getGroupById: groupAPI.getGroupById,
    getGroupsByName: groupAPI.getGroupsByName,
    addUserToGroup: groupAPI.addUserToGroup,

    // Util methods
    createGroupSnapshot: apiUtil.createGroupSnapshot,
    createUserSnapshot: apiUtil.createUserSnapshot

};

module.exports = mongoAPI;