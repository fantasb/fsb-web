/*
	This file owns window.fbAsyncInit!
*/

var readyCbs = []
,isReady = false
,sdkLoaded = false

function setReady(){
	isReady = true;
	for (var i=0,c=readyCbs.length;i<c;++i) {
		if (readyCbs[i] instanceof Function) {
			readyCbs[i]();
		}
	}
}

module.exports.ready = function(cb){
	if (!(cb instanceof Function)) return;
	if (isReady) return setTimeout(cb,0);
	readyCbs.push(cb);
}

module.exports.loadSdk = function(cnf){
	if (sdkLoaded) {
		return console.log('fb sdk already loaded');
	}
	sdkLoaded = true;

	window.fbAsyncInit = function(){
		FB.init(cnf);
		setReady();
	}

	var s = document.createElement('script');
	s.id = 'facebook-jssdk';
	s.async = true;
	//s.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6&appId=111979992242630';
	s.src = 'https://connect.facebook.net/en_US/sdk.js';
	var fjs = document.getElementsByTagName('script')[0];
	fjs.parentNode.insertBefore(s, fjs);
}


