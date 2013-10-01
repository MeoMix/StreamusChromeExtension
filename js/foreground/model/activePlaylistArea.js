//  This is the Model for the ActivePlaylistArea's view. It does not (just) represent an activePlaylist,
//  but potentially anything that the ActivePlaylistArea view might need.
define(function () {
    'use strict';

    var ActivePlaylistArea = Backbone.Model.extend({

        defaults: function () {
            return {
                playlist: null,
                addVideosButtonText: chrome.i18n.getMessage('addVideosButtonText'),
                playAllButtonText: chrome.i18n.getMessage('playAllButtonText'),
                renameButtonText: chrome.i18n.getMessage('renameButtonText'),
                deleteButtonText: chrome.i18n.getMessage('deleteButtonText')
            };
        }

    });

    return ActivePlaylistArea;
});