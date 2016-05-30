
var path = require('path')
,fs = require('fs')
//,config = require('../../config.js')
;

module.exports = {

	robots: function(req,res){
		// @todo: robots.txt should be .gitignored and value set via chef-deploy configs
		// for now, including in repo since we dont have public dev envs
		// NOTE: this route, and probly all system ctrl routes, should be excluded from cdn
		var robotsFile = path.join(res.app.get('app root'),'robots.txt')
		fs.readFile(robotsFile,function(err,data){
			//if (err && err.code != 'ENOENT') winston.error(err)
			if (err && err.code != 'ENOENT') console.log('ERROR',err)
			res.header('content-type','text/plain')
			res.end(data||'')
		})
	}

}