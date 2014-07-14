define([
], function() {
    'use strict';
    
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;
    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var ContextMenuActions = Backbone.Model.extend({
        addSongsToStream: function (songs) {
            StreamItems.addSongs(songs);
        },
        
        playSongsInStream: function(songs) {
            StreamItems.addSongs(songs, {
                playOnAdd: true
            });
        },

        copyUrl: function (songUrl) {
            chrome.extension.sendMessage({
                method: 'copy',
                text: songUrl
            });
        },
        
        copyTitleAndUrl: function (songTitle, songUrl) {
            chrome.extension.sendMessage({
                method: 'copy',
                text: '"' + songTitle + '" - ' + songUrl
            });
        },
        
        watchOnYouTube: function(songId, songUrl) {
            var url = songUrl;
            
            if (Player.get('loadedSongId') === songId) {
                url += '?t=' + Player.get('currentTime') + 's';
            }

            chrome.tabs.create({
                url: url
            });

            Player.pause();
        }
    });

    //  Only ever want one instance of ContextMenuActions; it's static.
    return new ContextMenuActions();
})