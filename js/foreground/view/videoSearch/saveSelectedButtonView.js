define([
    'text!../template/saveSelectedButton.htm',
    'videoSearchResults',
    'genericPromptView',
    'saveSelectedView'
], function (SaveSelectedButtonTemplate, VideoSearchResults, GenericPromptView, SaveSelectedView) {
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

            var selectedCount = VideoSearchResults.selected().length;
            
            if (selectedCount > 0) {

                //  TODO: Refactor to use SaveVideosView
                var saveSelectedPromptView = new GenericPromptView({
                    title: selectedCount === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                    okButtonText: chrome.i18n.getMessage('saveButtonText'),
                    model: new SaveSelectedView
                });
                
                saveSelectedPromptView.listenTo(saveSelectedPromptView.content, 'change:creating', function (creating) {

                    if (creating) {
                        this.okButton.text(chrome.i18n.getMessage('createAndSaveButtonText'));
                    } else {
                        this.okButton.text(chrome.i18n.getMessage('saveButtonText'));
                    }

                });

                saveSelectedPromptView.fadeInAndShow();
                
            }

        }
        
    });
    
    return SaveSelectedButtonView;
});