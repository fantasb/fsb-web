//
// Handlebar template helpers
//

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

// @todo: refactor passing refs as args. we're working with effing node and browserify here
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

	,if_: function(val1, operator, val2, opts){
		return comparators[operator](val1,val2) ? opts.fn(this) : opts.inverse(this);
	}


/* @todo: translate these as needed
	# If x && y && z && ...
	ifa: () ->
		i = 0
		while i < arguments.length-1
			if !arguments[i]
				return arguments[arguments.length-1].inverse this
			++i
		arguments[arguments.length-1].fn this

	# If x || y || z || ...
	ifo: () ->
		i = 0
		while i < arguments.length-1
			if arguments[i]
				return arguments[arguments.length-1].fn this
			++i
		arguments[arguments.length-1].inverse this

	time: ->
		return +new Date

	incr: (v, opts) ->
		opts.fn (+v + 1)

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

	padZ: (v, n, options) ->
		# padZ(14, 4) == '0014'
		while ((v+'').length < n)
			v = '0'+v
		return v

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


