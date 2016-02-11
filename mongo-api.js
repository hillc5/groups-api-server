var utilApi = require('./mongo-api/mongo-util-api'),
    userApi = require('./mongo-api/mongo-user-api');


var mongoAPI = {

    connect: utilApi.connect,

    getUserById: userApi.getUserById,
    getUserByEmail: userApi.getUserByEmail,
    createNewUser: userApi.createNewUser
};

module.exports = mongoAPI;