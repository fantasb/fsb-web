var api = require('../helpers/api.js')
,config = require('../../config.js')
,_ = require('underscore')
;

module.exports = {

	index: function(req,res){
		var viewData = {
			title: 'WYD Intracompany Links'
		};
		res.locals.layout = false;
		res.render(res.locals.template, viewData);
	}

}