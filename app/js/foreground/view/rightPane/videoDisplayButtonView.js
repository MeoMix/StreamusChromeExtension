//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
   'foreground/view/genericForegroundView',
    'text!template/videoDisplayButton.htm'
], function (GenericForegroundView, VideoDisplayButtonTemplate) {
    'use strict';

    var VideoDisplayButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon',
        
        template: _.template(VideoDisplayButtonTemplate),
        
        //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
        model: chrome.extension.getBackgroundPage().VideoDisplayButton,
        
        events: {
            'click': 'toggleVideoDisplay'
        },
        
        attributes: {
            'id': 'videoDisplayButton'
        },
        
        enabledTitle: chrome.i18n.getMessage('videoDisplayEnabled'),
        disabledTitle: chrome.i18n.getMessage('videoDisplayDisabled'),
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('disabled', true);
            this.$el.attr('title', 'Video disabled until a bug is fixed in Google Chrome. Working on it!');

            //var enabled = this.model.get('enabled');

            //this.$el.toggleClass('enabled', enabled);
            
            //if (enabled) {
            //    this.$el.attr('title', this.enabledTitle);
            //} else {
            //    this.$el.attr('title', this.disabledTitle);
            //}
            
            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'change:enabled', this.render);
        },
        
        toggleVideoDisplay: function () {
            if (!this.$el.hasClass('disabled')) {
                this.model.toggleEnabled();
            }
            
        }

    });

    return VideoDisplayButtonView;
}); 