define([
    'foreground/model/settings',
    'backbone.marionette'
], function(Settings) {
    'use strict';

    Backbone.Marionette.View.prototype.applyTooltips = function() {

        //  Allow for globally disabling tooltips.
        if (Settings.get('showTooltips')) {

            var element = this.$el;

            //  Views might call this while rendering -- wrap in a setTimeout to allow them to finish rendering first.
            setTimeout(function() {
                var elementsNeedingTooltip = element.find('[title]');

                //  Only show tooltips over title elements if the title is overflowing / can't be fully seen. Otherwise, remove the title so old tooltip style doesn't show.
                elementsNeedingTooltip.filter(function() {
                    return $(this).hasClass('title') && this.offsetWidth === this.scrollWidth;
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

            });
        }
    };

})