define(function() {
    'use strict';

    var TimeArea = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('TimeArea'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'TimeArea',
            showRemainingTime: false,
            seeking: false,
            totalTime: ''
        },

        //  Don't want to save everything to localStorage -- only variables which need to be persisted.
        whitelist: ['showRemainingTime'],
        toJSON: function() {
            return this.pick(this.whitelist);
        },

        initialize: function() {
            //  Load from Backbone.LocalStorage
            this.fetch();
        }
    });

    return TimeArea;
});