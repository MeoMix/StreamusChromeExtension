define(function () {
    'use strict';

    var Tooltip = Backbone.Marionette.Behavior.extend({
        ui: {
            //  Children which need tooltips are decorated with the tooltipable class.
            tooltipable: '.tooltipable'
        },

        onShow: function () {
            this.$el.qtip();
            this.ui.tooltipable.qtip();
        },
        
        onClose: function () {
            this._destroy();
        },
        
        //  Unbind qTip to allow the GC to clean-up everything.
        //  Memory leak will happen if this is not called.
        _destroy: function () {
            this.$el.qtip('destroy', true);
            this.ui.tooltipable.qtip('destroy', true);
        }
    });

    return Tooltip;
});