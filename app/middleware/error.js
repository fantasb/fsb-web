var fs = require('fs')
,path = require('path')
,winston = require('winston')
;

// Here we fetch all the views/error/*.html files and attempt to load them into
// memory. This is handy as we can then serve them back in the future without
// hitting the file system, which may be unavailable
function fetchStaticFiles(viewpath){
	var templates = {};
	fs.readdirSync(viewpath).filter(function(file){
		return path.extname(file) == '.html';
	}).forEach(function(file){
		var status = path.basename(file).replace(path.extname(file),'');
		templates[status] = fs.readFileSync(path.join(viewpath,file),'utf8');
	});
	return templates;
}

module.exports = function(viewpath){
	var error = {}
	viewpath = viewpath || path.join(__dirname+'/..','views/error');
	var templates = fetchStaticFiles(viewpath);

	return function(err,req,res,next){
		// normalize...
		if (!(err instanceof Error)) {
			err = new Error(err);
		}
		error.message = err.message;
		error.stack = err.stack;

		// Capture the route for debugging purposes
		error.route = "#{if req.method? then req.method.toUpperCase() else ''} #{req.url}"

		// Default to error 500 if no error status was set
		if (res.statusCode < 400 || res.statusCode > 599) {
			res.statusCode = 500;
		}

		// Log it
		winston.error(JSON.stringify(error,null,2));

		// If we have the template in memory, serve it directly, else, hit the
		// file system to look for a matching views/errors/{res.status}.hbs file
		if (templates[res.statusCode])
			return res.send(templates[res.statusCode]);
		res.render('error/'+res.statusCode, {error: error});
	};
}

