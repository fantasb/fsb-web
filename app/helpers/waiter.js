// share stuff
// note: this is an anti-pattern, don't use unless have to
// @todo: deprecate cuz this forces bad habits
//

var data = {};

module.exports = {
  set: function(key,val){
    if (data[key]) ++data[key].ver;
    else data[key] = {ver:0};
    data[key].val = val;
  }

  ,get: function(key){
  	var undef;
    return data[key] ? data[key].val : undef;
  }
}
