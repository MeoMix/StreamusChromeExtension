define([
    'foreground/model/exportPlaylist',
    'foreground/model/prompt',
    'foreground/view/prompt/exportPlaylistView',
    'foreground/view/prompt/promptView'
], function (ExportPlaylist, Prompt, ExportPlaylistView, PromptView) {
    'use strict';
    
    var ExportPlaylistPromptView = PromptView.extend({
        id: 'exportPlaylistPrompt',

        initialize: function (options) {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('exportPlaylist'),
                submitButtonText: chrome.i18n.getMessage('export')
            });

            this.contentView = new ExportPlaylistView({
                model: new ExportPlaylist({
                    playlist: options.playlist
                })
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            this.contentView.saveAndExport();
        }
    });

    return ExportPlaylistPromptView;
});