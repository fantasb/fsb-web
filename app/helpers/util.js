
var _ = require('underscore')
,querystring = require('querystring')
,waiter = require('./waiter.js')
;

module.exports = {

	getFirstChild: function(o){
		var undef;
		for (var k in o) return o[k];
		return undef;
 	}

	,getFirstKey: function(o){
		var undef;
		for (var k in o) return k;
		return undef;
	}

	,padZ: function(n,m){
		if (typeof m == 'undefined') m = 2;
		while ((n+'').length < m) n = '0'+n;
		return n;
	}

	// BEGIN time stuffs
	,_months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

	,formatArticleTimestamp: function(timestamp){
		// this is the one we change alongside business rules
		var d = new Date(timestamp), undef;
		if (!d || !d.getDate) {
			return undef;
		}
		var now = new Date;
		// display "[time] ago" format if posted today or over 2 years ago...
		//if (d < (new Date).setFullYear(now.getFullYear()-2) || d > (new Date).setDate(now.getDate()-1))
		// display "[time] ago" format if posted today...
		if (d > (new Date).setDate(now.getDate()-1)) {
			return this.formatTimeAgo(d);
		}
		// else display MMM DD, YYYY format...
		return this.formatDateTime(d);
	}

	,formatDateTime: function(timestamp,utc){
		var d = new Date(timestamp)
			,hours = utc ? d.getUTCHours() : d.getHours()
			,mer = 'am'
			,month
		;
		if (hours > 12) {
			hours -= 12;
			mer = 'pm';
		}
		month = this._months[ utc ? d.getUTCMonth() : d.getMonth() ];
		return utc
			? month+' '+d.getUTCDate()+', '+d.getUTCFullYear()+', '+hours+':'+this.padZ(d.getUTCMinutes())+mer+' UTC'
			: month+' '+d.getDate()+', '+d.getFullYear()+', '+hours+':'+this.padZ(d.getMinutes())+mer
		;
		//return utc
		//	? this.padZ(d.getUTCMonth()+1)+'/'+this.padZ(d.getUTCDate())+'/'+d.getUTCFullYear()+' '+hours+':'+this.padZ(d.getUTCMinutes())+mer+' UTC'
		//	: this.padZ(d.getMonth()+1)+'/'+this.padZ(d.getDate())+'/'+d.getFullYear()+' '+hours+':'+this.padZ(d.getMinutes())+mer
		//;
	}

	,formatTimeAgo: function(timestamp,now){
		if (typeof timestamp == 'string' && isNaN(timestamp)) {
			timestamp = new Date(timestamp);
		}
		if (timestamp instanceof Date) {
			timestamp = Math.round(+timestamp/1000);
		}
		if (typeof now == 'string' && isNaN(now)) {
			now = new Date(now);
		}
		if (now instanceof Date) {
			now = +now;
		}
		if (typeof now == 'undefined') {
			now = Math.round(+new Date/1000);
		}
		var secs = now - timestamp;
		var intervals = [
			['year',31536000]
			['month',2628000]
			['week',604800]
			['day',86400]
			['hour',3600]
			['minute',60]
		];
		if (secs < 0) secs = 0;
		for (var i=0;i<intervals.length;++i) {
			var interval = intervals[i];
			var ago = Math.floor(secs/interval[1]);
			if (ago > 0) {
				str = ago+' '+interval[0]+(ago==1?'':'s')+' ago';
				break;
			}
		}
		if (typeof str == 'undefined') {
			str = 'just now';
		}
		return str;
	}
	// END time stuffs

	,formatPlace: function(num){
		var numPos = Math.abs(num);
		var lastChar = (num+'').substr(-1);
		if (num == 0) return '0th';
		if (numPos > 10 && numPos < 20) suffix = 'th';
		else if (lastChar == 1) suffix = 'st';
		else if (lastChar == 2) suffix = 'nd';
		else if (lastChar == 3) suffix = 'rd';
		else suffix = 'th';
		return num+suffix;
	}

	,capitalize: function(str,isName){
		var z = this;
		if (typeof str != 'string') {
			return str;
		}
		var words = str.split(' ');
		_.each(words,function(word,i){
			if (!word) {
				return;
			}
			words[i] = word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
			if (isName) {
				// charAt faster than substr
				var f2 = word.charAt(0) + word.charAt(1)
					,f3
				;
				if (f2 == 'Mc' || f2 == 'O\'') {
					words[i] = f2+word[2].toUpperCase() + word.substr(3);
				} else if ((f3 = f2+word.charAt(2)) == 'Mac') {
					words[i] = f3+word[3].toUpperCase() + word.substr(4);
				}
				if (word.indexOf('-') != -1) {
					words[i] = z.capitalize(word.replace(/-/g,' '), true).replace(/ /g,'-');
				}
			}
		});
		return words.join(' ');
	}

	,buildCurl: function(url,data){
		// useful for console.log()ing api requests
		url += (url.indexOf('?') == -1 ? '?' : '&') + querystring.stringify(data);
		return "curl '"+url+"' -H 'Referer: http://www.fsb.com' && echo";
	}

	,stripTags: function(str){
		// simple > fancy
		return (str||'').replace(/<[^>]*>/g,'');
	}

	,sanitizeHtmlTagProperty: function(str){
		// assumes value will be wrapped in double quotes
		return this.stripTags((str||'').replace(/(\r\n)|(\n\r)|\n|\r/gm,' ').replace(/"/g,'\'').trim());
	}

	,absolutifyUrl: function(url,forceHttps){
		// simple == safe: only absolutify if first character is '/' and second char is not '/'
		if (url && typeof url == 'string') {
			if (url[0] == '/' && url[1] != '/') {
				var app = waiter.get('app');
				if (app && app.locals && app.locals.fullDomain) { // @todo: implement this in vhost.js
					url = 'http://'+app.locals.fullDomain+url;
				}
			}
			if (forceHttps) {
				url = url.replace(/^((http:)?\/\/)/, 'https://');
			}
		}
		return url;
	}

	,pretty404: function(req,res){
		var viewData = {
			title: '404 Page Not Found'
		};

		res.locals.scripts = null;
		res.statusCode = 404;
		res.render('error/pretty-404',viewData);
	}

	,reqIsFromFbScraper: function(req){
		var userAgent = req && req.headers && req.headers['user-agent'];
		return typeof userAgent == 'string'
			? (userAgent == 'Facebot' || userAgent.indexOf('facebookexternalhit') == 0)
			: false
		;
	}


	,_uniq: {}
	// unique number for given request
	,uniq: function(k){
		if (!this._uniq[k]) {
			this._uniq[k] = 0;
		}
		return ++this._uniq[k];
	}
	,luniq: function(k){
		return this._uniq[k];
	}
	,resetUniq: function(){
		this._uniq = {};
	}

}

