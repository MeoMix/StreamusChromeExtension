var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-32334126-1']);
_gaq.push(['_trackPageview']);

var googleAnalyticsScript = $('<script>', {
    type: 'text/javascript',
    async: true,
    src: 'https://ssl.google-analytics.com/ga.js'
});

$('script').before(googleAnalyticsScript);