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
        
        //  TODO: Consider disabled titles
        attributes: {
            title: chrome.i18n.getMessage("backPreviousVideo")
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.prop('disabled', !this.model.get('enabled'));
            
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