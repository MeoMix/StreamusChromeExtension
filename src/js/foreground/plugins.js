define(function(require) {
    'use strict';

    //  Overwrite _ not only in the AMD module wrapper but also globally here so that 100% of references point to the background page.
    window._ = chrome.extension.getBackgroundPage()._;

    //  TODO: I really feel like I should be able to mix this in from the background page, but it throws errors. Need to debug at some point. Probably very scary..
    var lodashMixin = require('common/lodashMixin');
    _.mixin(lodashMixin);

    require('backbone.marionette');
    require('backbone.localStorage');
    require('jquery.perfectScrollbar');
    require('jquery-ui');

    //  Finally, load the application which will initialize the foreground:
    require(['foreground/application']);
});