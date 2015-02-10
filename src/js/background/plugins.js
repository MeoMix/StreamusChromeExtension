define([
    'cocktail',
    'backbone.marionette',
    'backbone.localStorage',
    'googleAnalytics'
], function (Cocktail) {
    'use strict';

    Cocktail.patch(Backbone);
    ga('send', 'pageview', '/background.html');

    //  Finally, load the application:
    require(['background/application']);
});