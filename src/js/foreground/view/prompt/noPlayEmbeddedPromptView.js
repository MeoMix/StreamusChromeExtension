define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var NoPlayEmbeddedPromptView = PromptView.extend({
        //  TODO: i18n.
        contentText: chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded') + '<br/><br/>' + 'This is commonly caused by a bug in Streamus which is a known issue and is being worked on. Restarting Streamus should fix the problem. Sorry.',

        model: new Prompt({
            title: chrome.i18n.getMessage('errorEncountered'),
            okButtonText: chrome.i18n.getMessage('reload')
        }),

        initialize: function () {
            PromptView.prototype.initialize.apply(this, arguments);
            //  TODO: When I fix the bug related to this then this can go away.
            Streamus.backgroundPage.ClientErrorManager.logErrorMessage("NoPlayEmbeddedView shown, loadedSongId:" + Streamus.backgroundPage.YouTubePlayer.get('loadedSongId'));
        },

        onSubmit: function () {
            chrome.runtime.reload();
        }
    });

    return NoPlayEmbeddedPromptView;
});