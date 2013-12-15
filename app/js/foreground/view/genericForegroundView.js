define([
    'foregroundViewManager'
], function (ForegroundViewManager) {
    'use strict';
    
    //  See here for a description of the inheritance pattern used below: http://stackoverflow.com/questions/7735133/backbone-js-view-inheritance
    //  Enforce memory management between the Foreground and Backbone by making all
    //  foreground views stop listening to the background whenever the foreground is unloaded.
    var GenericForegroundView = function(options) {
        ForegroundViewManager.get('views').push(this);
        Backbone.View.apply(this, [options]);
    };

    _.extend(GenericForegroundView.prototype, Backbone.View.prototype, {
        
        initializeTooltips: function() {
            this.$el.find('[title]:enabled').qtip({
                position: {
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow'
                }
            });
        }
        
    });

    GenericForegroundView.extend = Backbone.View.extend;
    return GenericForegroundView;
});