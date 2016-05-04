//
// Middleware function to allow management of metatags
//
// Global metatags can be set via config.globalMetaTags
// Route-specific metatags I prefer to set at controller only
// 	Supporting in routes config ends up being too confusing re logic responsibility
//
var _ = require('underscore')
,util = require('../helpers/util.js')
,config = require('../../config.js')
,routesConfig = require('../../config/routes.json')
;

module.exports = function(options){
	if (!options || typeof options != 'object') options = {};

	return function(req,res,next){
		res.locals.metatags = '';

		res.addMetaTag = function(props){
			if (typeof props != 'object' || !props) return false;
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
			if (typeof metatags != 'object' || !metatags) return false;
			_.each(metatags,function(metatag){
				res.addMetaTag(metatag);
			});
		}

		res.addCanonicalUrl = function(url){
      if (typeof url != 'string') return;
      var canonicalUrl = url.indexOf('http://') == -1 ? 'http://'+url : url;
      res.locals.metatags += '\n<link rel="canonical" href="'+canonicalUrl+'" />';
		}

		var absoluteBaseUrl;
		res.absoluteBaseUrl = function(){
			// dont need to strip trailing slash, should be covered by redirect. @todo: confirm this
			return absoluteBaseUrl = (absoluteBaseUrl || util.absolutifyUrl(req.path));
		}

		res.addMetaTags(config.globalMetaTags);

		next();
	};
}

