//
// Handlebar template helpers
//

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


	// #here
/* @todo: translate these
	toLowerCase: (value) -> value.toLowerCase()

	if_: (lvalue, operator, rvalue, options) ->
		if arguments.length < 3
			throw new Error("Handlerbars Helper 'compare' needs 2 parameters")

		unless options
			options = rvalue
			rvalue = operator
			operator = "=="

		operators =
			'==': (l, r) -> `l == r`
			'===': (l, r) -> l is r
			'!=': (l, r) -> `l != r`
			'!==': (l, r) -> l unless r
			'<': (l, r) -> l < r
			'>': (l, r) -> l > r
			'<=': (l, r) -> l <= r
			'>=': (l, r) ->	l >= r
			'typeof': (l, r) -> typeof l == r

		unless operators[operator]
			throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator)

		result = operators[operator](lvalue, rvalue)
		#console.log 'RESULT', JSON.stringify(lvalue), operator, JSON.stringify(rvalue), result, operators[operator]

		if result
			return options.fn(this)
		else
			return options.inverse(this)

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

	math: (lvalue, operator, rvalue, options) ->
		lvalue = parseFloat(lvalue)
		rvalue = parseFloat(rvalue)

		return {
				"+": lvalue + rvalue,
				"-": lvalue - rvalue,
				"*": lvalue * rvalue,
				"/": lvalue / rvalue,
				"%": lvalue % rvalue
		}[operator]

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


