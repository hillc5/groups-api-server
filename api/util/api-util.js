var bunyan = require('bunyan');

module.exports = {

    Logger: bunyan.createLogger({
        name: 'groups-api-server'
    }),

    createGroupSnapshot: function createGroupSnapshot(group) {
        return {
            _id: group._id,
            name: group.name,
            public: group.public,
            creationDate: group.creationDate,
            signupDate: new Date(),
            ownerId: group.ownerId
        };
    },

    createUserSnapshot: function createUserSnapshot(user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            signupDate: new Date()
        };
    },

    parseListString: function parseListString(listString) {
        function trimArrayString(item) {
            return item.trim();
        }
        if (typeof listString === 'string') {
            return listString.split(',').map(trimArrayString);
        } else if (listString instanceof Array) {
            return listString.map(trimArrayString);
        }
    }
};