var utilApi = require('./mongo-api/mongo-util-api'),
    groupApi = require('./mongo-api/mongo-group-api'),
    userApi = require('./mongo-api/mongo-user-api');


var mongoAPI = {

    connect: utilApi.connect,

    getUserById: userApi.getUserById,
    getUserByEmail: userApi.getUserByEmail,
    createNewUser: userApi.createNewUser,

    createNewGroup: groupApi.createNewGroup
};

module.exports = mongoAPI;