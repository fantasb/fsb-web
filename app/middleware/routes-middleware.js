
//
// This is to configure route specific middleware. Configure
// 	your middleware here then add the key to 'middleware'
// 	array in routes.coffee for any route to which you want
// 	it applied.
//
module.exports = function(app,config){
	return {
		'raw-body': require('./raw-body')
		//,'example': require('./example')()
		//,'example': require('./example')()
	};
}