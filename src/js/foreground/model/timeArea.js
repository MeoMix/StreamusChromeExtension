define(function () {
    'use strict';

    var TimeArea = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('TimeArea'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'TimeArea',
            showTimeRemaining: false,
            autoUpdate: true
        },

        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        }
    });

    return TimeArea;
});