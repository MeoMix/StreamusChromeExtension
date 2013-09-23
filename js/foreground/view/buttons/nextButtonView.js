//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define(function () {
    'use strict';

    var NextButtonView = Backbone.View.extend({

        className: 'disabled halfGradient nextButton',
        
        template: _.template($('#nextButtonTemplate').html()),
        
        events: {
            'click': 'trySelectNextVideo'
        },
        
        attributes: {
            title: chrome.i18n.getMessage("skipNextVideo")
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('disabled', !this.model.get('enabled'));
            
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