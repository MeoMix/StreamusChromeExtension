//  When clicked -- skips to the last video. Skips from the begining of the list to the end.
define([
    'streamItems',
    'settings',
    'repeatButtonState',
    'player'
], function (StreamItems, Settings, RepeatButtonState, Player) {
    'use strict';

    var PreviousButtonView = Backbone.View.extend({
        el: $('#PreviousButton'),
        
        events: {
            'click': 'doTimeBasedPrevious'
        },
        
        render: function () {
 
            if (StreamItems.length === 0) {
                this.disable();
            } else {
                this.enable();
            }

            return this;
        },
        
        initialize: function () {
            this.$el.attr('title', chrome.i18n.getMessage("backPreviousVideo"));

            this.listenTo(StreamItems, 'add addMultiple empty remove change:selected', this.render);
            this.listenTo(Settings, 'change:radioEnabled change:shuffleEnabled change:repeatButtonState', this.render);

            this.render();
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        doTimeBasedPrevious: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                
                // Restart video when clicking 'previous' if too much time has passed or if no other video to go to
                if (StreamItems.length === 1 || Player.get('currentTime') > 5) {
                    Player.seekTo(0);
                } else {
                    
                    StreamItems.selectPrevious();
                }
            }

        }, 100, true),
        
        //  Paint the button's path black and bind its click event.
        enable: function() {
            this.$el.prop('src', 'images/skip.png').removeClass('disabled');
        },
        
        //  Paint the button's path gray and unbind its click event.
        disable: function() {
            this.$el.prop('src', 'images/skip-disabled.png').addClass('disabled');
        }
    });

    return new PreviousButtonView;
});