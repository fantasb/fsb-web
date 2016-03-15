
var _ = require('underscore')
,express = require('express')
,path = require('path')
,Url = require('url')
,winston = require('winston')
,toobusy = require('toobusy')
,Domain = require('domain')
//,crisper = require('data-crisper')

var util = require('./helpers/util.js')
,config = require('../config.js')
//,waiter = require('./helpers/waiter.js') // @todo: deprecate
,tracking = require('./helpers/tracking.js')
,errorHandler = require('./middleware/error.js')
,keepalive = require('./middleware/keepalive.js')
,cacheHeaders = require('./middleware/cache.js')
,metaTagMiddleware = require('./middleware/metatags.js')
,Routes = require('./routes-provider.js')
,HBS = require('./handlebars')


exports.create = function(platform, appName, opts){
	//opts = sext({}, config, opts);
	var app = express();
	var hbs = new HBS();

	toobusy.maxLag(config.toobusyMaxLag);

	// BEGIN Transfer configure() from platform to app instance
	var basePath = platform.get('path');
	app.engine('hbs', hbs.__express);
	app.set('view engine', 'hbs');
	app.set('platform', platform);
	app.set('app root', platform.get('app root'));
	app.set('app path', basePath);
	app.set('views', path.join(basePath, 'views'));
	//app.set('shared views', path.join(basePath, 'views'));
	//app.set('platform views', platform.get('views'));
	app.set('config', config);
	//app.disable('etag');
	// END Transfer configure() from platform to app instance

	// hack so utils.js can use app.locals without passed ref
	//waiter.set('app',app); // @todo: deprecate

	hbs.loadPartials(app);

	// BEGIN Headers and Helpers
	app.use(function(req,res,next){
		util.resetUniq();

		// BEGIN performance: once-per-request
		var _parsedUrl = null;
		req.parsedUrl = function(){
			if (_parsedUrl === null) {
				_parsedUrl = Url.parse(req.url,true) || {};
			}
			return _parsedUrl;
		}
		// END performance: once-per-request

		// wrap request in domain
		var domain = Domain.create();
		domain.on('error', next); // Let express error middleware handle async errors
		domain.run(next);
	});
	// END Headers and Helpers


	// BEGIN Prevent Choke
	app.use(function(req,res,next){
		// check if we're toobusy() - note, this call is extremely fast, and returns
		// state that is cached at a fixed interval
		if (toobusy()) {
			res.statusCode = 503;
			return next(new Error('node is toobusy()!'));
		}
		next();
	});
	// END Prevent Choke


	// BEGIN Site Down
	// If enabling this
	//  (1) consider configOverrides
	//  (2) refine errorHandler() logic
	//app.use(function(req,res,next){
	//	if (config.isDown) {
	//		//app.use(errorHandler());
	//		res.statusCode = 500;
	//		return next(new Error('Site isDown.'));
	//	}
	//	next();
	//});
	// END Site Down


	// Manage long-lived connections
	app.use(keepalive());


	// GZip this bitch
	app.use(express.compress());


	app.use(cacheHeaders(2592000,true)); // Cache everything below this for a month
	app.use('/compiled', cacheHeaders(2592000,true)); // Cache compiled assets for a month, but verify
	//app.use(express.favicon(platform.get('public')+'/images/favicon.ico')); // @todo: make a favico
	app.use(express['static'](platform.get('public')));


	// BEGIN Global View Data
	if (typeof config.locals == 'object') {
		sext(app.locals,config.locals);
	}
	//app.locals.config = config;
	app.locals.title = config.siteTitle;
	app.locals.protocol = config.https ? 'https' : 'http';
	app.locals.pkgVersion = require(process.cwd()+'/package.json').version;
	// END Global View Data


	// BEGIN View Modifiers
	// Add content for all requests: req.add...()
	app.addAfterFooter = function(html){
		this.locals.afterFooter = (this.locals.afterFooter||'')+html;
	}
	app.addToHeader = function(html){
		this.locals.headerContent = (this.locals.headerContent||'')+html;
	}
	app.use(function(req,res,next){
		res.locals.bodyClasses = '';
		res.locals.headerContent = app.locals.headerContent;
		res.locals.afterFooter = app.locals.afterFooter;

		res.addBodyClass = function(n){
			res.locals.bodyClasses += n+' ';
		};
		res.removeBodyClass = function(n){
			res.locals.bodyClasses = res.locals.bodyClasses.replace(n+' ','');
		};
		// Add content for a single request: res.add...()
		res.addToHeader = app.addToHeader.bind(res);
		res.addAfterFooter = app.addAfterFooter.bind(res);
		next();
	});
	// END View Modifiers


  // Add support for metatags
  app.use(metaTagMiddleware());


	// Drop relevant config attributes in the head for FE
	app.addToHeader('\
		<script>\
			window.__config__ = {\
				env: "'+process.env.NODE_ENV+'"\
				,facebookAppId: "'+config.facebook.appid+'"\
				,facebookFanPage: "'+config.facebook.page+'"\
				,twitterHandle: "'+config.twitter.key+'"\
			};\
		</script>\
	');


	// FE Tracking Bits
	app.addAfterFooter(tracking.googleTagManagerSnippet(config.tracking));


	// BEGIN Attach routes, start server
	app.use(app.router);
	new Routes(app, config, platform.get('routesConfig'), cacheHeaders); // @todo: refactor unnecessary OOness here?
	// END Attach routes, start server


	// You got this far? Must be an error
	// ---------------------------------------------------------------------------
	app.use(cacheHeaders(config.cdn.errorTtl || 0, false)); // cache error and 404 responses for 30 seconds

	// Verbose, ugly errors in dev, clean user friendly errors everywhere else
	if (app.get('env') == 'development') {
		app.use(express.errorHandler());
	} else {
		app.use(errorHandler());
	}


	// Bottoming out here - the last middleware is a 404
	app.use(function(req,res,next){
		util.pretty404(req,res);
	});


	// Mount vhost to platform server
	// ---------------------------------------------------------------------------
	if (!config.vhost) {
		throw new Error('Please add a vhost to your default config at minimum');
	}

	platform.use(express.vhost(config.vhost, app));
	winston.log('debug', 'vhost attached', {vhost: config.vhost});

}
