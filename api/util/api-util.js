var bunyan = require('bunyan');

module.exports = {

    Logger: bunyan.createLogger({
        name: 'groups-api-server'
    }),

    sendError: function(error, reject) {
        if (error.status) {
            reject(error);
        } else {
            reject({ status: 500, errorMessage: error.errmsg });
        }
    },

    createDefaultUser: function(name, email) {
        return {
            name: name,
            email: email.toLowerCase(),
            groups: [],
            posts: [],
            events: [],
            creationDate: new Date()
        };
    },

    createDefaultGroup: function(name, ownerId, isPublic, tags) {
        return {
            name: name,
            public: isPublic,
            ownerId: ownerId,
            users: [],
            events: [],
            tags: tags || [],
            posts: [],
            creationDate: new Date()
        };
    },


    createGroupSnapshot: function(group) {
        return {
            _id: group._id,
            name: group.name,
            public: group.public,
            creationDate: group.creationDate,
            signupDate: new Date(),
            ownerId: group.ownerId
        };
    },

    createUserSnapshot: function(user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            signupDate: new Date()
        };
    },

    parseListString: function(listString) {
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