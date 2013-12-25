define([
    'background/model/folder',
    'background/model/video',
    'common/model/youTubeV2API'
], function (Folder, Video, YouTubeV2API) {
    'use strict';

    var Folders = Backbone.Collection.extend({
        model: Folder,
        
        initialize: function() {

            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

                switch(request.method) {
                    case 'getFolders':
                        sendResponse({ folders: this });
                        break;
                    case 'getPlaylists':
                        var folder = this.get(request.folderId);
                        var playlists = folder.get('playlists');

                        sendResponse({ playlists: playlists });
                        break;
                    case 'addVideoByIdToPlaylist':

                        YouTubeV2API.getVideoInformation({
                            videoId: request.videoId,
                            success: function (videoInformation) {
                        
                                var video = new Video({
                                    videoInformation: videoInformation
                                });

                                var requestedPlaylist = this.getActiveFolder().get('playlists').get(request.playlistId);
                                requestedPlaylist.addByVideo(video);

                                sendResponse({
                                    result: 'success'
                                });
                            }.bind(this),
                            error: function() {
                                sendResponse({
                                    result: 'error'
                                });
                            }
                        });
                        break;
                    case 'addPlaylistByShareData':
                        var activeFolder = this.getActiveFolder();

                        activeFolder.addPlaylistByShareData(request.shareCodeShortId, request.urlFriendlyEntityTitle, function (playlist) {

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
                }
                
            }.bind(this));

        },

        getActiveFolder: function () {
            return this.findWhere({ active: true });
        }
 
    });
    
    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.Folders = new Folders();
    return window.Folders;
});