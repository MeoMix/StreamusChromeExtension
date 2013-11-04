define([
    'streamItems'
], function (StreamItems) {
    'use strict';

    var PlaylistAction = Backbone.Model.extend({
        
        addToStream: function(playlist) {

            var streamItems = playlist.get('items').map(function (playlistItem) {

                return {
                    id: _.uniqueId('streamItem_'),
                    video: playlistItem.get('video'),
                    title: playlistItem.get('title')
                };
            });

            StreamItems.add(streamItems);
        },
        
        addToStreamAndPlay: function(playlist) {
            
            var streamItems = playlist.get('items').map(function (playlistItem) {

                return {
                    id: _.uniqueId('streamItem_'),
                    video: playlistItem.get('video'),
                    title: playlistItem.get('title'),
                    selected: index === 0
                };
            });

            StreamItems.addAndPlay(streamItems);

        }

    });

    return new PlaylistAction;
});