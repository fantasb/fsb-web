

module.exports = {

	index: function(req,res){
		var z = this
			,viewData = {}
		;
		//console.log('HOME CONTROLLER!!!', 'index', res.locals);
		viewData.roleOptions = [
			{value:1, label:'iOS Developer'}
			,{value:2, label:'Recruiter'}
			,{value:3, label:'Exotic Dancer'}
		];
		res.render(res.locals.template, viewData);
	}

	,demo: function(req,res){
		var z = this, viewOpts = {};
		res.render('sup', viewData);
	}

}
