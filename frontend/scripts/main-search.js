
(function(){

function Search($cont){
	var z = this;
	z.roleId = +$cont.attr('x-role_id') || null;
	z.$ = {
		cont: $cont
		,results: $cont.find('div.search-results')
		,controls: $cont.find('.search-controls')
	};

	z.functionalize();
}
Search.prototype.functionalize = function(){
	var z = this;
	z.initControls();
	z.initViewMore();
}
Search.prototype.initControls = function(){
	var z = this;
	// DEMO main-home search functionality
	z.$.controls.find('.search-control-role select').bind('change',function(){
		var v = $(this).val();
		if (v) {
			window.location = '/search/'+v;
		}
	});
}
Search.prototype.initViewMore = function(){
	var z = this;
	z.$.cont.on('click','a.search-results-showmore',function(e){
		e.preventDefault();

		// @todo: instead, queue it up?
		if (z.viewMoreBusy) return;
		z.viewMoreBusy = true;

		var $btn = $(this)
			,roleId = z.roleId
			,offset = +$btn.attr('x-offset')
			,limit = +$btn.attr('x-limit')
			,$loader = $('<div class="search-results-showmore-loader"></div>')
		;
		$btn.replaceWith($loader);
		if (!(roleId && limit)) return console.log('ERROR', 'secure against some random device slamming api');
		$.ajax({
			url: '/search-results-partial'
			,method: 'GET'
			//,cache: true
			,data: {
				role_id: z.roleId
				,offset: offset
				,limit: limit
			}
			,complete: function(res,status){
				$loader.remove();
				z.viewMoreBusy = false;
				if (status != 'success') {
					z.$.results.append('<div class="search-results-error">There was an error fetching results :(</div>');
					return console.log('ERROR', 'fetching more results', res);
				}
				z.$.results.append(res.responseText);
			}
		});
	});
}

$(function(){
	$('#main .search').each(function(){
		new Search($(this));
	});
});

}());
