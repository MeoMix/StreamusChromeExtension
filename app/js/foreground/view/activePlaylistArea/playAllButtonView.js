define([
    'text!../template/playAllButton.htm',
    'streamItems'
], function (PlayAllButtonTemplate, StreamItems) {
    'use strict';

    var PlayAllButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-label playAll',
                                
        template: _.template(PlayAllButtonTemplate),

        enabledTitle: chrome.i18n.getMessage("playAll"),
        disabledTitle: chrome.i18n.getMessage("playAllDisabled"),
        
        events: {
            'click': 'addToStreamAndPlay'
        },

        render: function () {
            this.$el.html(this.template());

            var disabled = this.model.get('items').length === 0;

            this.$el.toggleClass('disabled', disabled);

            if (disabled) {
                this.$el.attr('title', this.disabledTitle);
            } else {
                this.$el.attr('title', this.enabledTitle);
            }

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model.get('items'), 'add addMultiple remove empty', this.render);
        },
        
        addToStreamAndPlay: function () {
            if (!this.$el.hasClass('disabled')) {
                StreamItems.addByPlaylist(this.model, true);
            }
        }
        
    });
    
    return PlayAllButtonView;
});