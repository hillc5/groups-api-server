/* eslint-disable */

var devWhiteList = [ 'http://localhost:8080', 'http://localhost:4200' ];
var clientMap = {
    development: {
        origin: function(origin, callback) {
            var isWhiteListed = devWhiteList.indexOf(origin) !== -1;
            callback(null, isWhiteListed);
        }
    },
    production: { origin: 'http://localhost:8080' }
};

var auth = require('./auth');
var environment = process.env.NODE_ENV;

module.exports = {
    env: environment,
    port: process.env.PORT,
    client: clientMap[environment],
    logFormat: process.env.LOG_FMT,
    signature: auth[environment].signature,
    tokenExpires: auth[environment].tokenExpires,
    saltFactor: auth[environment].saltFactor
};
/* eslint-enable */