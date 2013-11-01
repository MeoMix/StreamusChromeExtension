define([
    'text!../template/editPlaylistPrompt.htm',
    'genericPromptView'
], function (EditPlaylistPromptTemplate, GenericPromptView) {
    'use strict';

    var EditPlaylistPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' editPlaylistPrompt',

        template: _.template(EditPlaylistPromptTemplate),

        playlistTitleInput: null,
        
        events: _.extend({}, GenericPromptView.prototype.events, {

            'input input.playlistTitle': 'validateTitle'

        }),
        
        render: function () {

            GenericPromptView.prototype.render.call(this, arguments);

            this.playlistTitleInput = this.$el.find('input[type="text"]');

            return this;
        },
        
        validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.playlistTitleInput.val());
            this.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },
        
        //  Validate input and, if valid, edit the playlist's name with the given name.
        doOk: function () {

            var valid = this.$el.find('.submittable.invalid').length === 0;

            if (valid) {
                var playlistTitle = $.trim(this.playlistTitleInput.val());
                this.model.set('title', playlistTitle);
                this.fadeOutAndHide();
            }

        }

    });

    return EditPlaylistPromptView;
});