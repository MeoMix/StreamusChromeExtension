define([
    'settings'
], function (Settings) {
    'use strict';

    var ShuffleButtonView = Backbone.View.extend({
        el: $('#ShuffleButton'),
        
        events: {
            'click': 'toggleShuffleVideo'
        },
        
        enabledTitle: chrome.i18n.getMessage("shuffleEnabled"),
        disabledTitle: chrome.i18n.getMessage("shuffleDisabled"),
        
        initialize: function() {
            //  Remember the initial state across pop-up sessions by writing to/from localStorage.
            if (Settings.get('shuffleEnabled')) {
                this.$el
                    .addClass('pressed')
                    .attr('title', this.enabledTitle);
            }
            
        },
        
        toggleShuffleVideo: function () {

            this.$el.toggleClass('pressed');
            
            var isPressed = this.$el.hasClass('pressed');
            
            if (isPressed) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            Settings.set('shuffleEnabled', isPressed);
        }
        
    });
    
    return new ShuffleButtonView;
});