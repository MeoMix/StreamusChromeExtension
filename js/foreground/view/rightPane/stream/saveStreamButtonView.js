define([
    'text!../template/saveStreamButton.htm',
    'streamItems',
    'streamAction'
], function (SaveStreamButtonTemplate, StreamItems, StreamAction) {
    'use strict';

    var SaveStreamButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-icon button-small save',
                                
        template: _.template(SaveStreamButtonTemplate),

        enabledTitle: chrome.i18n.getMessage("saveStream"),
        disabledTitle: chrome.i18n.getMessage("saveStreamDisabled"),
        
        events: {
            'click': 'saveStream'
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
        
        saveStream: function() {
            StreamAction.saveStream();
        }
        
    });
    
    return SaveStreamButtonView;
});