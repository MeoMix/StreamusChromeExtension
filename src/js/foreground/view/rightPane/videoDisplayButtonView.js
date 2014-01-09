//  When clicked -- goes to the next video. Can potentially go from the end of the list to the front if repeat playlist is toggled on
define([
    'foreground/view/genericForegroundView',
    'foreground/model/buttons/videoDisplayButton',
    'text!template/videoDisplayButton.html'
], function (GenericForegroundView, VideoDisplayButton, VideoDisplayButtonTemplate) {
    'use strict';

    var VideoDisplayButtonView = GenericForegroundView.extend({

        tagName: 'button',

        className: 'button-icon videoDisplay',
        
        template: _.template(VideoDisplayButtonTemplate),
        
        //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
        model: VideoDisplayButton,
        
        events: {
            'click': 'toggleVideoDisplay'
        },
        
        enabledTitle: chrome.i18n.getMessage('hideVideo'),
        disabledTitle: chrome.i18n.getMessage('showVideo'),
        
        render: function () {
            this.$el.html(this.template());
            this.subRender();

            //  TODO: disabled for now.
            this.$el.hide();
            
            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'change:enabled change:disabled', this.subRender);
        },
        
        toggleVideoDisplay: function () {
            if (!this.$el.hasClass('disabled')) {
                this.model.toggleEnabled();
            }
        },
        
        //  It's important to have a subRendder method because modifying the element's HTML
        //  onClick messes with qTip's tooltip render -- swapping the title + HTML out, etc...
        subRender: function () {

            var disabled = this.model.get('disabled');
            this.$el.toggleClass('disabled', disabled);

            //  TODO: seems odd to keep track of both enabed and disabled -- disabled means it can't be opened, enabled means it is opened.
            //  perhaps enabled should be active.
            var enabled = this.model.get('enabled');

            if (enabled) {
                this.$el.attr('title', this.enabledTitle);
            } else {
                this.$el.attr('title', this.disabledTitle);
            }
        }

    });

    return VideoDisplayButtonView;
}); 