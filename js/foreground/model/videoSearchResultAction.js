define([
    'streamItems'
], function (StreamItems) {
    'use strict';

    var VideoSearchResultAction = Backbone.Model.extend({

        addToStreamAndPlay: function (videoSearchResult) {

            var streamItems = playlist.get('items').map(function (playlistItem) {

                return {
                    id: _.uniqueId('streamItem_'),
                    video: playlistItem.get('video'),
                    title: playlistItem.get('title')
                };
            });

            StreamItems.addAndPlay(streamItems);

        }

    });

    return new VideoSearchResultAction;
});