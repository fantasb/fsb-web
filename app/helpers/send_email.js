
var nodeMailer = require('nodemailer')
,config = require('../../config.js')

module.exports = function(to, subject, body, cb){
	var transport,msg,from;
	if (config.mailTransport == 'ses') {
		transport = require('nodemailer-ses-transport')({
			accessKeyId: config.awsAccessKey
			,secretAccessKey: config.awsAccessSecret
			,region: config.awsRegion
		});
		from = config.sesMailFrom;
	} else if (config.mailTransport == 'gmail') {
		transport = {
			service: 'Gmail'
			,auth: {
				user: config.gmailUser
				,pass: config.gmailPass
			}
		};
	}
	if (!transport)
		return process.nextTick(function(){
			cb('missing mailTransport config');
		});

	if (typeof(to) == 'object') {
		msg = to;
		cb = subject;
	} else {
		msg = {
	    to: to
	    ,subject: subject
	    ,text: body
		};
	}
	if (!msg.from && from)
		msg.from = from;
	nodeMailer.createTransport(transport).sendMail(msg,cb);
}

