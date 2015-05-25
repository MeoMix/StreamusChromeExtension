define(function(require) {
    'use strict';

    // Overwrite lodash here in addition to in its AMD module factory to ensure all lo-dash calls reference the background's instance.
    // This is important to prevent memory leaks due to the coupling of background + foreground pages.
    window._ = chrome.extension.getBackgroundPage()._;

    require('backbone.marionette');
    require('backbone.localStorage');
    require('jquery-ui');

    // Finally, load the application which will initialize the foreground:
    require(['foreground/application']);
});