var environment = process.env.NODE_ENV;
var winston = require('winston');

// Set up the default console transport
var wconsole = winston.transports.Console;
if (winston.default.transports.console) {
	winston.remove(wconsole);
}

var options = {
	colorize: true
	,timestamp: true
};

if (environment != 'test') {
	winston.add(wconsole,options);
}

module.exports = winston;
