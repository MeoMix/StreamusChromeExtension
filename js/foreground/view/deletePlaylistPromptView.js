define([
    'text!../template/deletePlaylistPrompt.htm',
    'genericPromptView',
    'settings'
], function (DeletePlaylistPromptTemplate, GenericPromptView, Settings) {
    'use strict';

    var DeletePlaylistPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' deletePlaylistPrompt',

        template: _.template(DeletePlaylistPromptTemplate),

        doOk: function () {
            
            var remindDeletePlaylist = !this.$el.find('input#remindDeletePlaylist').is(':checked');
            Settings.set('remindDeletePlaylist', remindDeletePlaylist);

            this.model.destroy();
            this.fadeOutAndHide();
        }

    });

    return DeletePlaylistPromptView;
});