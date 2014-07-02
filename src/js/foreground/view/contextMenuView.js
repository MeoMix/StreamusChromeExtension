define([
    'foreground/view/contextMenuItemView'
], function (ContextMenuItemView) {
    'use strict';

    var ContextMenuView = Backbone.Marionette.CompositeView.extend({
        id: 'context-menu',
        tagName: 'ul',
        childView: ContextMenuItemView,
        template: _.template(),
        //  Used to determine whether context-menu display should flip as to not overflow container
        containerHeight: 0,
        containerWidth: 0,
        
        initialize: function(options) {
            this.containerHeight = options.containerHeight;
            this.containerWidth = options.containerWidth;
        },

        onShow: function () {
            //  Prevent display outside viewport.
            var offsetTop = this.model.get('top');
            var needsVerticalFlip = offsetTop + this.$el.height() > this.containerHeight;
            if (needsVerticalFlip) {
                offsetTop = offsetTop - this.$el.height();
            }

            var offsetLeft = this.model.get('left');
            var needsHorizontalFlip = offsetLeft + this.$el.width() > this.containerWidth;
            if (needsHorizontalFlip) {
                offsetLeft = offsetLeft - this.$el.width();
            }
            
            //  Show the element before setting offset to ensure correct positioning.
            this.$el.offset({
                top: offsetTop,
                left: offsetLeft
            });
        }
    });

    return ContextMenuView;
});