define([
    'text!../template/createPlaylistPrompt.htm',
    'streamItems',
    'folders'
], function (CreatePlaylistPromptTemplate, StreamItems, Folders) {
    'use strict';

    var CreatePlaylistPromptView = Backbone.View.extend({

        className: 'modalOverlay createPlaylistPrompt prompt',

        template: _.template(CreatePlaylistPromptTemplate),

        panel: null,
        playlistNameInput: null,

        events: {
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
            
        },
        
        fadeOutAndHide: function () {
            var self = this;

            this.$el.removeClass('visible').transition({
                opacity: 0
            }, 400, function () {
                self.remove();
            });
        },

        fadeInAndShow: function () {
            var self = this;
            
            $('body').append(this.render().el);
            
            this.panel.show().transition({
                opacity: 1
            }, 200, function () {
                self.$el.addClass('visible');
            });

        }
        
    });

    return CreatePlaylistPromptView;
});