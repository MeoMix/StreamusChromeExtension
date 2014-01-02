//  When clicked -- skips to the last video. Skips from the begining of the list to the end. Skip to start of song if >5 seconds have passed.
define([
   'foreground/view/genericForegroundView',
    'text!template/previousButton.html'
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

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            var isEnabled = this.model.get('enabled');
            this.$el.toggleClass('disabled', !isEnabled);

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