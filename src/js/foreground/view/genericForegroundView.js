define([
    'foreground/model/foregroundViewManager',
    'foreground/model/settings'
], function (ForegroundViewManager, Settings) {
    'use strict';
    
    //  See here for a description of the inheritance pattern used below: http://stackoverflow.com/questions/7735133/backbone-js-view-inheritance
    //  Enforce memory management between the Foreground and Backbone by making all
    //  foreground views stop listening to the background whenever the foreground is unloaded.
    var GenericForegroundView = function(options) {
        ForegroundViewManager.subscribe(this);
        Backbone.View.apply(this, [options]);
    };

    _.extend(GenericForegroundView.prototype, Backbone.View.prototype, {
        
        //  TODO: Make this called implicitly to reduce bugs... I keep forgetting to call it.
        initializeTooltips: function () {
            
            if (Settings.get('showTooltips')) {

                setTimeout(function() {

                    var elementsNeedingTooltip = this.$el.find('[title]');

                    //  Text elements need only show their tooltip if they're overflowing.
                    elementsNeedingTooltip.filter(function () {
                        var hideTooltip = false;
                        
                        //  TODO: Standardize this.
                        if ($(this).hasClass('playlistTitle') || $(this).hasClass('title') || $(this).hasClass('item-title')) {
                            hideTooltip = this.offsetWidth === this.scrollWidth;
                        }

                        return hideTooltip;
                    }).attr('title', '');

                    elementsNeedingTooltip.qtip({
                        position: {
                            viewport: $(window),
                            my: 'top center',
                            at: 'bottom center'
                        },
                        style: {
                            classes: 'qtip-light qtip-shadow'
                        }
                    });
                    
                }.bind(this));
                
            }

        }
        
    });

    GenericForegroundView.extend = Backbone.View.extend;
    return GenericForegroundView;
});