
var http = require('http')
//,querystring = require('querystring')
,querystring = require('qs') // Handles nested data structures unlike native querystring module
,Url = require('url')
,config = require('../../config.js')
,winston = require('winston')
,apiConfig = null
;

module.exports = function(/* method must come after url */){
	var apiConfig = getApiConfig(), method, url, data, cb, endpointOverride
	for (var i=0;i<arguments.length;++i) {
		switch (typeof arguments[i]) {
			case 'string': url&&method ? endpointOverride = arguments[i] : url ? method = arguments[i].toUpperCase() : url = arguments[i]; break;
			case 'object': data = arguments[i]; break;
			case 'function': cb = arguments[i]; break;
		}
	}
	if (!method) method = 'GET'
	data = data ? querystring.stringify(data) : '';
	if (data && method == 'GET') {
		url += (url.indexOf('?') == -1 ? '?' : '&') + data;
	}
	if (endpointOverride) {
		apiConfig = parseApiEndpoint(endpointOverride)
	}
	//winston.debug('api', method, apiConfig.hostname+(apiConfig.port?':'+apiConfig.port:'')+apiConfig.path + (url[0] == '/' ? url.substr(1) : url), data);

	var buf = new Buffer(0)
	,done = function(err,res){
		if (!cb) return;
		var data, undef
		if (err) {
			(data = err).error = data.error || data.message || 'unknown';
		} else {
			try {
				data = JSON.parse(res.toString())
			} catch (e) {
				winston.error('api bad response', requestOpts, res.toString());
				data = {error:'unexpected response from api', code:0}
			}
		}
		data.error === undef ? cb(false,data) : cb(data);
		cb = null;
	}

	var requestOpts = {
		hostname: apiConfig.hostname
		,port: apiConfig.port
		,path: apiConfig.path + (url[0] == '/' ? url.substr(1) : url)
		,method: method
		,headers: {}
	};
	if (apiConfig.userKey) {
		requestOpts.headers['authorization'] = 'Basic '+apiConfig.userKey;
	}
	if (method == 'POST') { // if api client doesn't listen for multi-part data
		requestOpts.headers['content-type'] = 'application/x-www-form-urlencoded';
		requestOpts.headers['content-length'] = Buffer.byteLength(data)
	}
	var req = http.request(requestOpts,function(res){
		res.on('data',function(data){
			buf = Buffer.concat([buf,data])
		})
		.on('end',function(){
			done(false,buf)
		})
		.on('error',function(err){
			done(err)
		})
	})
	.on('error',function(err){
		done(err)
	})

	req.write(method == 'GET' ? '' : data);
	req.end();
}

function getApiConfig(){
	if (!apiConfig) {
		apiConfig = parseApiEndpoint(config.api.endpoint)
		if (config.api.basicAuthKey) {
			apiConfig.userKey = new Buffer(config.api.basicAuthKey).toString('base64')
		}
	}
	return apiConfig
}

function parseApiEndpoint(url){
	return Url.parse(url)
}


