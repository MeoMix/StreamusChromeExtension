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

        enabledTitle: chrome.i18n.getMessage('saveSelected'),
        disabledTitle: chrome.i18n.getMessage('saveSelectedDisabled'),
        
        events: {
            'click': 'showSaveSelectedPrompt'
        },

        render: function () {
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));

            var disabled = VideoSearchResults.selected().length === 0;

            this.$el.toggleClass('disabled', disabled);

            if (disabled) {
                this.$el.attr('title', this.disabledTitle);
            } else {
                this.$el.attr('title', this.enabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(VideoSearchResults, 'change:selected', this.render);
        },
        
        showSaveSelectedPrompt: function () {
            
            if (!this.$el.hasClass('disabled')) {

                var selectedSearchResults = VideoSearchResults.selected();
                var selectedCount = selectedSearchResults.length;

                var videos = _.map(selectedSearchResults, function (searchResult) {
                    return searchResult.get('video');
                });

                var saveVideosPromptView = new GenericPromptView({
                    title: selectedCount === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                    okButtonText: chrome.i18n.getMessage('saveButtonText'),
                    model: new SaveVideosView({
                        model: videos
                    })
                });

                saveVideosPromptView.listenTo(saveVideosPromptView.model, 'change:creating', function (creating) {

                    if (creating) {
                        this.okButton.text(chrome.i18n.getMessage('createAndSaveButtonText'));
                    } else {
                        this.okButton.text(chrome.i18n.getMessage('saveButtonText'));
                    }

                });

                saveVideosPromptView.fadeInAndShow();
                
            }

        }
        
    });
    
    return SaveSelectedButtonView;
});