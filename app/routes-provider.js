var _ = require('underscore')
,fs = require('fs')
,path = require('path')
,Url = require('url')
,sext = require('sext')
//,Cache = require('./cache.js')
,Handlebars = require('handlebars')
,util = require('./helpers/util.js')
;

var routesMiddleware = null;

function Routes(app, config, routesConfig, cacheHeaders){
	// @todo: Stop passing stuff like config + cacheHeaders as refs;
	// 	these can simply be require()ed. Can pass overrides for tests
	var z = this;
	z.app = app;
	z.config = config;
	z.routesConfig = routesConfig;
	z.cacheHeaders = cacheHeaders;
	z.init();
}

Routes.prototype.init = function(){
	var z = this;
	routesMiddleware = require('./middleware/routes-middleware.js')(z.app,z.config);

	// @todo: delete this once sure dont need it in BaseController; would be better to be a singleton helper imho
	//	If end up using this, or making a helper, expose a route in server.js to flush cache
	//z.cache = Cache({
	//	max: 1000
	//	,maxAge: z.config.cmsTtl || 0
	//});

	z.routeDefaults = {
		method: 'get'
		,protocol: false // 'https' or false
		,restricted: false
		,controller: 'index'
		,action: 'index'
		,cacheLifetime: z.config.cdn.defaultRouteTtl || 0
	};

	if (z.app) { // optional for tests
		var controllers = z.loadControllersFromDirectory(path.join(z.app.get('app path'),'controllers'));
		z.mapRoutesToControllers(controllers);
	}

}

/*Routes.prototype.getCallback = function(obj,parts){
	for (var i=0,c=parts.length; i<c; ++i) {
		obj = obj[parts[i]];
		if (!obj) {
			return obj;
		}
	}
	return obj;
}*/

Routes.prototype.redirectToProtocol = function(protocol){
	return function(req,res,next){
		if (!protocol) protocol = 'http';

		// add client-side script to detect if protocol is different from the requested one, and redirect if needed
		res.addToHeader("\
			<script>\
				if (window.location.protocol !== '"+protocol+":') {\
					document.querySelector('html').style.display = 'none';\
					var _loc = window.location.href.replace(window.location.protocol, '"+protocol+":');\
					var params = window.location.search;\
					var qs = '';\
					var elem = document.createElement('a');\
					elem.href = document.referrer;\
					var referrer = elem.pathname;\
					if(referrer.charAt(0)=='/') referrer = referrer.substring(1);\
					if(/login|signup/.test(window.location.pathname)) {\
						if(referrer && referrer.length > 1) {\
							if(!/login|signup/.test(referrer)) {\
								if(params.length > 0) {\
									qs += '&';\
								} else {\
									qs += '?';\
								}\
								qs += 'referrer=' + encodeURIComponent(referrer);\
							}\
						}\
					}\
					window.location = _loc + qs;\
				}\
			</script>\
		");
		next();
	};
}

Routes.prototype.loadControllersFromDirectory = function(dir, routers){
	var z = this;
	if (typeof routers == 'undefined') routers = {};
	if (fs.existsSync(dir)) {
		var files = fs.readdirSync(dir);
		_.each(files,function(file){
			if (file.indexOf('.js') != -1) {
				var fileBaseName = path.basename(file, '.js');
				// insure the controller is only initialized once
				if (!routers.hasOwnProperty(fileBaseName)) {
					// initialize controller and pass dependencies
					console.log(' --- ', path.join(dir,fileBaseName));
					//var routeController = require(path.join(dir, fileBaseName))(z.config); // @todo: Get rid cache/Handlebars arg + require above unless causes problems with dep order
					var routeController = require(path.join(dir, fileBaseName));
					routers[fileBaseName] = routeController;
				}
			} else {
				throw new Error('Looks like '+file+' is a directory. Sorry but the route controllers do not currently support sub directories.');
			}
		});
	}
	return routers
}

Routes.prototype.mapRoutesToControllers = function(controllers, routes){
	var z = this;
	if (typeof routes == 'undefined') routes = z.routesConfig;

	console.log('\n=======================================\n');
	_.each(routes, function(route, index){
		route = sext(true, {}, z.routeDefaults, route);
		var key = route.key
			//,callback = z.getCallback(controllers, [route.controller,route.action])
			,callback = controllers[route.controller] && controllers[route.controller][route.action]
			,method = route.method.toLowerCase()
			,callbacks = []
		;

		callbacks.push(function(req,res,next){
			res.locals.page = key;
			if (route.pageData) res.locals.pageData = route.pageData;
			if (route.scripts) res.locals.scripts = route.scripts;
			if (route.template) res.locals.template = route.template;
			res.locals.isProduction = z.app.get('env') == 'production';
			next();
		});

		// redirect trailing slashes
		if (!route.noTrailingSlashRedirect) {
			callbacks.push(removeTrailingSlashes);
		}
		// redirect uppercase paths - prevent dup content
		if (!route.noCharacterCaseRedirect) {
			callbacks.push(enforceLowercasePath);
		}

		//console.log('\n\n----------------------------------\n', route.path, ' :: ', route.method, '\n----------------------------------\n\n');

		// gather references to middleware if the endpoint has any listed
		if (Array.isArray(route.middleware)) {
			_.each(route.middleware,function(name){
				callbacks.push(routesMiddleware[name]);
			});
		}

		if (!route.disabled) {

			// Match the route coming in
			var routePath = route.regex ? new RegExp(route.regex) : route.path;
			console.log('routePath',routePath,callback?'found controller method':'no controller method found');

			if (callback) {
				var config = z.app.get('config');
				if (config.https) {
					callbacks.push(z.redirectToProtocol(route.protocol));
				}

				if (route.redirectIfLoggedIn || route.redirectIfLoggedOut) {
					callbacks.push(function(req,res,next){
						res.locals.redirectIfLoggedIn = route.redirectIfLoggedIn;
						res.locals.redirectIfLoggedOut = route.redirectIfLoggedOut;
						next();
					});
				}

				// always try to set cache headers
				callbacks.push(z.cacheHeaders(route.cacheLifetime));

				// provide a serialized config model to the templates
				//callbacks.push(function(req,res,next){
				//	res.locals.siteConfig = z.app.get('config').toJSON();
				//	next();
				//});

				callbacks.push(callback);
			} else if (route.redirect) {
				callbacks.push(function(req,res,next){
					res.redirect(route.redirect);
				});
			} else {
				throw new Error('Callback not found for '+route.controller + '/'+ route.action);
			}
			//callbacks.forEach(function(f){ console.log(f.toString()); });
			z.app[method](routePath,callbacks);
		}
	});
}


module.exports = Routes;



function removeTrailingSlashes(req,res,next){
	var urlParts = req.parsedUrl()
		,pathname = urlParts.pathname
	;
	if (!pathname || pathname == '/') {
		return next();
	}
	while (pathname.charAt(pathname.length-1) == '/' && pathname != '/') {
		pathname = pathname.slice(0,-1);
	}
	if (pathname == urlParts.pathname || pathname == '') {
		return next();
	}
	res.redirect(301, req.url.replace(urlParts.pathname,pathname));
}

function enforceLowercasePath(req,res,next){
	var urlSplit = req.url.split('?');
	if (urlSplit[0].indexOf('.') != -1) {
		return next();
	}
	if (urlSplit[0] == urlSplit[0].toLowerCase()) {
		return next();
	}
	urlSplit[0] = urlSplit[0].toLowerCase();
	res.redirect(301, urlSplit.join('?'));
}

