var dbAPI = require('./api/mongo-api/mongo-db-api'),
    authAPI = require('./api/mongo-api/mongo-auth-api'),
    groupAPI = require('./api/mongo-api/mongo-group-api'),
    userAPI = require('./api/mongo-api/mongo-user-api');


var mongoAPI = {

    // Connects to the DB
    connect: dbAPI.connect,

    // Mongo Auth Collection API Methods
    storeUserCredentials: authAPI.storeUserCredentials,
    validateUser: authAPI.validateUser,
    getUserSignature: authAPI.getUserSignature,

    // Mongo User Collection API methods
    createNewUser: userAPI.createNewUser,
    getUserById: userAPI.getUserById,
    getUserByEmail: userAPI.getUserByEmail,
    addGroupToUser: userAPI.addGroupToUser,
    removeGroupFromUser: userAPI.removeGroupFromUser,

    // Mongo Group Collection API methods
    createNewGroup: groupAPI.createNewGroup,
    getGroupById: groupAPI.getGroupById,
    getGroupsByName: groupAPI.getGroupsByName,
    addUserToGroup: groupAPI.addUserToGroup,
    removeUserFromGroup: groupAPI.removeUserFromGroup

};

module.exports = mongoAPI;