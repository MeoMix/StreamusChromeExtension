define([
    'foreground/view/genericForegroundView',
    'text!template/saveSelectedButton.html',
    'foreground/collection/videoSearchResults',
    'foreground/view/genericPromptView',
    'foreground/view/saveVideosView'
], function (GenericForegroundView, SaveSelectedButtonTemplate, VideoSearchResults, GenericPromptView, SaveVideosView) {
    'use strict';

    var SaveSelectedButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-label',
                                
        template: _.template(SaveSelectedButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('saveSelected')
        },
        
        events: {
            'click': 'showSaveSelectedPrompt'
        },

        render: function () {
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));

            return this;
        },
        
        showSaveSelectedPrompt: function () {
            
            var selectedSearchResults = VideoSearchResults.selected();
            var selectedCount = selectedSearchResults.length;

            var videos = _.map(selectedSearchResults, function (searchResult) {
                return searchResult.get('video');
            });

            var saveVideosPromptView = new GenericPromptView({
                title: selectedCount === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                okButtonText: chrome.i18n.getMessage('save'),
                model: new SaveVideosView({
                    model: videos
                })
            });

            saveVideosPromptView.listenTo(saveVideosPromptView.model, 'change:creating', function (creating) {

                if (creating) {
                    this.okButton.text(chrome.i18n.getMessage('createPlaylist'));
                } else {
                    this.okButton.text(chrome.i18n.getMessage('save'));
                }

            });

            saveVideosPromptView.fadeInAndShow();

        }
        
    });
    
    return SaveSelectedButtonView;
});