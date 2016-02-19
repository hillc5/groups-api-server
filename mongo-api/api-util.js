module.exports = {
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
        }
    }
};