
var api = require('../helpers/api.js')
,config = require('../../config.js')
,_ = require('underscore')
;

module.exports = {

	index: function(req,res){
		var z = this
		,roleName = req.params.query || 'ios-developer'
		,pagLimit = 5
		,viewData = {
			title: config.siteName+' - Find Trusted Talent'
			,appendBrandToTitleTag: false
			,title0: 'ranktt.com'
			,title1: 'Top Experts in Los Angeles' // leaving "Experts" for now cuz is Homepage and could have diff focus
			,title2: 'Talent updated daily'
			,search: {
				roleOptions: []
				,roleOptionsDefault: roleName
				,subroleOptions: []
				,pagOffset: 0
				,pagLimit: pagLimit
			}
		}
		,role = null
		;

		api('roles',function(err,data){
			if (err || !Array.isArray(data)) {
				throw new Error(err || 'unexpected response from api: roles');
			}
			data.forEach(function(r){
				viewData.search.roleOptions.push({
					value: r.name
					,label: r.display_name
				});
			});

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
					viewData.title1 = 'Top '+role.display_name+'s in Los Angeles';
				}

				api('results',{role_id:role.id,offset:0,limit:pagLimit},function(err,data){
					if (err || !Array.isArray(data&&data.candidates)) {
						throw new Error(err || 'unexpected response from api: results');
					}
					viewData.search.results = data.candidates;
					res.render(res.locals.template, viewData);
				});
			});
		});

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
			// test loader graphic:
			//setTimeout(function(){res.render('partials/search-results', search);},2000);
			res.render('partials/search-results', search);
		});
	}

	,rubric: function(req,res){
		var viewData = {
			title: 'Rubric'
		};
		api('factors',function(err,data){
			if (err || !Array.isArray(data)) {
				throw new Error(err || 'unexpected response from api');
			}
			viewData.factors = data;
			res.render(res.locals.template, viewData);
		});
	}

	,contact: function(req,res){
		var viewData = {
			title: 'Contact Us'
		};
		res.render(res.locals.template, viewData);
	}

	,demo: function(req,res){
		var z = this, viewData = {};
		res.render('sup', viewData);
	}

}
