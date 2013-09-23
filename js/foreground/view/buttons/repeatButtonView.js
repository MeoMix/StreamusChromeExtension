define([
    'repeatButtonState'
], function (RepeatButtonState) {
    'use strict';

    var RepeatButtonView = Backbone.View.extend({
        className: 'repeatButton button',
        
        template: _.template($('#repeatButtonTemplate').html()),

        events: {
            'click': 'toggleRepeat'
        },
        
        disabledTitle: chrome.i18n.getMessage("repeatDisabled"),
        repeatVideoEnabledTitle: chrome.i18n.getMessage("repeatVideoEnabled"),
        repeatPlaylistEnabledTitle: chrome.i18n.getMessage("repeatPlaylistEnabled"),
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            switch(this.model.get('state')) {
                case RepeatButtonState.DISABLED:
                    this.$el.attr('title', this.disabledTitle);
                    break;
                case RepeatButtonState.REPEAT_VIDEO_ENABLED:
                    this.$el.attr('title', this.repeatVideoEnabledTitle);
                    break;
                case RepeatButtonState.REPEAT_STREAM_ENABLED:
                    this.$el.attr('title', this.repeatPlaylistEnabledTitle);
                    break;
                default:
                    console.error("Unhandled repeatButtonState:", state);
                    break;
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:state', this.render);
        },
        
        toggleRepeat: function () {
            this.model.toggleRepeat();
        }
    });

    return RepeatButtonView;
});