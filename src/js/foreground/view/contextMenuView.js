define([
    'foreground/model/foregroundViewManager',
    'foreground/view/contextMenuItemView'
], function (ForegroundViewManager, ContextMenuItemView) {
    'use strict';

    var ContextMenuView = Backbone.Marionette.CollectionView.extend({
        id: 'context-menu',
        tagName: 'ul',

        itemView: ContextMenuItemView,

        onRender: function () {

            //  Prevent display outside viewport.
            var offsetTop = this.top;
            var needsVerticalFlip = offsetTop + this.$el.height() > this.$el.parent().height();

            if (needsVerticalFlip) {
                offsetTop = offsetTop - this.$el.height();
            }

            var offsetLeft = this.left;
            var needsHorizontalFlip = offsetLeft + this.$el.width() > this.$el.parent().width();
            if (needsHorizontalFlip) {
                offsetLeft = offsetLeft - this.$el.width();
            }
            
            this.applyTooltips();

            //  Show the element before setting offset to ensure correct positioning.
            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });
        },
        
        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },
        
        //  Displays the context menu at given x,y coordinates.
        show: function (options) {
            if (options.top === undefined || options.left === undefined) throw "ContextMenu must be shown with top/left coordinates.";

            this.top = options.top;
            this.left = options.left;

            console.log("Re-rendering contextMenuView", this.top, this.left);

            this.render();
        }
    });

    return ContextMenuView;
});