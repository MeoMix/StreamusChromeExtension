//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'foreground/view/genericForegroundView',
    'foreground/model/buttons/videoDisplayButton',
    'text!template/videoDisplayButton.html'
], function (GenericForegroundView, VideoDisplayButton, VideoDisplayButtonTemplate) {
    'use strict';

    var VideoDisplayButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon',
        
        template: _.template(VideoDisplayButtonTemplate),
        
        //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
        model: VideoDisplayButton,
        
        events: {
            'click': 'toggleVideoDisplay'
        },
        
        enabledTitle: chrome.i18n.getMessage('videoDisplayEnabled'),
        disabledTitle: chrome.i18n.getMessage('videoDisplayDisabled'),
        
        render: function () {
            this.$el.html(this.template());
            this.subRender();
            
            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'change:enabled', this.subRender);
        },
        
        toggleVideoDisplay: function () {
            if (!this.$el.hasClass('disabled')) {
                this.model.toggleEnabled();
            }
        },
        
        //  It's important to have a subRendder method because modifying the element's HTML
        //  onClick messes with qTip's tooltip render -- swapping the title + HTML out, etc...
        subRender: function() {
            var enabled = this.model.get('enabled');
            this.$el.toggleClass('enabled', enabled);

            if (enabled) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }
        }

    });

    return VideoDisplayButtonView;
}); 