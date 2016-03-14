
module.exports.googleTagManagerSnippet = function(opts){
	if (opts && opts.tags && opts.tags['google-tag-manager']) {
		return "\
			<!-- Google Tag Manager -->\
			<noscript><iframe src='//www.googletagmanager.com/ns.html?id="+opts.tags['google-tag-manager']+"'\
			height='0' width='0' style='display:none;visibility:hidden'></iframe></noscript>\
			<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\
			new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\
			'//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\
			})(window,document,'script','dataLayer','"+opts.tags['google-tag-manager']+"');</script>\
			<!-- End Google Tag Manager -->\
		";
	}
	return '<!-- Google Tag Manager Not Configured -->';
}
