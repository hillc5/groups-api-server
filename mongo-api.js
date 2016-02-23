var dbAPI = require('./mongo-api/mongo-db-api'),
    authAPI = require('./mongo-api/mongo-auth-api'),
    groupAPI = require('./mongo-api/mongo-group-api'),
    userAPI = require('./mongo-api/mongo-user-api');


var mongoAPI = {

    // Connects to the DB
    connect: dbAPI.connect,

    // Mongo Auth Collection API Methods
    storeUserCredentials: authAPI.storeUserCredentials,
    validateUser: authAPI.validateUser,
    getUserSignature: authAPI.getUserSignature,

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
    removeUserFromGroup: groupAPI.removeUserFromGroup

};

module.exports = mongoAPI;