define([
    'text!../template/radioButton.htm'
], function (RadioButtonTemplate) {
    'use strict';

    var RadioButtonView = Backbone.View.extend({
        
        tagName: 'button',

        className: 'button-icon button-small',
        
        template: _.template(RadioButtonTemplate),
        
        model: chrome.extension.getBackgroundPage().RadioButton,
        
        events: {
            'click': 'toggleRadio'
        },
        
        enabledTitle: chrome.i18n.getMessage("radioEnabled"),
        disabledTitle: chrome.i18n.getMessage("radioDisabled"),
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            var enabled = this.model.get('enabled');

            this.$el.toggleClass('enabled', enabled);
            
            if (enabled) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }
            
            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:enabled', this.render);
            
            $(window).unload(function () {
                this.stopListening();
            }.bind(this));
        },
        
        toggleRadio: function () {
            this.model.toggleRadio();
        }

    });

    return RadioButtonView;
});