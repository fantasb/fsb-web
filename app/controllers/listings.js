
var api = require('../helpers/api.js')
//,config = require('../../config.js')
//,_ = require('underscore')
;

module.exports = {

	index: function(req,res){
		var z = this
		,viewData = {
			title: 'Candidate Listings by Role and Location'
			,title0: ''
			,title1: 'Candidate Listing'
			,title2: 'By Role and Location'
			,roles: []
		}
		;
		api('roles',function(err,data){
			if (err || !Array.isArray(data)) {
				throw new Error(err || 'unexpected response from api: roles');
			}
			viewData.roles = data;
			var description = 'Browse talent by role and location'
				//,keywords = ''
			;
			res.addMetaTags([
				{ name:'description', content:description },
				//{ name:'keywords', content:keywords },
				{ property:'og:url', content:res.absoluteBaseUrl() },
				{ property:'og:title', content:viewData.title }
			]);

			res.render(res.locals.template, viewData);
		});
	}

}
