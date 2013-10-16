define([
    'text!../template/clearStreamButton.htm',
    'streamItems'
], function (ClearStreamButtonTemplate, StreamItems) {
    'use strict';

    var ClearStreamButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-icon button-small clear',
                                
        template: _.template(ClearStreamButtonTemplate),

        enabledTitle: chrome.i18n.getMessage('clearStreamEnabled'),
        disabledTitle: chrome.i18n.getMessage('clearStreamDisabled'),

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
        }
        
    });
    
    return ClearStreamButtonView;
});