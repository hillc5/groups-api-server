var mongo = require('mongodb').MongoClient,
    userApi = require('./mongo-user-api'),
    groupApi = require('./mongo-group-api');

var DB_CONFIG = require('../config/database.js');

var db = null;

var utilAPI = {

    connect: function connect() {
        console.log('Attempting to connect:', DB_CONFIG.url);
        var promise = new Promise(function(resolve, reject) {
            if (db) {
                console.log('Already connected to', DB_CONFIG.url);
                resolve();
            } else {
                mongo.connect(DB_CONFIG.url, function(err, database) {
                    if (err) {
                        console.err('ERROR connecting to', DB_CONFIG.url);
                        reject(err);
                    } else {
                        db = database;
                        console.log('Connection SUCCESS:', DB_CONFIG.url);

                        userApi.setDBConnection(db);
                        groupApi.setDBConnection(db);
                        resolve();
                    }
                });
            }
        });

        return promise;
    }
};

module.exports = utilAPI;