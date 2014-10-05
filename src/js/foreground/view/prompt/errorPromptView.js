define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptView) {
    'use strict';
    
    var ErrorPromptView = PromptView.extend({
        initialize: function (options) {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('errorEncountered')
            });

            this.contentText = options.text;

            PromptView.prototype.initialize.apply(this, arguments);
            
            Streamus.backgroundPage.ClientErrorManager.logErrorMessage("Error: " + options.error + ", loadedSongId:" + Streamus.backgroundPage.Player.get('loadedSongId') + " " + options.text);
        }
    });

    return ErrorPromptView;
});