define([
    'foreground/model/genericPrompt',
    'foreground/model/saveSources',
    'foreground/view/saveSourcesView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SaveSources, SaveSourcesView, GenericPromptView) {
    'use strict';
    
    var SaveSourcesPromptView = GenericPromptView.extend({
        
        model: null,
        
        initialize: function (options) {

            var saveSources = new SaveSources({
                sources: options.sources
            });

            this.model = new GenericPrompt({
                title: options.videos.length === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SaveSourcesView({
                    model: saveSources
                })
            });

            this.listenTo(saveSources, 'change:creating', function (creating) {
                if (creating) {
                    this.ui.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.ui.okButton.text(chrome.i18n.getMessage('save'));
                }
            });

            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return SaveSourcesPromptView;
});