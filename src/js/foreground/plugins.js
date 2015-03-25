define(function(require) {
    'use strict';

    var jQuery = require('jquery');
    require('jquery.perfectScrollbar');
    require('jquery.qtip');
    require('jquery-ui');

    chrome.extension.getBackgroundPage().setForeground(jQuery, document);

    chrome.extension.getBackgroundPage().showForeground($('#foregroundArea'));

    //require('BackboneForeground.marionette');
    //require('BackboneForeground.localStorage');
    //require('jquery.perfectScrollbar');
    //require('jquery.qtip');
    //require('jquery-ui');

    ////  Finally, load the application which will initialize the foreground:
    //require(['foreground/application']);
});