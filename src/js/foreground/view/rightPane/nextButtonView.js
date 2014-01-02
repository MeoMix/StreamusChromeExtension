//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
   'foreground/view/genericForegroundView',
    'text!template/nextButton.html'
], function (GenericForegroundView, NextButtonTemplate) {
    'use strict';

    var NextButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon',
        
        //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
        model: chrome.extension.getBackgroundPage().NextButton,
        
        template: _.template(NextButtonTemplate),
        
        events: {
            'click': 'trySelectNextVideo'
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
        
        trySelectNextVideo: function () {
            this.model.trySelectNextVideo();
        }

    });

    return NextButtonView;
}); 