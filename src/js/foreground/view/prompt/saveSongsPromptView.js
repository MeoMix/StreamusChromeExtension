define([
    'foreground/model/genericPrompt',
    'foreground/model/saveSongs',
    'foreground/view/saveSongsView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SaveSongs, SaveSongsView, GenericPromptView) {
    'use strict';
    
    var SaveSongsPromptView = GenericPromptView.extend({
        
        model: null,
        
        initialize: function (options) {

            var saveSongs = new SaveSongs({
                songs: options.songs
            });

            this.model = new GenericPrompt({
                title: options.songs.length === 1 ? chrome.i18n.getMessage('saveSong') : chrome.i18n.getMessage('saveSongs'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SaveSongsView({
                    model: saveSongs
                })
            });

            this.listenTo(saveSongs, 'change:creating', function (creating) {
                if (creating) {
                    this.ui.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.ui.okButton.text(chrome.i18n.getMessage('save'));
                }
            });

            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return SaveSongsPromptView;
});