/*
	@todo:
		- Update #DEMO bits with real api bits using ace.req
*/


(function(){

function SlackSignup($cont){
	var z = this;
	z.$ = {
		cont: $cont
		,firstName: $cont.find('.slack-signup-input[name="first_name"]')
		,lastName: $cont.find('.slack-signup-input[name="last_name"]')
		,email: $cont.find('.slack-signup-input[name="email"]')
		,submit: $cont.find('.slack-signup-submit')
	};
	z.functionalize();
}
SlackSignup.prototype.functionalize = function(){
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
SlackSignup.prototype.showSuccess = function(){
	var z = this;
	z.$.cont.html('<div class="slack-signup-status">Message Sent!</div>');
}
SlackSignup.prototype.submit = function(){
	var z = this, data;
	if (z.submitting) return;
	z.submitting = true;
	z.submittedOnce = true;
	if (!(data = z.validate())) {
		return z.submitting = false;
	}
	// #DEMO
	ace.req('slack-signup','post',true,data,function(err,data){
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
SlackSignup.prototype.validate = function(data){
	var z = this
		,valid = true
	;
	if (!data) {
		data = {
			first_name: z.$.firstName.val()
			,last_name: z.$.lastName.val()
			,email: (z.$.email.val()||'').trim()
		};
	}
	if (!data.first_name) {
		z.$.firstName.addClass('has-error');
		valid = false;
	} else {
		z.$.firstName.removeClass('has-error');
	}
	if (!/^.+@.+\..+$/.test(data.email)) {
		z.$.email.addClass('has-error');
		valid = false;
	} else {
		z.$.email.removeClass('has-error');
	}
	//valid ? z.$.cont.removeClass('has-error') : z.$.cont.addClass('has-error');
	return valid ? data : false;
}



$(function(){
	$('#main .slack-signup').each(function(){
		new SlackSignup($(this));
	});
});

}());
