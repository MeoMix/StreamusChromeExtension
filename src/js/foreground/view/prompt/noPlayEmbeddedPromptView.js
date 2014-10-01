define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var NoPlayEmbeddedPromptView = PromptView.extend({
        contentText: chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded') + '<br/><br/>' + chrome.i18n.getMessage('streamusBugApology'),

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                okButtonText: chrome.i18n.getMessage('reload')
            });

            PromptView.prototype.initialize.apply(this, arguments);
            //  TODO: When I fix the bug related to this then this can go away.
            Streamus.backgroundPage.ClientErrorManager.logErrorMessage("NoPlayEmbeddedPromptView shown, loadedSongId:" + Streamus.backgroundPage.Player.get('loadedSongId'));
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return NoPlayEmbeddedPromptView;
});