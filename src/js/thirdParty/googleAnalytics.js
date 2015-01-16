//  The Google Analytics code has been slightly modified to work within the extension environment. 
//  See this link for more information regarding GA and Chrome Extensions: https://developer.chrome.com/extensions/tut_analytics
//  See this link for more information regarduing Universal Analytics: https://developers.google.com/analytics/devguides/collection/analyticsjs/
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-32334126-1', 'auto');
//  Bug: UA doesn't work out of the box with Chrome extensions.
//  https://code.google.com/p/analytics-issues/issues/detail?id=312
//  http://stackoverflow.com/questions/16135000/how-do-you-integrate-universal-analytics-in-to-chrome-extensions
ga('set', 'checkProtocolTask', function () {});
ga('require', 'displayfeatures');
ga('require', 'linkid', 'linkid.js');
ga('send', 'pageview');