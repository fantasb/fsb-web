/*
	@todo:
		- Update #DEMO bits with real api bits using ace.req
*/


(function(){

function Search($cont){
	var z = this;
	z.roleId = +$cont.attr('x-role_id') || null;
	z.$ = {
		cont: $cont
		,results: $cont.find('div.search-results')
		,controls: $cont.find('div.search-controls')
	};
	z.$.roleOptions = z.$.controls.find('div.search-control-role select');
	z.$.locationOptions = z.$.controls.find('div.search-control-location select');

	z.functionalize();
}
Search.prototype.opts = {
	brokenProfImgReplacement: '/images/profilephoto-default-01.png'
}
Search.prototype.functionalize = function(){
	var z = this;
	z.initControls();
	z.initViewMore();
	z.initConnect();
	z.fixBrokenImages();
}
Search.prototype.initControls = function(){
	var z = this;
	// #DEMO main-home search functionality
	z.$.roleOptions.add(z.$.locationOptions).bind('change',function(){
		var role = z.$.roleOptions.val()
			,loc = z.$.locationOptions.val()
			,url = '/search/'+role+'/'+loc
		if (role && loc && url != window.location.pathname) {
			window.location = url;
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
				var $newResults = $(res.responseText)
				z.fixBrokenImages($newResults)
				z.$.results.append($newResults);
			}
		});
	});
}
Search.prototype.initConnect = function(){
	var z = this;
	/*
		To Do
			- Show/hide rules (group)
			- Validate (colored bgs)
			- Submit action
	*/
	z.$connectInlays = {};
	z.$.results.on('click','.search-result-action-connect',function(e){
		e.preventDefault();
		var $result = $(this).parents('.search-result:first')
			,id = +$result.attr('x-id')
			,name = $result.attr('x-name')

		if (z.$connectInlays[id]) {
			return z.hideConnect(id);
		}

		z.$connectInlays[id] = new Connect({
			candidateId: id
			,candidateName: name.split(/\s+/)[0]
		});
		$result.after(z.$connectInlays[id].$.cont);
	});
}
Search.prototype.hideConnect = function(id){
	var z = this;
	if (!z.$connectInlays[id]) return;
	z.$connectInlays[id].$.cont.remove();
	delete z.$connectInlays[id];
}
Search.prototype.fixBrokenImages = function($cont){
	// @todo: create $.fn.onFirstImgError, which binds to each individual img instead of waiting for all of them to load before checking
	var z = this, $imgs
	if (!$cont) $cont = z.$.results
	$imgs = $cont.find('.search-result-pic >img').imagesLoaded(function(){
		$imgs.each(function(){
			if (this.naturalWidth === 0)  {
				var $img = $(this)
				$img.attr('x-broken-url',$img.attr('src')).attr('src',z.opts.brokenProfImgReplacement)
				// @todo: notify backend this is broke #stub
			}
		})
	})
}


var Connect = AceBase.extend({
	$: {}
	,defaultOpts: {
		purposeOpts: {
			//items: ['General Inquire', 'Vague Inquire', 'Non Sequitur Inquire', 'Demonstrative']
			items: ['Mentorship', 'Speaker', 'Consulting', 'Job Offer']
		}
	}
	,init: function(opts){
		var z = this;
		z.opts = $.extend({},z.defaultOpts,opts);
		z.build();
		z.functionalize();
	}
	,build: function(){
		var z = this;
		z.$.cont = $( Handlebars.partials['results-contact-inlay'](z.opts) );
		z.$.purpose = z.$.cont.find('select[name="purpose"]');
		z.$.email = z.$.cont.find('input[name="email"]');
		z.$.msgSubject = z.$.cont.find('input[name="msg_subject"]');
		z.$.msgBody = z.$.cont.find('textarea[name="msg_body"]');
		z.$.submit = z.$.cont.find('.results-contact-inlay-action-submit');
	}
	,functionalize: function(){
		var z = this;
		z.$.submit.bind('click',function(e){
			e.preventDefault();
			z.submit()
		});
		z.$.cont.find('input,textarea,select').bind('keypress',function(e){
			if (e.which == 13) {
				e.preventDefault();
				z.submit();
			}
		}).bind('change',function(){
			if (z.submittedOnce) {
				z.validate();
			}
		});
	}
	,showSuccess: function(){
		var z = this;
		z.$.cont.find('div.results-contact-inlay-wrap').html('<div class="results-contact-inlay-status">Message Sent! We\'ll send you an invite shortly!</div>');
	}
	,submit: function(){
		var z = this, data;
		if (z.submitting) return;
		z.submitting = true;
		z.submittedOnce = true;
		if (!(data = z.validate())) {
			return z.submitting = false;
		}
		// #DEMO
		ace.req('contact-candidate','post',true,data,function(err,data){
			z.submitting = false;
			if (err) {
				ace.util.stdErrAlert();
				//z.trigger('submit-error',err)
				return console.log('ERROR',err);
			}
			z.showSuccess();
			//z.trigger('submit',data);
		});
	}
	,validate: function(data){
		var z = this
			,valid = true
		;
		if (!data) {
			data = {
				candidate_id: z.opts.candidateId
				,purpose: z.$.purpose.val()
				,email: (z.$.email.val()||'').trim()
				,msg_subject: (z.$.msgSubject.val()||'').trim()
				,msg_body: (z.$.msgBody.val()||'').trim()
			};
		}
		if (!/^.+@.+\..+$/.test(data.email)) {
			z.$.email.addClass('has-error');
			valid = false;
		} else {
			z.$.email.removeClass('has-error');
		}
		if (!data.msg_subject) {
			z.$.msgSubject.addClass('has-error');
			valid = false;
		} else {
			z.$.msgSubject.removeClass('has-error');
		}
		if (!data.msg_body) {
			z.$.msgBody.addClass('has-error');
			valid = false;
		} else {
			z.$.msgBody.removeClass('has-error');
		}
		//valid ? z.$.cont.removeClass('has-error') : z.$.cont.addClass('has-error');
		return valid ? data : false;
	}
});



$(function(){
	$('#main .search').each(function(){
		new Search($(this));
	});
});

}());
