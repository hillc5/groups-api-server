var bunyan = require('bunyan');

module.exports = {

    Logger: bunyan.createLogger({
        name: 'groups-api-server'
    }),

    throwError: function(error) {
        if (error.status) {
            throw error;
        } else {
            throw { status: 500, errorMessage: error.errmsg || 'Unexpected Error' };
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

    createDefaultGroup: function(name, owner, isPublic, tags) {
        return {
            name: name,
            public: isPublic,
            owner: owner,
            users: [],
            events: [],
            tags: tags || [],
            posts: [],
            creationDate: new Date()
        };
    },

    listStringToArray: function(listString) {
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
