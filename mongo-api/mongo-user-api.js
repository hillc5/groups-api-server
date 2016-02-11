var Promise = require('es6-promise').Promise,
    ObjectId = require('mongodb').ObjectId;

var db = null;

var userAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        console.log('MONGO: User API ONLINE');
    },


    getUserById: function getUserById(id) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject('ERROR. No Connection');
            } else {
                var users = db.collection('users');
                users.find({ _id: ObjectId(id) }).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        reject("No Results Found");
                    } else {
                        resolve(result[0]);
                    }
                });
            }
        });

        return promise;
    },

    getUserByEmail: function getUserByEmail(emailQuery) {

        var promise = new Promise(function(resolve, reject) {
            if (!db) {
                reject('ERROR.  No Connection');
            } else {
                var users = db.collection('users');
                users.find(emailQuery).toArray(function(err, result) {
                    console.log(result);
                    if (err) {
                        reject(err);
                    } else if( result.length === 0) {
                        reject("No Results Found");
                    } else {
                        resolve(result[0]);
                    }
                });
            }
        });

        return promise;
    },

    createNewUser: function createNewUser(user) {

        var promise = new Promise(function(resolve, reject) {
            var users = db.collection('users');

            if (!db) {
                reject('ERROR.  No Connection');
            } else {
                users.find({ email: user.email}).toArray(function(err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length > 0) {
                        reject("User already exists with " + user.email);
                    } else {
                        users.insert(user, function(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    }
                }.bind(this))
            }
        });

        return promise;

    }
};

module.exports = userAPI;