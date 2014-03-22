define([
    'background/model/settings',
    //  TODO: It sucks I have to request Backbone.Marionette here. Use Behaviors?
    'backbone.marionette'
], function (Settings) {
    'use strict';

    Backbone.Marionette.View.prototype.applyTooltips = function () {

        //  Allow for globally disabling tooltips.
        if (Settings.get('showTooltips')) {

            var element = this.$el;
            var elementsNeedingTooltip = element.find('[title]');

            //  The element calling this might have a title, too!
            if (element.is('[title]')) {
                if (elementsNeedingTooltip.length > 0) {
                    elementsNeedingTooltip.add(element);
                } else {
                    elementsNeedingTooltip = element;
                }
            }

            //  Only show tooltips over title elements if the title is overflowing / can't be fully seen. Otherwise, remove the title so old tooltip style doesn't show.
            elementsNeedingTooltip.filter(function () {
                //  I've decorated some elements with the 'title' class to indicate that I should take into account the element's width to determine if an actual title should be shown.
                //  TODO: use a better class name than title. not very obvious.
                var needsTooltip = $(this).hasClass('title') && this.offsetWidth === this.scrollWidth;
                return needsTooltip;
            }).attr('title', '');

            if (elementsNeedingTooltip.length > 0) {

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
                    
            }
        }
    };

});