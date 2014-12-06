define([
    'foreground/model/prompt',
    'foreground/model/saveSongs',
    'foreground/view/prompt/promptView',
    'foreground/view/prompt/saveSongsView'
], function (Prompt, SaveSongs, PromptView, SaveSongsView) {
    'use strict';
    
    var SaveSongsPromptView = PromptView.extend({
        id: 'saveSongsPrompt',

        initialize: function (options) {
            this.model = new Prompt({
                title: options.songs.length === 1 ? chrome.i18n.getMessage('saveSong') : chrome.i18n.getMessage('saveSongs'),
                submitButtonText: chrome.i18n.getMessage('save')
            });
            
            var saveSongs = new SaveSongs({
                songs: options.songs
            });

            this.contentView = new SaveSongsView({
                model: saveSongs
            });
            
            this.listenTo(saveSongs, 'change:creating', this._onChangeCreating);

            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function() {
            this.contentView.saveSongs();
        },
        
        _onChangeCreating: function (creating) {
            var submitButtonText = creating ? chrome.i18n.getMessage('createPlaylist') : chrome.i18n.getMessage('save');
            this.ui.submitButtonText.text(submitButtonText);
        }
    });

    return SaveSongsPromptView;
});