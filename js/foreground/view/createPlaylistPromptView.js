define([
    'text!../template/createPlaylistPrompt.htm',
    'streamItems',
    'folders',
    'genericPromptView',
    'youTubeDataAPI',
    'dataSource'
], function (CreatePlaylistPromptTemplate, StreamItems, Folders, GenericPromptView, YouTubeDataAPI, DataSource) {
    'use strict';

    var CreatePlaylistPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' createPlaylistPrompt',

        template: _.template(CreatePlaylistPromptTemplate),

        playlistTitleInput: null,
        youTubeSourceInput: null,

        events: _.extend({}, GenericPromptView.prototype.events, {
            
            'input input.youTubeSource': 'processInput',
            'input input.playlistTitle': 'validateTitle'

        }),
        
        playlistVideos: [],

        render: function () {

            GenericPromptView.prototype.render.call(this, {
                'playlistCount': Folders.getActiveFolder().get('playlists').length
            }, arguments);

            this.playlistTitleInput = this.$el.find('input.playlistTitle');
            this.youTubeSourceInput = this.$el.find('input.youTubeSource');

            return this;
        },
        
        initialize: function (options) {
            this.playlistVideos = options && options.playlistVideos || [];
        },
        
        //  Validate input and, if valid, create a playlist with the given name.
        doOk: function () {

            //  If all submittable fields indicate themselves as valid -- allow submission.
            var valid = this.$el.find('.submittable.invalid').length === 0;

            if (valid) {
                
                var activeFolder = Folders.getActiveFolder();
                
                var dataSource = this.youTubeSourceInput.data('datasource');
                var playlistName = $.trim(this.playlistTitleInput.val());
                
                if (dataSource != '') {
                    activeFolder.addPlaylistByDataSource(playlistName, dataSource);
                } else {
                    
                    if (this.playlistVideos.length === 0) {
                        activeFolder.addEmptyPlaylist(playlistName);
                    } else {
                        activeFolder.addPlaylistWithVideos(playlistName, this.playlistVideos);
                    }
                    
                }
                
                this.fadeOutAndHide();
            }

        },
        
        validateTitle: function() {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.playlistTitleInput.val());
            this.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },
        
        //  Throttle for typing support
        processInput: _.throttle(function () {
            var self = this;
            
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(function() {

                var youTubeSource = $.trim(self.youTubeSourceInput.val());
                console.log("Setting source:", youTubeSource);
                self.youTubeSourceInput.data('datasource', '').removeClass('valid invalid');

                if (youTubeSource !== '') {
                    //  Check validity of URL and represent validity via invalid class.
                    var dataSource = YouTubeDataAPI.parseUrlForDataSource(youTubeSource);

                    self.youTubeSourceInput.data('datasource', dataSource);
                
                    switch (dataSource.type) {
                        case DataSource.YOUTUBE_PLAYLIST:

                            YouTubeDataAPI.getPlaylistTitle(dataSource.id, function (youTubePlaylistTitle) {
                                self.playlistTitleInput.val(youTubePlaylistTitle);
                                self.youTubeSourceInput.addClass('valid');
                            });

                            break;
                        case DataSource.YOUTUBE_CHANNEL:

                            YouTubeDataAPI.getChannelName(dataSource.id, function (channelName) {
                                self.playlistTitleInput.val(channelName + '\'s Feed');
                                self.youTubeSourceInput.addClass('valid');
                            });

                            break;
                            //  TODO: Need to support getting shared playlist information.
                            //case DataSource.SHARED_PLAYLIST:
                            //    self.model.addPlaylistByDataSource('', dataSource);
                            //    break;
                        case DataSource.YOUTUBE_FAVORITES:

                            YouTubeDataAPI.getChannelName(dataSource.id, function (channelName) {
                                self.playlistTitleInput.val(channelName + '\'s Feed');
                                self.youTubeSourceInput.addClass('valid');
                            });

                            break;
                        default:
                            //  Typing is invalid, but expected.
                            if (dataSource.type !== dataSource.USER_INPUT) {
                                console.error("Unhandled dataSource type:", dataSource.type);
                            }
                            
                            self.youTubeSourceInput.addClass('invalid');
                    }

                }
                
            });


        }, 100)

    });

    return CreatePlaylistPromptView;
});