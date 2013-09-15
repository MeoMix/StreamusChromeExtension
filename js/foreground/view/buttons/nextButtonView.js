//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'streamItems',
    'settings',
    'repeatButtonState'
], function (StreamItems, Settings, RepeatButtonState) {
    'use strict';

    var NextButtonView = Backbone.View.extend({
        el: $('#NextButton'),

        events: {
            'click': 'gotoNextVideo'
        },

        render: function () {

            if (StreamItems.length === 0) {
                this.disable();
            } else {

                var radioEnabled = Settings.get('radioEnabled');
                var shuffleEnabled = Settings.get('shuffleEnabled');
                var repeatButtonState = Settings.get('repeatButtonState');
                
                if (shuffleEnabled && StreamItems.length > 1) {
                    this.enable();
                }
                else if (radioEnabled || repeatButtonState !== RepeatButtonState.DISABLED) {
                    this.enable();
                } else {
                    //  Disable only if on the last item in stream with no options enabled.
                    var selectedItemIndex = StreamItems.indexOf(StreamItems.findWhere({ selected: true }));
                    
                    if (selectedItemIndex + 1 === StreamItems.length) {
                        this.disable();
                    } else {
                        this.enable();
                    }

                }

            }

            return this;
        },
        
        attributes: function() {
            return {
                title: 'Skip to the next video.',
                'test': 'hi'
            };
        },

        initialize: function () {
            this.$el.attr('title', chrome.i18n.getMessage("skipNextVideo"));

            this.listenTo(StreamItems, 'add addMultiple remove empty change:selected', this.render);
            this.listenTo(Settings, 'change:radioEnabled change:shuffleEnabled change:repeatButtonState', this.render);

            this.render();
        },

        //  Prevent spamming by only allowing a next click once every 100ms.
        gotoNextVideo: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                StreamItems.selectNext();
            }

        }, 100, true),

        //  Paint the button's path black and bind its click event.
        enable: function () {
            this.$el.prop('src', 'images/skip.png').removeClass('disabled');
        },

        //  Paint the button's path gray and unbind its click event.
        disable: function () {
            this.$el.prop('src', 'images/skip-disabled.png').addClass('disabled');
        }

    });

    return new NextButtonView;
});