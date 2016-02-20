var Promise = require('es6-promise').Promise,
    bcrypt = require('bcrypt'),
    uuid = require('node-uuid'),
    SLT_FCTR = 14;

var db = null;
var authCollection = null;

function encrypt(phrase) {

    var promise = new Promise(function(resolve, reject) {

        bcrypt.genSalt(SLT_FCTR, function(err, salt) {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(phrase, salt, function(err, hash) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        })
    });

    return promise;
}

var authAPI = {

    setDBConnection: function setDBConnection(connection) {
        db = connection;
        authCollection = db.collection('userauth');
        console.log('MONGO: Auth API ONLINE');
    },

    storeUserCredentials: function storeUserCredentials(email, password) {
        var promise = new Promise(function(resolve, reject) {

            authCollection.find({ email: email }).toArray(function(err, result) {
                if (err) {
                    reject(err);
                } else if (result.length !== 0) {
                    reject("User already exists with " + email);
                } else {
                    encrypt(password).then(function(hash) {
                        var secret = uuid.v4();
                        authCollection.insert({ email: email, password: hash, secret: secret }, function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve('SUCCESS');
                            }
                        });
                    }).catch(function(error) {
                        reject(error);
                    });
                }
            });


        });

        return promise;
    },


    validateUser: function validateUser(email, password) {

        var promise = new Promise(function(resolve, reject) {
            authCollection.find({ email: email }).toArray(function(err, result) {
                var secret = result.secret,
                    name = result.name;
                if (err) {
                    reject(err);
                } else if (result.length === 0) {
                    reject('There is no user with that email address');
                } else {
                    bcrypt.compare(password, result[0].password, function(err, result) {
                        if (err) {
                            reject(err);
                        } else if (result === false) {
                            reject('Incorrect Password');
                        } else {
                            resolve({ name: name, secret: secret });
                        }
                    })
                }
            });
        });

        return promise;
    }


};

module.exports = authAPI;