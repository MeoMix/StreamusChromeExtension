define([
    'foreground/model/prompt',
    'foreground/model/saveSongs',
    'foreground/view/saveSongsView',
    'foreground/view/prompt/promptView'
], function (Prompt, SaveSongs, SaveSongsView, PromptView) {
    'use strict';
    
    var SaveSongsPromptView = PromptView.extend({
        initialize: function (options) {
            var saveSongs = new SaveSongs({
                songs: options.songs
            });

            this.model = new Prompt({
                title: options.songs.length === 1 ? chrome.i18n.getMessage('saveSong') : chrome.i18n.getMessage('saveSongs'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SaveSongsView({
                    model: saveSongs
                })
            });

            //  TODO: Reduce nesting
            this.listenTo(saveSongs, 'change:creating', function (creating) {
                if (creating) {
                    this.ui.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.ui.okButton.text(chrome.i18n.getMessage('save'));
                }
            });

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return SaveSongsPromptView;
});