//  When clicked -- skips to the last video. Skips from the begining of the list to the end. Skip to start of song if >5 seconds have passed.
define([
    'text!../template/previousButton.htm'
], function (PreviousButtonTemplate) {
    'use strict';

    var PreviousButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-icon',

        template: _.template(PreviousButtonTemplate),
        
        events: {
            'click': 'tryDoTimeBasedPrevious'
        },
        
        disabledTitle: chrome.i18n.getMessage('backPreviousVideoDisabled'),
        enabledTitle: chrome.i18n.getMessage('backPreviousVideo'),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            var isEnabled = this.model.get('enabled');

            this.$el.toggleClass('disabled', !isEnabled);

            if (isEnabled) {
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
        
        tryDoTimeBasedPrevious: function () {
            this.model.tryDoTimeBasedPrevious();
        }
        
    });

    return PreviousButtonView;
});