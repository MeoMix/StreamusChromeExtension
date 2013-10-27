//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'text!../template/nextButton.htm'
], function (NextButtonTemplate) {
    'use strict';

    var NextButtonView = Backbone.View.extend({

        tagName: 'button',

        className: 'button-icon',
        
        template: _.template(NextButtonTemplate),
        
        events: {
            'click': 'trySelectNextVideo'
        },
        
        disabledTitle: chrome.i18n.getMessage('skipNextVideoDisabled'),
        enabledTitle: chrome.i18n.getMessage('skipNextVideo'),
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            var isEnabled = this.model.get('enabled');

            this.$el.prop('disabled', !isEnabled);
            
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
        
        trySelectNextVideo: function () {
            this.model.trySelectNextVideo();
        }

    });

    return NextButtonView;
}); 