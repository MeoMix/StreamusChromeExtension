define(function () {
    'use strict';

    var TimeArea = BackboneForeground.Model.extend({
        localStorage: new BackboneForeground.LocalStorage('TimeArea'),

        defaults: {
            //  Need to set the ID for BackboneForeground.LocalStorage
            id: 'TimeArea',
            showRemainingTime: false,
            seeking: false,
            totalTime: ''
        },
        
        //  Don't want to save everything to localStorage -- only variables which need to be persisted.
        whitelist: ['showRemainingTime'],
        toJSON: function () {
            return this.pick(this.whitelist);
        },

        initialize: function () {
            //  Load from BackboneForeground.LocalStorage
            this.fetch();
        }
    });

    return TimeArea;
});