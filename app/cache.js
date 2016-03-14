// @todo: deprecate and remove
var LRU = require('lru-halfexpired');
var caches = [];

module.exports = function(options){
  cache = LRU(options);
  caches.push(cache);
  return cache;
}

module.exports.flush = function(){
	caches.forEach(function(cache){
		cache.reset();
	});
}

exports._caches = caches;
