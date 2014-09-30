define(function () {
    'use strict';

    var ExportPlaylist = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('ExportPlaylist'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'ExportPlaylist',
            playlist: null,
            exportCsv: true,
            exportJson: false,
            exportTitle: true,
            exportId: true,
            exportUrl: false,
            exportAuthor: false,
            exportDuration: false
        },
        
        //  Don't want to save the playlist to localStorage -- only the configuration variables
        blacklist: ['playlist'],
        toJSON: function () {
            return this.omit(this.blacklist);
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
        }
    });

    return ExportPlaylist;
});