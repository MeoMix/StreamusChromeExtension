define([
    'foreground/view/genericForegroundView',
    'text!template/saveSelectedButton.html',
    'foreground/view/prompt/saveVideosPromptView',
    'foreground/collection/videoSearchResults'
], function (GenericForegroundView, SaveSelectedButtonTemplate, SaveVideosPromptView, VideoSearchResults) {
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

            var videos = _.map(selectedSearchResults, function (searchResult) {
                return searchResult.get('video');
            });

            var saveVideosPromptView = new SaveVideosPromptView({
                videos: videos
            });
            
            saveVideosPromptView.fadeInAndShow();
        }
        
    });
    
    return SaveSelectedButtonView;
});