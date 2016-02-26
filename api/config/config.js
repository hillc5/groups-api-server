/* eslint-disable */
var clientMap = {
    development: { origin: 'http://localhost:' + process.env.PORT },
    production: { origin: 'http://localhost:3000' }
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