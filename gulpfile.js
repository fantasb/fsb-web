var _ = require('underscore')
,path = require('path')
,pkg = require('./package.json')
//,pkgVersionStr = pkg.version.replace(/./g,'-')
;


// gulp and plugins/helpers
var gulp = require('gulp')
,rename = require('gulp-rename')
//,wait = require('gulp-wait')
//,es = require('event-stream')
,clean = require('gulp-clean')
,handlebars = require('gulp-handlebars')
,wrap = require('gulp-wrap')
,replace = require('gulp-replace')
,declare = require('gulp-declare')
//,defineModule = require('gulp-define-module')
,gulpBrowserify = require('gulp-browserify')
//,saveBrowserifyOutput = require('vinyl-source-stream')
,concat = require('gulp-concat')
,uglify = require('gulp-uglify')
,uglifycss = require('gulp-uglifycss')
,bless = require('gulp-bless')
,sass = require('gulp-sass')
,sourcemaps = require('gulp-sourcemaps')
//,nodemon = require('gulp-nodemon')
,notify = require('gulp-notify')
//,gulpif = require('gulp-if')
,merge = require('merge-stream')
,recursive = require('recursive-readdir')
;

// default to non-production
var  production = false;

var libsBase = './public/libs';
var libFiles = [
	libsBase+'/jquery/dist/jquery.js'
	,libsBase+'/ace/ace.js'
	,libsBase+'/ace/ace.loader.js'
	,libsBase+'/ace/ace.pop.js'
	,libsBase+'/ace/ace.req.js'
	,libsBase+'/ace/ace.init.js'
	,libsBase+'/fastclick/lib/fastclick.js'
	//,libsBase+'/jquery.cookie/jquery.cookie.js'
	//,libsBase+'/jquery-placeholder/jquery.placeholder.js'
	//,libsBase+'/sticky-kit/jquery.sticky-kit.min.js'
	,libsBase+'/easyXDM/easyXDM.min.js'
	,libsBase+'/html5shiv/dist/html5shiv.js'
	//,libsBase+'/fastclick/lib/fastclick.js'
	//,libsBase+'/jquery-outside-events/jquery.ba-outside-events.min.js'
	//,libsBase+'/jquery.cookie/jquery.cookie.js'
	//,libsBase+'/jquery-placeholder/jquery.placeholder.js'
	//,libsBase+'/underscore/underscore.js'
	//,libsBase+'/microevents/microevent-debug.js'
	//,libsBase+'/microevents/microevent.js'
	,libsBase+'/handlebars/handlebars.runtime.js'
	//,libsBase+'/loglevel/dist/loglevel.js'
	//,libsBase+'/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js'
	//,libsBase+'/history.js/scripts/bundled/html4+html5/jquery.history.js' // there may be a semicolon issue with this and foundation being compiled next to each other
	//,libsBase+'/slick-carousel/slick/slick.min.js'
	//,libsBase+'/enquire/dist/enquire.js'
	//,libsBase+'/jquery-zoom/jquery.zoom.js'
	,libsBase+'/foundation/js/foundation/foundation.js'
	//,libsBase+'/foundation/js/foundation/foundation.abide.js'
	//,libsBase+'/foundation/js/foundation/foundation.accordion.js'
	//,libsBase+'/foundation/js/foundation/foundation.alert.js'
	//,libsBase+'/foundation/js/foundation/foundation.clearing.js'
	//,libsBase+'/foundation/js/foundation/foundation.equalizer.js'
	//,libsBase+'/foundation/js/foundation/foundation.interchange.js'
	//,libsBase+'/foundation/js/foundation/foundation.reveal.js'
	//,libsBase+'/foundation/js/foundation/foundation.dropdown.js'
	//,libsBase+'/foundation/js/foundation/foundation.topbar.js'
	//,libsBase+'/foundation/js/foundation/foundation.tab.js'
	//,libsBase+'/foundation/js/foundation/foundation.offcanvas.js'
	//,libsBase+'/foundation/js/foundation/foundation.joyride.js'
	//,libsBase+'/foundation/js/foundation/foundation.magellan.js'
	//,libsBase+'/foundation/js/foundation/foundation.slider.js'
	//,libsBase+'/foundation/js/foundation/foundation.tooltip.js"
];
var libCss = [
	libsBase+'/ace/ace.css'
	,libsBase+'/ace/ace.loader.css'
	,libsBase+'/ace/ace.pop.css'
];



