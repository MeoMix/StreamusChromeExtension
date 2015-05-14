define(function(require) {
    'use strict';

    var TooltipTemplate = require('text!template/tooltip/tooltip.html');

    var TooltipView = Marionette.ItemView.extend({
        className: 'tooltip',
        template: _.template(TooltipTemplate),

        ui: {
            content: '.tooltip-content'
        },

        //  Move the tooltip's location to a spot on the page and fade it in
        showAtOffset: function(offset) {
            this.$el.css(offset);
            this.$el.addClass('is-visible');
        },

        //  Fade out the tooltip and then destroy it once completely hidden
        hide: function() {
            this.$el.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
            this.$el.removeClass('is-visible');
        },

        _onTransitionOutComplete: function() {
            this.destroy();
        }
    });

    return TooltipView;
});