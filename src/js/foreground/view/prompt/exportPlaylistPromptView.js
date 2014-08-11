define([
    'foreground/model/exportPlaylist',
    'foreground/model/genericPrompt',
    'foreground/view/exportPlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (ExportPlaylist, GenericPrompt, ExportPlaylistView, GenericPromptView) {
    'use strict';
    
    var ExportPlaylistPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('exportPlaylist'),
                okButtonText: chrome.i18n.getMessage('export'),
                view: new ExportPlaylistView({
                    model: new ExportPlaylist({
                        playlist: options.playlist
                    })
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return ExportPlaylistPromptView;
});