define([
    'text!../template/saveSelectedButton.htm',
    'videoSearchResults',
    'genericPromptView',
    'saveVideosView'
], function (SaveSelectedButtonTemplate, VideoSearchResults, GenericPromptView, SaveVideosView) {
    'use strict';

    var SaveSelectedButtonView = Backbone.View.extend({

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

            this.$el.prop('disabled', disabled);

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

            var selectedSearchResults = VideoSearchResults.selected();

            var selectedCount = selectedSearchResults.length;
            
            if (selectedCount > 0) {
                //  TODO: Can I pluck here?
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