//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'player',
    'folders',
    'youTubeV2API',
    'video',
    'videoSearchResults',
    'nextButton',
    'previousButton',
    'playPauseButton',
    'radioButton',
    'shuffleButton',
    'videoDisplayButton',
    'repeatButton',
    'commands',
    'contextMenus',
    'error',
    'iconManager',
    'omnibox',
    'user'
], function (Player, Folders, YouTubeV2API, Video, VideoSearchResults, NextButton, PreviousButton, PlayPauseButton, RadioButton, ShuffleButton, VideoDisplayButton, RepeatButton, Commands, ContextMenus, Error, IconManager, Omnibox) {
    'use strict';

    //  TODO: Implement some consistent pattern to respond with failures / success indicators.
    //  TODO: Move some of these methods into objects instead of letting grow arbitrarily in background.js
    //  Listen for messages from YouTube video pages.
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        switch (request.method) {
            //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
            //  Copies text to the clipboard. Has to happen on background page due to elevated privileges.
            case 'copy':
                
                var clipboard = $('<textarea>');

                clipboard.val(request.text);

                $('body').append(clipboard);

                //  Copy text from hidden field to clipboard.
                clipboard.select();
                document.execCommand('copy', false, null);

                clipboard.remove();

                //  Cleanup
                sendResponse({});
                break;
            case 'getFolders':
                sendResponse({ folders: Folders });
                break;
            case 'getPlaylists':
                var folder = Folders.get(request.folderId);
                var playlists = folder.get('playlists');

                sendResponse({ playlists: playlists });
                break;
            case 'addVideoByIdToPlaylist':

                var playlist = Folders.getActiveFolder().get('playlists').get(request.playlistId);
                
                if (playlist === undefined) {
                    console.error("Failed to find playlist with id:" + request.playlistId);
                }

                YouTubeV2API.getVideoInformation({
                    videoId: request.videoId,
                    success: function (videoInformation) {
                        
                        var video = new Video({
                            videoInformation: videoInformation
                        });

                        playlist.addByVideo(video);

                        sendResponse({
                            result: 'success'
                        });
                    },
                    error: function() {
                        sendResponse({
                            result: 'error'
                        });
                    }
                });

                break;
            case 'addPlaylistByShareData':
                var activeFolder = Folders.getActiveFolder();

                activeFolder.addPlaylistByShareData(request.shareCodeShortId, request.urlFriendlyEntityTitle, function(playlist) {

                    if (playlist) {

                        sendResponse({
                            result: 'success',
                            playlistTitle: playlist.get('title')
                        });

                    } else {

                        sendResponse({
                            result: 'error'
                        });

                    }
                });

                break;
            case 'getYouTubeInjectClicked':
                var clickStatus = Settings.get("youTubeInjectClicked");

                sendResponse({
                    result: clickStatus
                });

                break;
            case 'setYouTubeInjectClicked':
                var clickStatus = Settings.get("youTubeInjectClicked");
                if (!clickStatus) Settings.set("youTubeInjectClicked", true);
                break;
        }

        //  Return true to allow sending a response back.
        return true;
    });

});