define([
    'text!../template/editPlaylistPrompt.htm',
    'genericPromptView'
], function (EditPlaylistPromptTemplate, GenericPromptView) {
    'use strict';

    var EditPlaylistPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' editPlaylistPrompt',

        template: _.template(EditPlaylistPromptTemplate),

        playlistTitleInput: null,

        render: function () {

            GenericPromptView.prototype.render.call(this, arguments);

            this.playlistTitleInput = this.$el.find('input[type="text"]');

            return this;
        },
        
        //  Validate input and, if valid, edit the playlist's name with the given name.
        doOk: function () {

            var playlistTitle = $.trim(this.playlistTitleInput.val());

            var isValid = playlistTitle !== '';
            
            this.playlistTitleInput.toggleClass('invalid', !isValid);

            if (isValid) {
                
                this.model.set('title', playlistTitle);
                this.fadeOutAndHide();
            }

        }

    });

    return EditPlaylistPromptView;
});