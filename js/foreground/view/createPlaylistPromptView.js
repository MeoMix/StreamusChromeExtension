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

        render: function () {

            GenericPromptView.prototype.render.call(this, {
                'playlistCount': Folders.getActiveFolder().get('playlists').length
            }, arguments);

            this.playlistTitleInput = this.$el.find('input[type="text"]');

            return this;
        },
        
        //  Validate input and, if valid, create a playlist with the given name.
        doOk: function () {
            
            var playlistName = $.trim(this.playlistTitleInput.val());

            var isValid = playlistName !== '';
            console.log("Validate:", playlistName);
            this.playlistTitleInput.toggleClass('invalid', !isValid);

            if (isValid) {
                
                var activeFolder = Folders.getActiveFolder();
                activeFolder.addPlaylistWithVideos(playlistName, StreamItems.pluck('video'));

                this.fadeOutAndHide();
                console.log("hiding");
            }

        }
        
    });

    return CreatePlaylistPromptView;
});