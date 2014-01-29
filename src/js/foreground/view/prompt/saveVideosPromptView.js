define([
    'foreground/view/prompt/genericPromptView',
    'foreground/view/saveVideosView'
], function (GenericPromptView, SaveVideosView) {
    'use strict';
    
    var SaveVideosPromptView = GenericPromptView.extend({
        title: '',
        
        okButtonText: chrome.i18n.getMessage('save'),
        
        model: null,
        
        initialize: function (options) {

            this.model = new SaveVideosView({
                model: options.videos
            });

            this.title = options.videos.length === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos');

            this.listenTo(this.model, 'change:creating', function (creating) {
                if (creating) {
                    this.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.okButton.text(chrome.i18n.getMessage('save'));
                }
            });

            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return SaveVideosPromptView;
});