// -------------------------------------------------------------------------------
// TASK BUNDLES (i.e. command line options)
// -------------------------------------------------------------------------------

// dev tasks
gulp.task('dev', ['clean'], function(){
	gulp.start('css', 'templates', 'custom-modernizr', 'libs', 'gulpbrowserify', 'watch');
});

// dev tasks without css
// - assumes 'startup' task has been run, so no 'clean' needed
// - starts the 'watch' process to monitor template and scss changes (js is watched by supervisor)
gulp.task('dev-nocss', function(){
	gulp.start('templates', 'custom-modernizr', 'libs', 'gulpbrowserify', 'watch');
});

// tasks to run before the server is started
gulp.task('startup', ['clean'], function(){
	gulp.start('templates', 'custom-modernizr', 'css');
});

// prod tasks
gulp.task('default', ['clean'], function(){
	production = true;
	// uglifyjs task runs after browserify is done on postbundle event handler so its not included here
	gulp.start('css', 'templates', 'custom-modernizr', 'libs', 'gulpbrowserify', 'uglifycss', 'bless-css');
});



// -------------------------------------------------------------------------------
// TASKS
// -------------------------------------------------------------------------------

// remove old generated files
gulp.task('clean', function(){
	return gulp.src(['public/compiled/*.*'],{read: false}).pipe(clean());
});

gulp.task('custom-modernizr', function(){
	return gulp.src('public/libs/modernizr/modernizr.js')
		.pipe(require('gulp-modulizr')([
			'cssclasses'
			,'svg'
			,'touch'
			//,'url-data-uri'
		]))
		//.pipe(require('gulp-add-src')([
		//	'bower_components/modernizr/feature-detects/url-data-uri.js'
		//]))
		.pipe(concat('custom-modernizr.js'))
		.pipe(gulp.dest('public/compiled/'))
	;
});

gulp.task('templates', function(){
	// Assume all frontend partials are in frontend/ or shared/
	//partials = gulp.src(['./app/views/partials/*.hbs', './shared/views/partials/*.hbs', './frontend/views/partials/*.hbs'])
	var partials = gulp.src(['./frontend/views/partials/*.hbs', './shared/views/partials/*.hbs'])
		.pipe(handlebars())
		.pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
			imports: {
				processPartialName: function(fileName){
					// Strip the extension
					// Escape the output with JSON.stringify
					return JSON.stringify(path.basename(fileName, '.js'));
				}
			}
		}))
	;

	var templates = gulp.src(['./frontend/views/**/*.hbs', './shared/views/**/*.hbs'])
		.pipe(handlebars())
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'Handlebars.templates'
			,noRedeclare: true // Avoid duplicate declarations
		}))
	;

	// Output both the partials and the templates
	return merge(partials, templates)
		.pipe(concat('templates.js'))
		.pipe(gulp.dest('public/compiled/'))
	;
});

// concatenate all external libraries into one file
gulp.task('libs', function(){
	gulp.src(libCss).pipe(concat('libs.css'))
		.pipe(gulp.dest('public/compiled/'))
	;
	return gulp.src(libFiles)
		.pipe(concat('libs.js'))
		.pipe(gulp.dest('public/compiled/'))
	;
});

