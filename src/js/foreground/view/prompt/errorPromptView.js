define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptContentView',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptContentView, PromptView) {
    'use strict';
    
    var ErrorPromptView = PromptView.extend({
        id: 'errorPrompt',
        player: null,
        debugManager: null,

        initialize: function (options) {
            this.debugManager = Streamus.backgroundPage.debugManager;
            this.player = Streamus.backgroundPage.player;
            
            this.model = new Prompt({
                title: chrome.i18n.getMessage('errorEncountered'),
                showCancelButton: false
            });

            this.contentView = new PromptContentView({
                template: _.template(options.text)
            });

            PromptView.prototype.initialize.apply(this, arguments);
            
            //  If another extension forced Streamus to load Flash then there's no need to report errors because it quite clearly won't work and the user has been notified.
            if (!this.debugManager.get('flashLoaded')) {
                var loadedSong = this.player.get('loadedSong');
                var loadedSongId = loadedSong ? loadedSong.get('id') : '';
                var referers = JSON.stringify(this.debugManager.get('youTubeIFrameReferers'));
                var error = new Error("Error: " + options.error + ", loadedSongId:" + loadedSongId + ' headers: ' + referers);
                Streamus.backgroundChannels.error.commands.trigger('log:error', error);
            }
        }
    });

    return ErrorPromptView;
});