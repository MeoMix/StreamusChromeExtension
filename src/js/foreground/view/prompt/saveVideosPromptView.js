define([
    'foreground/model/genericPrompt',
    'foreground/model/saveVideos',
    'foreground/view/saveVideosView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, SaveVideos, SaveVideosView, GenericPromptView) {
    'use strict';
    
    var SaveVideosPromptView = GenericPromptView.extend({
        
        model: null,
        
        initialize: function (options) {

            var saveVideos = new SaveVideos({
                videos: options.videos
            });

            this.model = new GenericPrompt({
                title: options.videos.length === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SaveVideosView({
                    model: saveVideos
                })
            });

            this.listenTo(saveVideos, 'change:creating', function (creating) {
                if (creating) {
                    this.ui.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.ui.okButton.text(chrome.i18n.getMessage('save'));
                }
            });

            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return SaveVideosPromptView;
});