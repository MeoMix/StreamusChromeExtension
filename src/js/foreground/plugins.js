define([
    'backbone.localStorage',
    'backbone.marionette',
    'googleAnalytics',
    'jquery.perfectScrollbar',
    'jquery.qtip',
    'jquery-ui',
    'less'
], function () {
    'use strict';
    
    ga('send', 'pageview', '/foreground.html');
    
    //  Finally, load the application which will initialize the foreground:
    require(['foreground/application']);
});