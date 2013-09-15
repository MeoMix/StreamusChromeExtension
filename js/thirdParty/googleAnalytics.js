var _gaq = _gaq || [];

require(function(){
    'use strict';

	_gaq.push(['_setAccount', 'UA-32334126-1']);
	_gaq.push(['_trackPageview']);

	(function() {
		var ga = document.createElement('script'); 
		ga.type = 'text/javascript'; 
		ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
}); 	

