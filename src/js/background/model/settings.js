define(function (require) {
    'use strict';

    var SongQuality = require('common/enum/songQuality');

    var Settings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('Settings'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'Settings',
            songQuality: SongQuality.Auto,
            remindClearStream: true,
            remindDeletePlaylist: true,
            remindLinkUserId: true,
            remindGoogleSignIn: true,
            //  TODO: This will need to become a multi-option of either openToSearch, openToPlaylist or collapsed.
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