gulp.task('gulpbrowserify', function(){
	// grab all files in scripts and sub dirs
	return recursive('./frontend/scripts', function(err,files){
		// filter out any files that are not main files
		files = _.filter(files, function(path){
			return path.indexOf('main-') != -1;
		});

		if (files.length == 0) return; // gulp.src() doesn't return a stream if empty

		// prepend ./ back to each path for browserify
		_.each(files, function(v,k){
			files[k] = './'+v;
		});

		var numFiles = files.length
			,count = 0
		;

		// run browserify for main files
		var stream = gulp.src(files, {read:false})
			.pipe(gulpBrowserify({
				debug: !production
				//,ignore: ['coffee-script', 'fs', 'statsd-client']
				//,transform: ['coffeeify']
				//,extensions: ['.coffee']
				,extensions: ['.js']
			}))
		;

		// uglify if production
		if (production) {
			stream.on('postbundle', function(src){
				++count;
				if (count >= numFiles) {
					gulp.start('uglifyjs');
				}
			});
		}
		// rename files extensions to .js
		// @todo: Remove this since not compiling coffee anymore?
		stream.pipe(rename(function(path){
			path.extname = '.js';
			return; // must return nothing here or rename function fails
		}));

		// fix trailing comma in sub-dependency (causes problems in IE9)
		// @todo: Remove this if unnecessary

		if (!production) {
			stream.pipe(replace('maxDataSize: Infinity,\n				 pauseStream: this.pauseStreams,'
												 ,'maxDataSize: Infinity,\n				 pauseStream: this.pauseStreams'))
			;
		}

		stream.pipe(gulp.dest('./public/compiled'));
	});
});

gulp.task('uglifyjs', function(){
	//if (!production) return;
	//console.log('UGLIFY!');
	return gulp.src('public/compiled/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('public/compiled'))
	;
});

// compile sass
gulp.task('css', function(){
	//var stream = gulp.src(['frontend/styles/main.scss', 'frontend/styles/solo-homepage.scss'])
	var stream = gulp.src(['frontend/styles/main.scss']) // @todo: split libs css into separate file like libs.js
		.on('error', notify.onError({
			message: 'SASS error :: <%= error.message %>'
			,title: 'JavaScript Error'
		}))
	;
	if (!production) {
		stream.pipe(sourcemaps.init());
	}
	return stream.pipe(sass({includePaths: require('node-bourbon').includePaths}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('public/compiled/'))
	;
});

// make css ugly
gulp.task('uglifycss', ['css'], function(){
	if (!production) return;
	return gulp.src(['public/compiled/main.css'])
		.pipe(uglifycss({'max-line-len':80}))
		.pipe(gulp.dest('public/compiled/'))
	;
});

// -------------------------------------------------------------------------------
// This will break up the css to keep them under the css limit for IE6-9
// 	It should only run for production and after css is uglyfied!
// -------------------------------------------------------------------------------
gulp.task('bless-css', ['uglifycss'], function(){
	if (!production) return;
	return gulp.src(['public/compiled/main.css'])
		.pipe(bless({
			force: false
			,cleanup: false
		}))
		.pipe(rename(function(path){
			if (path && path.basename.indexOf('-blessed') == -1) {
				path.basename += '-blessed';
				path.extname = '.css';
			}
			return; // must return nothing here or rename function fails
		}))
		.pipe(gulp.dest('public/compiled/'))
	;
});

// watch for changes to hbs and styl files
gulp.task('watch', function(){
	var jsFiles = gulp.watch(['frontend/scripts/*.js', 'shared/*.js', 'frontend/scripts/**/*.js']);
	jsFiles.on('change', function(){
		gulp.start('gulpbrowserify');
	});

	var sassFiles = gulp.watch(['frontend/styles/*.scss', 'frontend/styles/**/*.scss']);
	sassFiles.on('change', function(){
		gulp.start('css');
		// temp hack; should be more tied to task definitions above
		if (process.env.GULP_TASK == 'dev-ie') {
			gulp.start('uglifycss');
			gulp.start('bless-css');
		}
	});

	var templateFiles = gulp.watch(['frontend/views/**/*.hbs', 'shared/views/**/*.hbs', 'app/views/partials/*.hbs']);
	//var templateFiles = gulp.watch(['frontend/views/**/*.hbs', 'shared/views/**/*.hbs']);
	templateFiles.on('change', function(){
		gulp.start('templates');
	});

	//var packageJson = gulp.watch(['package.json']);
	//packageJson.on('change', function(){
	//	gulp.start('css', 'merge');
	//});
});


