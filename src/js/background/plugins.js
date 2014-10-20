define([
    'cocktail',
    'backbone.marionette',
    'backbone.localStorage',
    'googleAnalytics',
    'jquery.hoverIntent',
    'jquery.qtip',
    'jquery.transit',
    'jquery-ui',
    'less',
    'selectize'
], function (Cocktail) {
    'use strict';

    Cocktail.patch(Backbone);

    //  Finally, load the application:
    require(['background/application']);
});