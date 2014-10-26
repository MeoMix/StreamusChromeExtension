define([
    'cocktail',
    'backbone.marionette',
    'backbone.localStorage',
    'googleAnalytics'
], function (Cocktail) {
    'use strict';

    Cocktail.patch(Backbone);

    //  Finally, load the application:
    require(['background/application']);
});