
window.ranktt.fb = require('./fb.js');

// fixes something, i forget what. probly re zooming
if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
	$('head').find('meta[name="viewport"]').attr('content', 'width=device-width, initial-scale=1.0 maximum-scale=2.0');
}
