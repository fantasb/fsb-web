
var api = require('../helpers/api.js')
,config = require('../../config.js')
,_ = require('underscore')
;

// @todo: replace with api call
var defaultSearchOptions = {

}

module.exports = {

	index: function(req,res){
		var z = this
		,roleName = req.params.query || 'ios-developer'
		,pagLimit = 5
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
				,subroleOptions: []
				,pagOffset: 0
				,pagLimit: pagLimit
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

			viewData.search.roleId = role.id;
			viewData.search.roleName = role.display_name;
			if (req.params.query) {
				viewData.title = 'Top '+role.display_name+'s in Los Angeles, CA';
				viewData.appendBrandToTitleTag = true;
			}

			next();
		});

		function next(){
			api('results',{role_id:role.id,offset:0,limit:pagLimit},function(err,data){
				if (err || !Array.isArray(data&&data.candidates)) {
					throw new Error(err || 'unexpected response from api');
				}
				viewData.search.results = data.candidates;
				res.render(res.locals.template, viewData);
			});
		}

	}

	,searchResultsPartial: function(req,res){
		if (!(req.query.role_id && req.query.offset && req.query.limit && +req.query.limit <= 10)) {
			throw new Error('Invalid Input');
		}
		var search = {
			roleId: +req.query.role_id
			,pagOffset: +req.query.offset
			,pagLimit: +req.query.limit
			,dontWrap: true
			,noResultsCopy: 'Result limit reached'
		};
		res.locals.layout = false;
		api('results',{
			role_id: search.roleId
			,offset: search.pagOffset
			,limit: search.pagLimit
		},function(err,data){
			if (err || !Array.isArray(data&&data.candidates)) {
				throw new Error(err || 'unexpected response from api');
			}
			search.results = data.candidates;
			//setTimeout(function(){res.render('partials/search-results', search);},2000);
			res.render('partials/search-results', search);
		});
	}

	,demo: function(req,res){
		var z = this, viewOpts = {};
		res.render('sup', viewData);
	}

}
