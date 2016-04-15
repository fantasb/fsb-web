
ranktt.ui.MainNav = {
	config: {
	}
	,$: {}
	,init: function($nav, $toggleBtn){
		var z = this;
		if (z.inited) return false;
		z.inited = true;

		z.$.nav = $nav;
		z.$.toggleBtn = $toggleBtn;
		z.functionalize();
	}
	,functionalize: function(){
		var z = this;

		z.navToggled = false;
		z.$.toggleBtn.bind('click',function(e){
			e.preventDefault();
			z.navToggled ? z.toggleNavOff() : z.toggleNavOn();
		});
		$(document).bind('click',function(e){
			if (!z.navToggledOnThisThread) {
				z.toggleNavOff();
			}
			z.navToggledOnThisThread = false;
		});
	}
	,toggleNavOn: function(){
		var z = this;
		z.$.nav.addClass('toggled-on');
		z.navToggled = true;
		z.navToggledOnThisThread = true;
	}
	,toggleNavOff: function(){
		var z = this;
		z.$.nav.removeClass('toggled-on');
		z.navToggled = false;
	}
};

$(function(){
	var $header = $('#header');
	ranktt.ui.MainNav.init($header.find('.nav-toggle-target'), $header.find('a.nav-toggle'));
});

