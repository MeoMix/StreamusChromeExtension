define(function(require) {
    'use strict';

    require('backbone.marionette');
    require('backbone.localStorage');
    require('jquery.perfectScrollbar');
    require('jquery.qtip');
    require('jquery-ui');

    //  Finally, load the application which will initialize the foreground:
    require(['foreground/application']);
});