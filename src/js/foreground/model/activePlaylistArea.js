//  This is the Model for the ActivePlaylistArea's view. It does not (just) represent an activePlaylist,
//  but potentially anything that the ActivePlaylistArea view might need.
define(function () {
    'use strict';

    var ActivePlaylistArea = Backbone.Model.extend({

        defaults: function () {
            return {
                playlist: null
            };
        }

    });

    return ActivePlaylistArea;
});