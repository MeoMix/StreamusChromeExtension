define([
    'text!../template/createPlaylistPrompt.htm',
    'streamItems',
    'folders',
    'genericPromptView'
], function (CreatePlaylistPromptTemplate, StreamItems, Folders, GenericPromptView) {
    'use strict';

    var CreatePlaylistPromptView = GenericPromptView.extend({

        className: 'modalOverlay createPlaylistPrompt prompt',

        template: _.template(CreatePlaylistPromptTemplate),

        panel: null,
        playlistNameInput: null,

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .ok': 'validateAndCreatePlaylist',
            'keydown input[type="text"]': 'doOkOnEnter'
        },

        render: function () {
            this.$el.html(this.template(
                _.extend({
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n,
                    'playlistCount': Folders.getActiveFolder().get('playlists').length
                })
            ));

            this.panel = this.$el.children('.panel');
            this.playlistNameInput = this.$el.find('input[type="text"]');

            return this;
        },

        validateAndCreatePlaylist: function () {

            var playlistName = $.trim(this.playlistNameInput.val());

            var isValid = playlistName !== '';
            
            this.playlistNameInput.toggleClass('invalid', !isValid);

            if (isValid) {
                
                var activeFolder = Folders.getActiveFolder();
                activeFolder.addPlaylistWithVideos(playlistName, StreamItems.pluck('video'));

                this.fadeOutAndHide();
            }

        },
        
        //  If the enter key is pressed while the input is focused, run validateAndCreatePlaylist
        doOkOnEnter: function (event) {
            
            if (event.which === 13) {
                this.validateAndCreatePlaylist();
            }
            
        }
        
    });

    return CreatePlaylistPromptView;
});