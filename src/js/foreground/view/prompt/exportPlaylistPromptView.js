define([
    'foreground/model/exportPlaylist',
    'foreground/model/prompt',
    'foreground/view/exportPlaylistView',
    'foreground/view/prompt/promptView'
], function (ExportPlaylist, Prompt, ExportPlaylistView, PromptView) {
    'use strict';
    
    var ExportPlaylistPromptView = PromptView.extend({
        initialize: function (options) {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('exportPlaylist'),
                okButtonText: chrome.i18n.getMessage('export'),
                view: new ExportPlaylistView({
                    model: new ExportPlaylist({
                        playlist: options.playlist
                    })
                })
            });

            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ExportPlaylistPromptView;
});