//
// Handlebar template helpers
//

var Handlebars = require('handlebars');

var comparators = {
	'==': function(a,b){ return a == b; },
	'===': function(a,b){ return a === b; },
	'!=': function(a,b){ return a != b; },
	'!==': function(a,b){ return a !== b; },
	'<': function(a,b){ return a < b; },
	'<=': function(a,b){ return a <= b; },
	'>': function(a,b){ return a > b; },
	'>=': function(a,b){ return a >= b; },
	'typeof': function(a,b){ return typeof a == b; }
};
var maths = {
	'+': function(a,b){ return a+b; },
	'-': function(a,b){ return a-b; },
	'*': function(a,b){ return a*b; },
	'/': function(a,b){ return a/b; },
	'^': function(a,b){ return Math.pow(a,b); }
};

// @todo: refactor passing refs as args. we're working with effing node and browserify here #reqFix01
module.exports = function(_, util){ return {
	uniq: function(){return util.uniq.apply(util,arguments)}
	,luniq: function(){return util.luniq.apply(util,arguments)}

	// #seo
	,absolutifyUrl: function(){return util.absolutifyUrl.apply(util,arguments)}

	,stripTags: function(){return util.stripTags.apply(util,arguments)}	
	// @todo: this one is a bit different, should it be used to be safe?
	//,stripTags: (str = '') -> str.replace(/<(?:.|\n)*?>/gm, '')

	// @todo: implement this in util.js as well
	//,stripWhiteSpace: function(str){ return (str||'').replace(/(^\s+|\s+$)/g, ''); }

	//,toLowerCase: function(v){ return v.toLowerCase(); }

	,if_: function(val1, comparator, val2, opts){
		return comparators[comparator](val1,val2) ? opts.fn(this) : opts.inverse(this);
	}

	// If x && y && z && ...
	,ifa: function(){
		var i = 0
		while (i < arguments.length-1) {
			if (!arguments[i]) return arguments[arguments.length-1].inverse(this);
			++i;
		}
		return arguments[arguments.length-1].fn(this);
	}

	// If x || y || z || ...
	,ifo: function(){
		var i = 0
		while (i < arguments.length-1) {
			if (arguments[i]) return arguments[arguments.length-1].fn(this);
			++i;
		}
		return arguments[arguments.length-1].inverse(this);
	}

	,math: function(val1, operator, val2, opts){
		var result = maths[operator](val1,val2);
		return (opts && opts.fn) ? opts.fn(result) : result;
	}

	,join: function(joinWhat, withWhat, startIndex, maxCount, ellipsis, propKey){
		var result, items, i, undef;
		items = joinWhat.slice(startIndex||0, typeof maxCount == 'number' ? startIndex+maxCount : undef);
		if (propKey) {
			for (i=0;i<items.length;++i) {
				items[i] = items[i][propKey];
			}
		}
		result = items.join(withWhat);
		if (ellipsis && joinWhat.length-maxCount-startIndex > 0) {
			result += ellipsis;
		}
		return result;
	}

	,incr: function(v,opts){
		return opts.fn(+v + 1);
	}

	,padZ: function(n,m,opts){
		if (typeof opts == 'undefined') {
			opts = m;
			m = 2;
		}
		while ((n+'').length < m) n = '0'+n;
		return n;
	}

	,date: function(format,date,opts){
		// @todo: build out as needed
		if (typeof opts == 'undefined') {
			opts = date;
			date = new Date;
		}
		if (!(date instanceof Date)) {
			date = new Date(date);
		}
		return format.replace('Y',date.getFullYear());
	}

	,parseRubricMarkup: function(val,opts){
		val = Handlebars.Utils.escapeExpression(val);
		// [ex]Example value[/ex]
		// Hardcoding prefix instead of using CSS :before for SEO
		val = val.replace(/\[ex\](.*)\[\/ex\]/g, '<span class="rubric-infographic-factor-example"><span class="rubric-infographic-factor-example-prefix">Ex:</span>$1</span>');
		return new Handlebars.SafeString(val);;
	}


/* @todo: translate these as needed
	time: ->
		return +new Date

	forEachInRange: (array, min=1, max, options) ->
		if typeof array isnt 'object' or Array.isArray(array) is false
			return options.inverse(this)

		result = []
		max = array.length if !max
		times = Math.min(array.length, max)

		for i in [min..times] by 1
			result.push(options.fn(array[i - 1]))
		return result.join ''

	slice: (arr, begin, end, opts) ->
		return opts.inverse(arr) if !_.isArray(arr)
		if typeof opts == 'undefined'
			opts = end
			end = undefined
		opts.fn arr.slice(begin, end)

	len: (arrOrStr, opts) ->
		return arrOrStr.length;

	isArray: (v, options) ->
		if _.isArray(v) then options.fn() else options.inverse()

	customTagAttrs: (attrs) ->
		if typeof attrs != 'object'
			return ''
		tagAttrs = []
		_.each attrs, (v,k) ->
			tagAttrs.push 'x-'+k+'="'+v+'"'
		return tagAttrs.join ' '

	urlEncode: (v, useInsteadOfReturn, opts) ->
		if !opts
			opts = useInsteadOfReturn
			useInsteadOfReturn = false
		encoded = encodeURIComponent v
		if useInsteadOfReturn
			opts.fn encoded
		else
			return encoded
*/

}; }


