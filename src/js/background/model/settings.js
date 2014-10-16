define([
    'common/enum/youTubeSuggestedQuality'
], function (YouTubeSuggestedQuality) {
    'use strict';

    var Settings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('Settings'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'Settings',
            youTubeSuggestedQuality: YouTubeSuggestedQuality.Default,
            showTooltips: true,
            remindClearStream: true,
            remindDeletePlaylist: true,
            remindLinkUserId: true,
            remindGoogleSignIn: true,
            alwaysOpenToSearch: false,
            alwaysOpenInTab: false
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        }
    });
    
    return Settings;
});