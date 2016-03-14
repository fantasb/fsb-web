var fs = require('fs')
,path = require('path')
,file = require('file')
,_ = require('underscore')
,util = require('../helpers/util.js')
,helpers = require('./helpers.js')(_, util) // @todo: refactor how helpers get access to util.js
,Handlebars = require('handlebars')
;

function HBS(){
	var z = this;
	z.handlebars = Handlebars.create();
	z.cache = {};

	// Register hbs helper methods
	_.each(helpers,function(fn,name){
		z.registerHelper(name,fn);
	});
}

HBS.prototype.loadPartialsDirectory = function(dir,partials){
	if (typeof partials == 'undefined') partials = {};
	if (fs.existsSync(dir)) {
		var toSlice = dir.length+1;
		file.walkSync(dir,function(dirPath,dirs,files){
			var route = dirPath.slice(toSlice);
			if (route != '') {
				route = route+'/';
			}
			var keyRoute = route == 'partials/' ? '' : route;
			_.each(files,function(f){
				if (f.indexOf('_') == 0 || route == 'partials/') {
					var name = path.basename(f,'.hbs');
					if (f.indexOf('_') == 0) {
						name = name.substr(1);
					}
					console.log('name: ',name);
					partials[keyRoute+name] = fs.readFileSync(path.join(dir,route,f),'utf8');
				}
			});
		});
		return partials;
	}
}

HBS.prototype.loadPartials = function(app){
	var z = this
	var partials = z.loadPartialsDirectory(path.join(app.get('app path'),'views'));
	//if (app.get('app root')) partials = z.loadPartialsDirectory(path.join(app.get('app root'),'shared/views'), partials);
	_.each(partials,function(key,data){
		z.registerPartial(key,data);
	});
}

HBS.prototype.registerHelper = function(){
	this.handlebars.registerHelper.apply(this.handlebars, arguments);
}
HBS.prototype.registerPartial = function(){
	this.handlebars.registerPartial.apply(this.handlebars, arguments);
}

HBS.prototype.__express = function(filename, options, cb){
	var z = this;

	// grab extension from filename
	// if we need a layout, we will look for one matching out extension
	var extension = path.extname(filename);
	var handlebars = z.handlebars;
	var cache = z.cache;

	// render the original file
	var renderFile = function(locals, cb){
		// cached?
		var template = cache[filename]
		if (template) {
			return cb(null, template(locals));
		}
		fs.readFile(filename, 'utf8', function(err,str){
			if (err) {
				return cb(err);
			}
			locals = options
			template = handlebars.compile(str);
			if (options.cache) {
				cache[filename] = template;
			}

			try {
				cb(null, template(locals))
			} catch (e) {
				e.message = filename + ': ' + e.message;
				cb(e);
			}
		});
	}

	// render with a layout
	var renderWithLayout = function(template, locals, cb){
		renderFile(locals, function(err,str){
			if (err) {
				return cb(err);
			}
			locals = options;
			locals.mainContent = str;
			cb(null, template(locals));
		});
	}

	var layout = options.layout;

	// user did not specify a layout in the locals
	// check global layout state
	if (typeof layout == 'undefined' && options.settings && options.settings['view options']) {
		layout = options.settings['view options'].layout;
	}

	// user explicitly request no layout
	// either by specifying false for layout: false in locals
	// or by settings the false view options
	if (layout === false) {
		return renderFile(options,cb);
	}

	var viewDir = options.settings.views;
	//var layoutFilename = path.join(viewDir, layout || 'layout');
	var layoutFilename = layout || 'layout';
	if (!path.extname(layoutFilename)) {
		layoutFilename += extension;
	}

	var layoutTemplate = cache[layoutFilename];
	if (layoutTemplate) {
		return renderWithLayout(layoutTemplate, options, cb);
	}

	// @todo: check if layout path has .hbs extension
	var pathToTry = path.join(viewDir, layoutFilename);
	fs.readFile(pathToTry, 'utf8', function(err,str){
		if (err) {
			pathToTry = path.join(process.cwd()+'/views', layoutFilename);
			fs.readFile(pathToTry, 'utf8', function(err,str){
				if (err) {
					if (layout) return cb(err);
					return renderFile(options,cb);
				}
				layoutTemplate = handlebars.compile(str);
				if (options.cache) {
					cache[layoutFilename] = layoutTemplate;
				}
				renderWithLayout(layoutTemplate, options, cb);
			});
		} else {
			layoutTemplate = handlebars.compile(str);
			if (options.cache) {
				cache[layoutFilename] = layoutTemplate;
			}
			renderWithLayout(layoutTemplate, options, cb);
		}
	});
}


module.exports = HBS;

