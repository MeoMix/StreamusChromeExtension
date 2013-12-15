//  When clicked -- skips to the last video. Skips from the begining of the list to the end. Skip to start of song if >5 seconds have passed.
define([
    'genericForegroundView',
    'text!../template/previousButton.htm'
], function (GenericForegroundView, PreviousButtonTemplate) {
    'use strict';

    var PreviousButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon',

        template: _.template(PreviousButtonTemplate),
        
        //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
        model: chrome.extension.getBackgroundPage().PreviousButton,
        
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
        },
        
        tryDoTimeBasedPrevious: function () {
            this.model.tryDoTimeBasedPrevious();
        }
        
    });

    return PreviousButtonView;
});