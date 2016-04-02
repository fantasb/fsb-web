//
// Middleware function to allow management of metatags
// @todo make more robust; this certainly will not be the final stage of this
//			 module, but things to add: append / prepend, overwrite tag
//
var path = require('path')
,routesConfig = require('../../config/routes.json')
,_ = require('underscore')
,util = require('../helpers/util.js')
;

module.exports = function(options){
	if (!options || typeof options != 'object') options = {};

	return function(req,res,next){
		if (!res.locals.metatags) res.locals.metatags = '';

		res.addMetaTag = function(props){
			if (typeof props != 'object') return false;
			var metatag = [];
			_.each(props,function(v,k){
				if (typeof v != 'string') {
					v = JSON.stringify(v);
				}
				v = util.sanitizeHtmlTagProperty(v);
				metatag.push(k+'="'+v+'"');
			});
			res.locals.metatags += '<meta '+metatag.join(' ')+' />\n';
		}

		res.addMetaTags = function(metatags){
			if (typeof metatags != 'object') return false;
			_.each(metatags,function(metatag){
				res.addMetaTag(metatag);
			});
		}

		// @todo: refactor this
		// I used to explicitly call this in each controller method, but seems silly if we have per-route meta tags
		res.makeMetaTags = function(pageCustomTags,pagePath){
			if (typeof pagePath == 'undefined') pagePath = '';
			return ''
		}

		res.makeAbsoluteBaseUrl = function(){
			// dont need to strip trailing slash, should be covered by redirect. @todo: confirm this
			return 'http://'+res.app.locals.fullDomain+req.path;
		}

		next();
	};
}

