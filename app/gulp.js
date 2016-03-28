
var cp = require('child_process')
;

module.exports = function(opTask, cb){
	if (!(cb instanceof Function)) {
		if (opTask instanceof Function) {
			cb = opTask;
			opTask = null;
		} else {
			cb = function(){};
		}
	}

	var env = process.env.NODE_ENV;

	// Only call Gulp for devs, else package postinstall takes care of it
	if (env && env == 'production') return;

	// Using dev-nocss for test env
	var gulpTask = process.env.GULP_TASK; // mostly to support the dev-ie task so css is blessed when developing for ie9
	var task = opTask || gulpTask ||
		//((env == 'development' || env == 'test') ? 'dev-nocss' : 'default');
		((env == 'development' || env == 'test') ? 'dev' : 'default');
	var child = cp.exec(process.cwd()+'/node_modules/.bin/gulp '+task, cb);

	console.log('Gulp Task: ', task);

	// Monitor process...
	var message = '';
	child.stdout.on('data', function(outputChunk){
		message += outputChunk + '\n';
		outputChunk = outputChunk.replace(/\n/g,'');

		if (/Warning:/.test(outputChunk)) {
			// Find the Stack Trace related to this warning
			var stackTrace = message.substring(message.lastIndexOf('Running "'));
			console.error('Gulp :: '+outputChunk, stackTrace);
			return;
		} else if (/Aborted due to warnings./.test(outputChunk)) {
			console.error('Gulp :: ', outputChunk, stackTrace);
			console.error('*-> An error occurred-- please fix it.');
		} else if (/ParseError/.test(outputChunk)) {
			console.error('Gulp :: ', outputChunk, stackTrace);
		} else if (outputChunk != '') {
			console.log(outputChunk);
		}
	});

	var logError = function(err){
		console.error('Gulp :: '+err);
	}
	child.stdout.on('error',logError);
	child.stderr.on('data',logError).on('error',logError);
}


