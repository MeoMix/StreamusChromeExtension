define([
    'settings'
], function (Settings) {
    'use strict';

    var RadioButtonView = Backbone.View.extend({
        el: $('#RadioButton'),
        
        events: {
            'click': 'toggleRadio'
        },

        enabledTitle: chrome.i18n.getMessage("radioEnabled"),
        disabledTitle: chrome.i18n.getMessage("radioDisabled"),
        
        initialize: function () {
            //  Remember the initial state across pop-up sessions by writing to/from localStorage.

            if (Settings.get('radioEnabled')) {
                this.$el
                    .addClass('pressed')
                    .attr('title', this.enabledTitle);
            }
            
        },
        
        toggleRadio: function () {

            this.$el.toggleClass('pressed');
            
            var isPressed = this.$el.hasClass('pressed');
            
            if (isPressed) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            Settings.set('radioEnabled', isPressed);
        }

    });

    return new RadioButtonView;
});