define([
    'foreground/model/prompt',
    'foreground/view/noPlayEmbeddedView',
    'foreground/view/prompt/promptView'
], function (Prompt, NoPlayEmbeddedView, PromptView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var NoPlayEmbeddedPromptView = PromptView.extend({
        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                okButtonText: chrome.i18n.getMessage('reload'),
                view: new NoPlayEmbeddedView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);

            Streamus.backgroundPage.ClientErrorManager.logErrorMessage("NoPlayEmbeddedView shown, loadedSongId:" + Player.get('loadedSongId'));
        }
    });

    return NoPlayEmbeddedPromptView;
});