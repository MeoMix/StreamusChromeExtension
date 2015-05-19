define(function(require) {
    'use strict';

    var SimpleMenuItemView = require('foreground/view/simpleMenu/simpleMenuItemView');
    var Scrollable = require('foreground/view/behavior/scrollable');

    var SimpleMenuItemsView = Marionette.CollectionView.extend({
        className: 'menu-simpleItems',
        childView: SimpleMenuItemView,
        template: false,

        behaviors: {
            Scrollable: {
                behaviorClass: Scrollable
            }
        },

        //  Adjust the scrollTop of the view to ensure that the active item is shown.
        ensureActiveIsVisible: function() {
            var activeItem = this.collection.getActive();

            if (!_.isUndefined(activeItem)) {
                var activeView = this.children.find(function(child) {
                    return child.model === activeItem;
                });

                //  Center element in list if possible.
                var offsetTop = activeView.el.offsetTop;
                var centerHeight = activeView.$el.height() / 2;
                var center = offsetTop - (this.$el.innerHeight() / 2) + centerHeight;
                this.el.scrollTop = center;
            }
        },

        //  Return information indicating the position of the active model's view in the collection
        getActiveItemOffsetData: function() {
            var activeItemIndex = this.collection.indexOf(this.collection.getActive());
            var itemHeight = this.children.first().$el.height();
            //  Account for the fact that the view could be scrolling to show the child so that an offset derived just by index is insufficient.
            var activeItemOffset = activeItemIndex * -itemHeight + this.el.scrollTop;

            return {
                itemHeight: itemHeight,
                itemOffset: activeItemOffset
            };
        }
    });

    return SimpleMenuItemsView;
});