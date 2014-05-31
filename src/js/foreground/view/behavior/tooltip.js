define(function () {
    'use strict';

    var Tooltip = Backbone.Marionette.Behavior.extend({
        onRender: function () {
            this.$el.qtip();
        },
        
        onClose: function () {
            var api = this.$el.qtip('api');
            
            if (!_.isUndefined(api)) {
                api.destroy(true);
            }
        }
    });

    return Tooltip;
});