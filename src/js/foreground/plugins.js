define(function (require) {
    'use strict';
    
    //  TODO: Assign these to variables?
    require('backbone.marionette');
    require('backbone.localStorage');
    require('googleAnalytics');
    require('jquery.perfectScrollbar');
    require('jquery.qtip');
    require('jquery-ui');
    
    ga('send', 'pageview', '/foreground.html');
    
    //  Finally, load the application which will initialize the foreground:
    require(['foreground/application']);
});