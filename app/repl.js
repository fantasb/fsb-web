var replify = require('replify');
module.exports = function(name){
	name = name+'';
	var opts = {name:'fsb'+(name.length?'_'+name:''),path:__dirname+'/../'};
	replify(opts,global);
}
