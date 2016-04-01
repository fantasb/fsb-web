
var api = require('../helpers/api.js')
,config = require('../../config.js')
,_ = require('underscore')
;

module.exports = {

	index: function(req,res){
		var z = this
			,viewData = {
				title: config.siteName+' - Find Trusted Talent'
				,appendBrandToTitleTag: false
			}
		;
		//console.log('HOME CONTROLLER!!!', 'index', res.locals);
		viewData.search = {
			roleOptions: [
				{value:1, label:'iOS Developer'}
				,{value:2, label:'Recruiter'}
				,{value:3, label:'Exotic Dancer'}
			]
			,roleOptionsDefault: 1
			,subroleOoptions: []
		};
		viewData.search.roleName = _.findWhere(viewData.search.roleOptions, {value:viewData.search.roleOptionsDefault}).label;

		api('results',{role_id:viewData.search.roleOptionsDefault},function(err,data){
			if (err || !Array.isArray(data&&data.candidates)) {
				throw new Error(err || 'unexpected response from api');
			}
			viewData.search.results = data.candidates;
			res.render(res.locals.template, viewData);
		});

	}

	,demo: function(req,res){
		var z = this, viewOpts = {};
		res.render('sup', viewData);
	}

}
