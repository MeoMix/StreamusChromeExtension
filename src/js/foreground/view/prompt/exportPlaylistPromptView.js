define([
    'foreground/model/exportPlaylist',
    'foreground/model/prompt',
    'foreground/view/prompt/exportPlaylistView',
    'foreground/view/prompt/promptView'
], function (ExportPlaylist, Prompt, ExportPlaylistView, PromptView) {
    'use strict';
    
    var ExportPlaylistPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('exportPlaylist'),
            okButtonText: chrome.i18n.getMessage('export')
        }),

        initialize: function (options) {
            this.contentView = new ExportPlaylistView({
                model: new ExportPlaylist({
                    playlist: options.playlist
                })
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            this.contentView.exportPlaylist();
        }
    });

    return ExportPlaylistPromptView;
});