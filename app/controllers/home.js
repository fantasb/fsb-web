
var api = require('../helpers/api.js')
,config = require('../../config.js')
,_ = require('underscore')
;

module.exports = {

	index: function(req,res){
		var z = this
		,roleName = req.params.query || 'ios-developer'
		,viewData = {
			title: config.siteName+' - Find Trusted Talent'
			,appendBrandToTitleTag: false
			,search: {
				roleOptions: [
					{value:'ios-developer', label:'iOS Developer'}
					,{value:'recruiter', label:'Recruiter'}
					,{value:'exotic-dancer', label:'Exotic Dancer'}
				]
				,roleOptionsDefault: roleName
				,subroleOoptions: []
			}
		}
		,role = null
		;

		api('role',{name:roleName},function(err,data){
			if (err) {
				// @todo: #seo Throw 404 if err is not found
				throw new Error(err);
			}
			role = data;

			viewData.search.roleName = role.display_name;
			if (req.params.query) {
				viewData.title = 'Top '+role.display_name+'s in Los Angeles, CA';
				viewData.appendBrandToTitleTag = true;
			}

			next();
		});

		function next(){
			api('results',{role_id:role.id},function(err,data){
				if (err || !Array.isArray(data&&data.candidates)) {
					throw new Error(err || 'unexpected response from api');
				}
				viewData.search.results = data.candidates;
				res.render(res.locals.template, viewData);
			});
		}

	}

	,demo: function(req,res){
		var z = this, viewOpts = {};
		res.render('sup', viewData);
	}

}
