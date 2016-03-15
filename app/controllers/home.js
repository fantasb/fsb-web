

module.exports = {

	index: function(req,res){
		var z = this
			,viewData = {}
		;
		console.log('HOME CONTROLLER!!!', 'index', res.locals);
		res.render(res.locals.template, viewData);
	}

}
