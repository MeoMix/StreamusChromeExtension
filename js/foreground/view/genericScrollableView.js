define([
        
], function () {
    'use strict';

    var GenericScrollableView = Backbone.View.extend({

        doAutoScroll: function (event) {

            var scrollElement = $(event.target);
            var direction = scrollElement.data('direction');

            //  TODO: Make it so only lists use this.
            var list = this.list || this.$el;

            list.autoscroll({
                direction: direction,
                step: 150,
                scroll: true
            });

            var pageX = event.pageX;
            var pageY = event.pageY;

            //  Keep track of pageX and pageY while the mouseMoveInterval is polling.
            list.on('mousemove', function (mousemoveEvent) {
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
            //  TODO: Make it so only lists use this.
            var list = this.list || this.$el;
            
            list.autoscroll('destroy');
            list.off('mousemove');
            clearInterval(this.scrollMouseMoveInterval);
        }
    });

    return GenericScrollableView;
});