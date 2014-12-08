define([
    'common/enum/exportFileType'
], function (ExportFileType) {
    'use strict';

    var ExportPlaylist = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('ExportPlaylist'),

        defaults: {
            //  Need to set id for Backbone.LocalStorage
            id: 'ExportPlaylist',
            playlist: null,
            fileType: ExportFileType.Csv
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