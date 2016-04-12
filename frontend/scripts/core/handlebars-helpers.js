
module.exports = function(){
	// @todo: #reqFix01 + though consider extra payload if underscore and util.js are required
	var helpers = require('./../../../app/handlebars/helpers.js')(null, null);
	$.each(helpers,function(name,fn){
		Handlebars.registerHelper(name,fn);
	});
}
