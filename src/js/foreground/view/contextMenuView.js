define([
    'foreground/view/contextMenuItemView'
], function (ContextMenuItemView) {
    'use strict';

    var ContextMenuView = Backbone.Marionette.CompositeView.extend({
        id: 'context-menu',
        tagName: 'ul',

        itemView: ContextMenuItemView,
        
        //  Empty, just render the items.
        template: _.template(),
        
        //  Cache dimensions because they can't change.
        bodyHeight: $('body').height(),
        bodyWidth: $('body').width(),

        onShow: function () {

            //  Prevent display outside viewport.
            var offsetTop = this.model.get('top');
            var needsVerticalFlip = offsetTop + this.$el.height() > this.bodyHeight;
            if (needsVerticalFlip) {
                offsetTop = offsetTop - this.$el.height();
            }

            var offsetLeft = this.model.get('left');
            var needsHorizontalFlip = offsetLeft + this.$el.width() > this.bodyWidth;
            if (needsHorizontalFlip) {
                offsetLeft = offsetLeft - this.$el.width();
            }
            
            //  Show the element before setting offset to ensure correct positioning.
            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });
            
            this.applyTooltips();
        }
    });

    return ContextMenuView;
});