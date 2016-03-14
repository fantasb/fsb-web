
module.exports = function(){
	var shuttingDown = false;
	process.on('SIGINT',function(){
		shuttingDown = true;
	});

	//
	// Handling persistent connections
	// Once a client connects, it sets up a socket without a timeout. To preserve
	// resources, we should set a sane timeout in the config so we don't hold
	// connections open indefinitely.
	//
	// In addition, once we've started shutting down, all connections should
	// terminate immediately after sending their payload
	//
	return function(req,res,next){
		var config = req.app.get('config');

		req.socket.setTimeout(config.socketTimeout); // Shut down after N seconds
		if (shuttingDown) {
			res.setHeader('Connection', 'close'); // Shut down once sending data
		}
		next();
	};
}
