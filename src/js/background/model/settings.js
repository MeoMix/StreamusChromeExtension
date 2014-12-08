define([
    'common/enum/songQuality'
], function (SongQuality) {
    'use strict';

    var Settings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('Settings'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'Settings',
            songQuality: SongQuality.Auto,
            showTooltips: true,
            remindClearStream: true,
            remindDeletePlaylist: true,
            remindLinkUserId: true,
            remindGoogleSignIn: true,
            openToSearch: false,
            openInTab: false
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        }
    });
    
    return Settings;
});