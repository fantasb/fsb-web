//
// Middleware to collect the body from request.
// @todo: stop blocking. instead bind to collected event #likeThis
//

module.exports = function(req,res,next){
	var data = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		req.rawBody = data;
		next();
	});
}



/* #likeThis
// Next bit is a hack so it can still function as a middleware...
module.exports = function(req,res,next){
	collect(req);
	next();
});

function collect(req){
	if (req.collectingRawBody) return;
	req.collectingRawBody = true;
	var body = new Buffer(0);
	req.on('data', function(chunk){
		body = Buffer.concat([body,chunk]);
	req.on('end', function(){
		req.emit('rawbody', body);
	});
}

// or dont be a middleware at all...
module.exports = function(req,cb){
	if (!req || req._rawBody) {
		return process.nextTick(function(){
			cb(req && req._rawBody)
		});
	}
	(req._rawBodyQueue || (req._rawBodyQueue = [])).push(cb)
	if (req._rawBodyQueue.length == 1) {
		var body = new Buffer(0);
		req.on('data', function(chunk){
			body = Buffer.concat([body,chunk]);
		});
		req.on('end', function(){
			req._rawBody = body;
			for (var i=0,c=req._rawBodyQueue.length;i<c;++i) {
				req._rawBodyQueue[i](body);
			}
			delete req._rawBodyQueue;
		});
	}
}
// usage: require('raw-body')(req.method=='POST'&&req, (requestBody) -> ...);
*/
