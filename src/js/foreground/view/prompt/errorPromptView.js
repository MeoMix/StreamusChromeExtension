define([
    'foreground/model/prompt',
    'foreground/view/prompt/promptContentView',
    'foreground/view/prompt/promptView'
], function (Prompt, PromptContentView, PromptView) {
    'use strict';
    
    var ErrorPromptView = PromptView.extend({
        id: 'errorPrompt',
        player: null,

        initialize: function (options) {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('errorEncountered')
            });

            this.player = Streamus.backgroundPage.player;

            this.contentView = new PromptContentView({
                template: _.template(options.text)
            });

            PromptView.prototype.initialize.apply(this, arguments);

            //  TODO: I can probably remove this at some point once errors aren't happening.
            var loadedSong = this.player.get('loadedSong');
            var loadedSongId = loadedSong ? loadedSong.get('id') : '';
            var error = new Error("Error: " + options.error + ", loadedSongId:" + loadedSongId + " " + options.text);
            Streamus.backgroundChannels.error.commands.trigger('log:error', error);
        }
    });

    return ErrorPromptView;
});