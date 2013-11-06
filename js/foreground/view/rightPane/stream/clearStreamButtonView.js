define([
    'text!../template/clearStreamButton.htm',
    'streamItems',
    'streamAction'
], function (ClearStreamButtonTemplate, StreamItems, StreamAction) {
    'use strict';

    var ClearStreamButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-icon button-small clear',
                                
        template: _.template(ClearStreamButtonTemplate),

        enabledTitle: chrome.i18n.getMessage('clearStream'),
        disabledTitle: chrome.i18n.getMessage('clearStreamDisabled'),
        
        events: {
            'click': 'clearStream',
        },

        render: function () {
            console.log("i'm rendering!");
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
        
        clearStream: function () {
            console.log("Clearing stream");
            StreamAction.clearStream();
        }
        
    });
    
    return ClearStreamButtonView;
});