
var api = require('../helpers/api.js')
,config = require('../../config.js')
,querystring = require('qs')
//,_ = require('underscore')
;

module.exports = {

	index: function(req,res){
		// @todo: pipe to real api
	}

	,contactCandidate: function(req,res){
		// #DEMO
		var data = collectPostData(req);

		if (!(data.candidate_id && data.email && data.msg_subject && data.msg_body)) {
			return error(101,'Missing Input',req,res);
		}

		// @todo: write to db
		// @todo: send notif to slack?

		require('../helpers/send_email.js')('tech@ranktt.com', 'Candidate Interest', JSON.stringify(data), function(err,data){
			if (err) {
				console.log('ERROR',err);
				return error(120,'Error sending email',req,res);
			}
			success({},req,res);
		});
	}

}

// BEGIN for #DEMO api calls
function collectPostData(req){
	var data
	try {
		data = querystring.parse(req.rawBody)
	} catch (e) {}
	return (data && typeof data == 'object') ? data : {};
}
function error(code,msg,req,res){
	res.statusCode = 500;
	respond({error:msg,code:code||0},req,res);
}
function success(data,req,res){
	res.statusCode = 200;
	respond(data,req,res);
}
function respond(data,req,res){
	res.setHeader('content-type', 'application/json');
	res.end(JSON.stringify(data));
}
// END for #DEMO api calls
