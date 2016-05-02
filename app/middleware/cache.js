
module.exports = function(seconds,mustRevalidate){
	if (typeof seconds != 'number') seconds = 0;
	if (typeof mustRevalidate == 'undefined') mustRevalidate = true;

	return function(req, res, next){
		if (req.method != 'GET') {
			// Never hang onto POST, DELETE, etc., or HTTPS responses
			res.setHeader('Cache-Control', 'no-cache, no-store');
		} else if (req.app.get('env') == 'development' || seconds == 0) {
			// In dev, cache, but ask for a 304 from us before serving
			res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
		} else if (mustRevalidate) {
			// Otherwise tell the browser to cache the content for awhile
			res.setHeader('Cache-Control', 'public, max-age='+seconds+', must-revalidate');
		} else {
			res.setHeader('Cache-Control', 'public, max-age='+seconds);
			res.setHeader('Expires', (new Date(Date.now() + seconds*1000)).toUTCString());
		}
		res.setHeader('Last-Modified', (new Date(Date.now())).toUTCString());

		next();
	};
}
