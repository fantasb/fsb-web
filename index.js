// default to 'development' environment
if(process.env && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

process.chdir(__dirname); // so index.js can be called outside repo root and process.cwd() still functions
module.exports = process.env.NOCLUSTER
	? require('./app/server.js')
	: require('./app/cluster.js')
;

