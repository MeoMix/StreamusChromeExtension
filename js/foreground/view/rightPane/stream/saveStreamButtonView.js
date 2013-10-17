define([
    'text!../template/saveStreamButton.htm',
    'streamItems',
    'createPlaylistPromptView'
], function (SaveStreamButtonTemplate, StreamItems, CreatePlaylistPromptView) {
    'use strict';

    var SaveStreamButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-icon button-small save',
                                
        template: _.template(SaveStreamButtonTemplate),

        enabledTitle: chrome.i18n.getMessage("saveStream"),
        disabledTitle: chrome.i18n.getMessage("saveStreamDisabled"),
        
        events: {
            'click': 'showCreatePlaylistPrompt'
        },

        render: function () {
            this.$el.html(this.template());

            var disabled = StreamItems.length === 0;

            this.$el.prop('disabled', disabled);

            if (disabled) {
                this.$el.attr('title', this.disabledTitle);
            } else {
                this.$el.attr('title', this.enabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(StreamItems, 'add addMultiple remove empty', this.render);
        },
        
        showCreatePlaylistPrompt: function() {

            var createPlaylistPromptView = new CreatePlaylistPromptView();
            //  TODO: Instead of manually appending to body -- prompts should just do this implicitly?

            $('body').append(createPlaylistPromptView.render().el);
            createPlaylistPromptView.fadeInAndShow();

        }
        
    });
    
    return SaveStreamButtonView;
});