define([
    'text!../template/createPlaylistPrompt.htm',
    'streamItems',
    'folders',
    'genericPromptView'
], function (CreatePlaylistPromptTemplate, StreamItems, Folders, GenericPromptView) {
    'use strict';

    var CreatePlaylistPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' createPlaylistPrompt',

        template: _.template(CreatePlaylistPromptTemplate),

        playlistTitleInput: null,

        events: _.extend({}, GenericPromptView.prototype.events, {
            
        }),
        
        playlistVideos: [],

        render: function () {

            GenericPromptView.prototype.render.call(this, {
                'playlistCount': Folders.getActiveFolder().get('playlists').length
            }, arguments);

            this.playlistTitleInput = this.$el.find('input[type="text"]');

            return this;
        },
        
        initialize: function (options) {
            console.log("Options:", options);
            this.playlistVideos = options && options.playlistVideos || [];
        },
        
        //  Validate input and, if valid, create a playlist with the given name.
        doOk: function () {
            
            var playlistName = $.trim(this.playlistTitleInput.val());

            var isValid = playlistName !== '';

            this.playlistTitleInput.toggleClass('invalid', !isValid);

            if (isValid) {
                
                var activeFolder = Folders.getActiveFolder();
                
                if (this.playlistVideos.length === 0) {
                    activeFolder.addEmptyPlaylist(playlistName);
                } else {
                    activeFolder.addPlaylistWithVideos(playlistName, this.playlistVideos);
                }

                this.fadeOutAndHide();
            }

        }
        
    });

    return CreatePlaylistPromptView;
});