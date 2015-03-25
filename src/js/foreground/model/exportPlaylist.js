define(function (require) {
    'use strict';

    var ExportFileType = require('common/enum/exportFileType');

    var ExportPlaylist = BackboneForeground.Model.extend({
        localStorage: new BackboneForeground.LocalStorage('ExportPlaylist'),

        defaults: {
            //  Need to set id for BackboneForeground.LocalStorage
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
            //  Load from BackboneForeground.LocalStorage
            this.fetch();
        }
    });

    return ExportPlaylist;
});