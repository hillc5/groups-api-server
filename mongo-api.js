var utilAPI = require('./mongo-api/mongo-util-api'),
    groupAPI = require('./mongo-api/mongo-group-api'),
    userAPI = require('./mongo-api/mongo-user-api');


var mongoAPI = {

    // Connects to the DB
    connect: utilAPI.connect,

    // Mongo User Collection API methods
    getUserById: userAPI.getUserById,
    getUserByEmail: userAPI.getUserByEmail,
    createNewUser: userAPI.createNewUser,

    // Mongo Group Collection API methods
    createNewGroup: groupAPI.createNewGroup,
    getGroupsByName: groupAPI.getGroupsByName
};

module.exports = mongoAPI;