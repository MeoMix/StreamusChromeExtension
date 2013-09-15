define([
    'repeatButtonState',
    'settings'
], function (RepeatButtonState, Settings) {
    'use strict';

    var RepeatButtonView = Backbone.View.extend({
        el: $('#RepeatButton'),

        events: {
            'click': 'toggleRepeat'
        },
        
        disabledTitle: chrome.i18n.getMessage("repeatDisabled"),
        repeatVideoEnabledTitle: chrome.i18n.getMessage("repeatVideoEnabled"),
        repeatPlaylistEnabledTitle: chrome.i18n.getMessage("repeatPlaylistEnabled"),

        state: Settings.get('repeatButtonState'),
        
        render: function () {
            var repeatVideoSvg = $('#RepeatVideoSvg');
            var repeatPlaylistSvg = $('#RepeatPlaylistSvg');

            switch(this.state) {
                case RepeatButtonState.DISABLED:
                    //  Can't use .removeClass() on svg elements.
                    repeatVideoSvg
                        .show()
                        .attr('class', '');
                    
                    repeatPlaylistSvg.hide();
                    this.$el.attr('title', this.disabledTitle);

                    break;
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
                    //  Can't use .addClass() on svg elements.
                    repeatVideoSvg.attr('class', 'pressed');
                    this.$el.attr('title', this.repeatVideoEnabledTitle);

                    break;
                case RepeatButtonState.REPEAT_STREAM_ENABLED:

                    repeatPlaylistSvg.show();
                    repeatVideoSvg.hide();
                    this.$el.attr('title', this.repeatPlaylistEnabledTitle);

                    break;
                default:
                    console.error("Unhandled repeatButtonState:", state);
                    break;
            }

        },
        
        initialize: function () {
            this.render();
        },
        
        toggleRepeat: function() {

            var nextState = null;

            switch (this.state) {
                case RepeatButtonState.DISABLED:
                    nextState = RepeatButtonState.REPEAT_VIDEO_ENABLED;
                    break;
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
                    nextState = RepeatButtonState.REPEAT_STREAM_ENABLED;
                    break;
                case RepeatButtonState.REPEAT_STREAM_ENABLED:
                    nextState = RepeatButtonState.DISABLED;
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", this.state);
                    break;
            }

            this.state = nextState;
            Settings.set('repeatButtonState', nextState);

            this.render();
        }

    });

    return new RepeatButtonView;
});