var cluster = require('cluster')
,os = require('os')
,_ = require('underscore')
,winston = require('./winston.js')
,config = require ('../config.js')
;

if (cluster.isMaster) {
	var timeout = {};

	timeout.wait = config.workerTimeout || 5000;

	// Emitted when a new worker is created
	cluster.on('fork', function(worker){
		winston.debug('Worker #'+worker.id+': Freshly forked');
	});

	// Emitted when a new worker is added to the load balancer
	cluster.on('listening', function(worker,address){
		if (address.addressType == 'udp4' || address.addressType == 'udp6') {
			return;
		}
		winston.debug('Worker '+worker.id+': Listening on '+address.port);
	});

	// Emitted when a worker process has been removed from the load balancer
	cluster.on('disconnect', function(worker){
		winston.info('Worker '+worker.id+': Removed from the cluster');
		if (timeout[worker.id]) return; // Worker `exit`ed before `disconnect`ing

		// Set a timer to clear stalled exits
		timeout[worker.id] = setTimeout(function(){
			winston.warn('Worker '+worker.id+': Refused to exit; terminating');
			worker.destroy();
		},timeout.wait);
	});

	// Emitted when a worker process exits completely
	cluster.on('exit', function(worker){
		winston.info('Worker '+worker.id+': Exited '+(worker.suicide ? '' : 'unexpectedly'));
		if (!worker.suicide) {
			cluster.fork(); // Reboot crashed children
		} else { // Timers for stuck processes - clear em if they exist
			if (timeout[worker.id]) {
				clearTimeout(timeout[worker.id]);
			} else {
				timeout[worker.id] = true; // Otherwise, prevent one from being set (we `exited` before `disconnect`ing)
			}
		}
	});

	// We have workers with old code, and we want workers with node code; one by
	// one, move the workers out of the cluster and replace them with new workers
	// with new code
	function restart(){
		function reboot(worker){
			winston.debug('Worker '+worker.id+': Spinning up replacement');
			var replacement = cluster.fork();
			replacement.on('listening',function(){
				winston.debug('Worker '+worker.id+': Replacement\'s running; terminating');
				worker.disconnect();
			});
		}
		winston.info('Master: Got upgrade request, replacing workers');
		_.each(cluster.workers,function(worker){
			reboot(worker);
		});
	}

	// Shutdown will disconnect all workers, and if you want to immediately
	// disconnect, rebind SIGTERM to immediately exit
	function shutdown(){
		winston.info('Master: Got shutdown request, disconnecting workers');
		cluster.disconnect();
		// Next time we are called, immediately exit
		cluster.removeAllListeners('SIGTERM');
		cluster.on('SIGTERM', process.exit);
	}

	// Bind up process events for production use, and `cluster` events so we can
	// test this. Since we can't mock process, we proxy events onto cluster
	process.on('SIGHUP',  restart);  cluster.on('SIGHUP',  restart);
	process.on('SIGTERM', shutdown); cluster.on('SIGTERM', shutdown);

	// ^C should send SIGTERM
	process.on('SIGINT', function(){
		process.emit('SIGTERM');
	});

	function handleMessage(msg){
		// propagate flush to all workers
		if (msg && msg.type == 'flush') {
			Object.keys(cluster.workers).forEach(function(workerId){
				if (workerId != msg.worker) {
					cluster.workers[workerId].send(msg);
				}
			});
		}
	}

	// Fork us up some instances.
	_.each(os.cpus(),function(cpu){
		var w = cluster.fork()
		if (w) {
			w.on('message',handleMessage);
		}
	});

} else {
	// !cluster.isMaster...
	var worker = cluster.worker
		,domain = require('domain').create()
	;

	// Wrap our spawned server so we can manage errors it doesn't catch
	domain.on('error', function(err){
		var output = {
			message: err.message
			,stack: err.stack
		};
		winston.error(JSON.stringify(output,null,2));
		worker.process.exit(1); // Crash the child process and force a re-spawn
	});
	domain.run(function(){
		require('./server.js');
	});
}



