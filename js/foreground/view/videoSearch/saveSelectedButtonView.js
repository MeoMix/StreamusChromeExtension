define([
    'text!../template/saveSelectedButton.htm',
    'videoSearchResults',
    'saveSelectedPromptView'
], function (SaveSelectedButtonTemplate, VideoSearchResults, SaveSelectedPromptView) {
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
        
        showSaveSelectedPrompt: function() {
            
            if (VideoSearchResults.selected().length > 0) {

                var saveSelectedPromptView = new SaveSelectedPromptView();
                saveSelectedPromptView.fadeInAndShow();
                
            }

        }
        
    });
    
    return SaveSelectedButtonView;
});