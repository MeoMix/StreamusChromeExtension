define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/saveVideosView'
], function (GenericPrompt, GenericPromptView, SaveVideosView) {
    'use strict';
    
    var SaveVideosPromptView = GenericPromptView.extend({
        
        model: null,
        
        initialize: function (options) {

            this.model = new GenericPrompt({
                title: options.videos.length === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                okButtonText: chrome.i18n.getMessage('save'),
                view: new SaveVideosView({
                    videos: options.videos
                })
            });

            //  TODO: Marionette view event?
            this.listenTo(this.model.get('view'), 'change:creating', function (creating) {
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