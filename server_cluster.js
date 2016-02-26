var cluster = require('cluster'),
    log = require('./api/util/api-util').Logger,
    start;

function startWorker() {
    var worker = cluster.fork();
    log.info('CLUSTER: Worker %d started', worker.id);
}

if (cluster.isMaster) {

    require('os').cpus().forEach(function() {
        startWorker();
    });

    cluster.on('disconnect', function(worker) {
        log.info('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });

    cluster.on('exit', function(worker, code, signal) {
        log.info('CLUSTER: Worker %d died with exit code %d (%s)', worker.id, code, signal);
        startWorker();
    });

} else {
    start = require('./server');
    start(); // for clarity
}