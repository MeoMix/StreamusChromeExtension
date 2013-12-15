define([
    'genericForegroundView'
], function (GenericForegroundView) {
    'use strict';

    var GenericScrollableView = GenericForegroundView.extend({
        
        bindDroppable: function(accept) {
            var self = this;
            
            this.$el.find('.scroll').droppable({
                tolerance: 'pointer',
                //  Prevent stuttering of tooltips and general oddities by being specific with accept
                accept: accept,
                over: function (event) {
                    self.doAutoScroll(event);
                },
                drop: function () {
                    self.stopAutoScroll();
                },
                out: function () {
                    self.stopAutoScroll();
                }
            });
            
        },
        
        doAutoScroll: function (event) {

            var scrollElement = $(event.target);
            var direction = scrollElement.data('direction');

            this.$el.autoscroll({
                direction: direction,
                step: 150,
                scroll: true
            });

            var pageX = event.pageX;
            var pageY = event.pageY;

            //  Keep track of pageX and pageY while the mouseMoveInterval is polling.
            this.$el.on('mousemove', function (mousemoveEvent) {
                pageX = mousemoveEvent.pageX;
                pageY = mousemoveEvent.pageY;
            });

            //  Causes the droppable hover to stay correctly positioned.
            this.scrollMouseMoveInterval = setInterval(function () {

                var mouseMoveEvent = $.Event('mousemove');

                mouseMoveEvent.pageX = pageX;
                mouseMoveEvent.pageY = pageY;

                $(document).trigger(mouseMoveEvent);
            }, 100);

        },

        stopAutoScroll: function () {
            this.$el.autoscroll('destroy');
            this.$el.off('mousemove');
            clearInterval(this.scrollMouseMoveInterval);
        }
    });

    return GenericScrollableView;
});