
// DEMO main-home search functionality
$(function(){
	$('.search-controls .search-control-role select').bind('change',function(){
		var v = $(this).val();
		if (v) {
			window.location = '/search/'+v;
		}
	});
});
