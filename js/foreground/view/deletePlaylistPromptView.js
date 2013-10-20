define([
    'text!../template/deletePlaylistPrompt.htm',
    'genericPromptView'
], function (DeletePlaylistPromptTemplate, GenericPromptView) {
    'use strict';

    var DeletePlaylistPromptView = GenericPromptView.extend({

        className: GenericPromptView.prototype.className + ' deletePlaylistPrompt',

        template: _.template(DeletePlaylistPromptTemplate),

        doOk: function () {
            console.log("Doing ok");
            this.model.destroy();
            this.fadeOutAndHide();
        }

    });

    return DeletePlaylistPromptView;
});