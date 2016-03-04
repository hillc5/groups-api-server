var mongo = require('mongodb').MongoClient,
    Promise = require('es6-promise').Promise,
    authAPI = require('./mongo-auth-api'),
    userAPI = require('./mongo-user-api'),
    groupAPI = require('./mongo-group-api'),
    logger = require('../util/api-util').Logger;

var DB_CONFIG = require('../config/database.js');

var db = null;

var utilAPI = {

    connect: function() {
        logger.info('Attempting to connect:', DB_CONFIG.url);
        var promise = new Promise(function(resolve, reject) {
            if (db) {
                logger.info('Already connected to', DB_CONFIG.url);
                resolve();
            } else {
                mongo.connect(DB_CONFIG.url, function(err, database) {
                    if (err) {
                        logger.error('ERROR connecting to', DB_CONFIG.url);
                        reject(err);
                    } else {
                        db = database;
                        logger.info('Connection SUCCESS:', DB_CONFIG.url);

                        userAPI.setDBConnection(db);
                        groupAPI.setDBConnection(db);
                        authAPI.setDBConnection(db);

                        resolve();
                    }
                });
            }
        });

        return promise;
    }
};

module.exports = utilAPI;