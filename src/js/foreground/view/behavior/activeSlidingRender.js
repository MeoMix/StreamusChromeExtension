/* 
    Extend SlidingRender behavior with activeItem support. Views which have SlidingRender behavior don't necessarily
    have an activeItem in their collection. However, if they do have an activeItem, a bit more behavioral logic is necessary.
*/
define([
    'foreground/view/behavior/slidingRender'
], function (SlidingRender) {
    'use strict';

    var ActiveSlidingRender = SlidingRender.extend({
        
        collectionEvents: {
            'change:active': function (item, active) {
                if (active) {
                    this._scrollToItem(item);
                }
            }
        },

        onShow: function() {
            if (this.view.collection.length > 0) {
                this._scrollToItem(this.view.collection.getActiveItem());
            }
        },

        //  TODO: Animation?
        //  Ensure that the active item is visible by setting the container's scrollTop to a position which allows it to be seen.
        _scrollToItem: function (item) {
            var itemIndex = this.view.collection.indexOf(item);

            var overflowsTop = this._indexOverflowsTop(itemIndex);
            var overflowsBottom = this._indexOverflowsBottom(itemIndex);

            //  Only scroll to the item if it isn't in the viewport.
            if (overflowsTop || overflowsBottom) {
                var scrollTop = 0;

                //  If the item needs to be made visible from the bottom, offset the viewport's height:
                if (overflowsBottom) {
                    //  Add 1 to index because want the bottom of the element and not the top.
                    scrollTop = (itemIndex + 1) * this.itemViewHeight - this.viewportHeight;
                }
                else if (overflowsTop) {
                    scrollTop = itemIndex * this.itemViewHeight;
                }

                this.ui.list.scrollTop(scrollTop);
            }
        }

    });

    return ActiveSlidingRender;
});