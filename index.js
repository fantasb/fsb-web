// default to 'development' environment
if(process.env && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

module.exports = process.env.NOCLUSTER
	? require('./app/server.js')
	: require('./app/cluster.js')
;

